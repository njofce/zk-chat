import { SocketClient } from './communication/interfaces';
import { LocalStorageProvider } from './storage/local_storage';
import { ServerCommunication } from "./communication";
import { ICryptography } from "./crypto/interfaces"
import ProfileManager from "./profile"
import { StorageProvider } from "./storage/interfaces"
import WebCryptography from './crypto/web_cryptography';
import { IRooms } from './profile/interfaces';
import { IServerConfig } from './interfaces';
import ChatManager from './chat';
import { v4 as uuidv4 } from 'uuid';
import { groupBy } from './util';
import RLNServerApi from './communication/api';
import { IPrivateRoom } from './room/interfaces';
import WebsocketClient from './communication/websocket';
import WsSocketClient from './communication/ws-socket';

let communication: ServerCommunication | null = null;
let generated_storage_provider: StorageProvider | null = null;
let generated_cryptography: ICryptography | null = null;
let profile_manager: ProfileManager | null = null;
let chat_manager: ChatManager;

const init = async (
    server_config: IServerConfig,
    identitiy_commitment?: string, 
    identity_secret?: string[], 
    storage_provider?: StorageProvider, 
    cryptography?: ICryptography) => {

    let socket_client: SocketClient;
    if (window != undefined) {
        socket_client = new WebsocketClient(server_config.socketUrl);
    } else {
        socket_client = new WsSocketClient(server_config.socketUrl);
    }

    communication = new ServerCommunication(new RLNServerApi(server_config.serverUrl), socket_client);
    await communication.init();
    
    if (storage_provider) {
        generated_storage_provider = storage_provider;
    } else {
        generated_storage_provider = new LocalStorageProvider();
    }

    if (cryptography) {
        generated_cryptography = cryptography;
    } else {
        generated_cryptography = new WebCryptography();
    }

    profile_manager = new ProfileManager(generated_storage_provider, generated_cryptography);
    chat_manager = new ChatManager(profile_manager, communication, generated_cryptography);

    if (identitiy_commitment && identity_secret) {
        // Create a new profile
        const auth_path = await communication.getUserAuthPath(identitiy_commitment);
        const root = await communication.getRlnRoot();
        await profile_manager.initProfile(identitiy_commitment, identity_secret, root, JSON.stringify(auth_path));
    } else {
        const loadedProfile: boolean = await profile_manager.loadProfile();

        if (!loadedProfile) {
            throw "No profile exists";
        }
    }

    // listen to events
    await communication.receiveEvent(syncRlnData);
}

const get_rooms = async (): Promise<IRooms> => {
    if (profile_manager == null)
        throw "init() not called";

    return await profile_manager.getRooms();
}

const send_message = async(chat_room_id: string, raw_message: string) => {
    if (communication == null)
        throw "init() not called";
    await chat_manager.sendMessage(chat_room_id, raw_message);
}

const receive_message = async(receive_msg_callback: (message: any, chat_room_id: string) => void) => {
    if (profile_manager == null || chat_manager == null)
        throw "init() not called";

    await chat_manager.registerReceiveMessageHandler(receive_msg_callback);
}

const create_public_room = async(name: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    if (name.length > ProfileManager.ROOM_NAME_MAX_LENGTH)
        throw "Room name cannot have more than " + ProfileManager.ROOM_NAME_MAX_LENGTH + " characters";

    const room_id = uuidv4();
    const symmetric_key: string = await generated_cryptography.generateSymmetricKey();
    const created = await communication.createPublicRoom(room_id, name, symmetric_key);
    
    if (created == null)
        throw "Server error! Room could not be created";

    await profile_manager.addPublicRoom({
        id: room_id,
        name: name,
        type: "PUBLIC",
        symmetric_key: symmetric_key
    });
}

const join_public_room = async(room_id: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    try {
        await profile_manager.getRoomById(room_id);
    } catch(e) {
        const room_from_server = await communication.getPublicRoom(room_id);

        if (room_from_server != null) {
            await profile_manager.addPublicRoom({
                id: room_from_server.uuid,
                name: room_from_server.name,
                type: "PUBLIC",
                symmetric_key: room_from_server.symmetric_key,
            });
            return;
        } else {
            throw "Unknown room";
        }
    }
    throw "Room already exists as part of your profile.";
    
}

const create_private_room = async (name: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    if (name.length > ProfileManager.ROOM_NAME_MAX_LENGTH)
        throw "Room name cannot have more than " + ProfileManager.ROOM_NAME_MAX_LENGTH + " characters";

    const room_id = uuidv4();
    const symmetric_key: string = await generated_cryptography.generateSymmetricKey();

    await profile_manager.addPrivateRoom({
        id: room_id,
        name: name,
        type: "PRIVATE",
        symmetric_key: symmetric_key
    });
}

const invite_private_room = async (room_id: string, recipient_public_key: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    const room: IPrivateRoom = await profile_manager.getRoomById(room_id);

    const data_to_encrypt = JSON.stringify([room.symmetric_key, room.id, room.name]);

    return await generated_cryptography.encryptMessageAsymmetric(data_to_encrypt, recipient_public_key);
}

const join_private_room = async (encrypted_invite: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    const user_private_key = await profile_manager.getPrivateKey();
    const [room_symmetric_key, room_id, room_name] = JSON.parse(await generated_cryptography.decryptMessageAsymmetric(encrypted_invite, user_private_key));

    await profile_manager.addPrivateRoom({
        id: room_id,
        name: room_name,
        type: "PRIVATE",
        symmetric_key: room_symmetric_key
    });
}

const generate_encrypted_invite_direct_room = async(room_id: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    return await profile_manager.generateEncryptedInviteDirectRoom(room_id);
}

const update_direct_room_key = async (room_id: string, encrypted_symmetric_key: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    return await profile_manager.updateDirectRoomKey(room_id, encrypted_symmetric_key);
}

const create_direct_room = async (name: string, receiver_public_key: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    if (name.length > ProfileManager.ROOM_NAME_MAX_LENGTH)
        throw "Room name cannot have more than " + ProfileManager.ROOM_NAME_MAX_LENGTH + " characters";

    const room_id = uuidv4();
    const symmetric_key: string = await generated_cryptography.generateSymmetricKey();

    await profile_manager.addDirectRoom({
        id: room_id,
        name: name,
        type: "DIRECT",
        symmetric_key: symmetric_key,
        recipient_public_key: receiver_public_key
    });
}

const get_chat_history = async () => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    const room_ids: string[] = await profile_manager.getRoomIds();

    const daily_chat_history: any[] = await communication.getChatHistory(room_ids)
    const decrypted_messages: any[] = [];

    for (let message of daily_chat_history) {
        const [decrypted, roomId] = await chat_manager.decryptMessage(message);

        if (decrypted != null && roomId != null) {
            decrypted['room_id'] = roomId;
            decrypted_messages.push(decrypted);
        }
    }

    return groupBy(decrypted_messages, "room_id");
}

const get_public_key = async() => {
    if (profile_manager == null)
        throw "init() not called";

    return await profile_manager.getPublicKey();
}

const export_profile = async() => {
    if (profile_manager == null)
        throw "init() not called";

    return await profile_manager.exportProfile();
}

const recover_profile = async (profile_data: string) => {
    if (profile_manager == null)
        throw "init() not called";

    const parsed_profile_data = JSON.parse(profile_data);
    
    if (await profile_manager.validateFormat(parsed_profile_data) == false)
        throw "Profile data invalid";

    await profile_manager.recoverProfile(parsed_profile_data);
}

const syncRlnData = (event: string) => {
    if (chat_manager != null) {
        chat_manager.setRootObsolete();
    }
}

export { 
    init, 
    get_rooms, 
    send_message, 
    receive_message, 
    create_public_room, 
    join_public_room,
    create_private_room, 
    invite_private_room, 
    join_private_room, 
    generate_encrypted_invite_direct_room,
    update_direct_room_key,
    create_direct_room, 
    get_chat_history, 
    get_public_key,
    export_profile,
    recover_profile
}