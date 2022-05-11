import { SocketClient } from './communication/interfaces';
import { LocalStorageProvider } from './storage/local_storage';
import { ServerCommunication } from "./communication";
import { ICryptography, IKeyPair } from "./crypto/interfaces"
import ProfileManager from "./profile"
import { StorageProvider } from "./storage/interfaces"
import WebCryptography from './crypto/web_cryptography';
import { IRooms, ITrustedContact } from './profile/interfaces';
import { IServerConfig } from './interfaces';
import ChatManager from './chat';
import { v4 as uuidv4 } from 'uuid';
import { groupBy } from './util';
import RLNServerApi from './communication/api';
import { IPrivateRoom, IDirectRoom } from './room/interfaces';
import WebsocketClient from './communication/websocket';
import WsSocketClient from './communication/ws-socket';
import KeyExchangeManager from './key-exchange';
import { IChatHistoryDB, IMessage } from './chat/interfaces';
import { LocalChatDB } from './chat/db';

let communication: ServerCommunication | null = null;
let generated_storage_provider: StorageProvider | null = null;
let generated_cryptography: ICryptography | null = null;
let profile_manager: ProfileManager | null = null;
let key_exchange_manager: KeyExchangeManager | null = null;
let chat_manager: ChatManager;
let message_db: IChatHistoryDB;

let get_proof_callback: (nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: any) => Promise <any>;

const init = async (
    server_config: IServerConfig,
    proof_generator_callback: (nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: any) => Promise < any >,
    identitiy_commitment?: string, 
    storage_provider?: StorageProvider, 
    cryptography?: ICryptography) => {

    if (communication == null) {
        let socket_client: SocketClient;
        if (window != undefined) {
            socket_client = new WebsocketClient(server_config.socketUrl);
        } else {
            socket_client = new WsSocketClient(server_config.socketUrl);
        }

        communication = new ServerCommunication(new RLNServerApi(server_config.serverUrl), socket_client);
        await communication.init();
    }

    if (message_db == null) {
        message_db = new LocalChatDB();
    }
    
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
    chat_manager = new ChatManager(profile_manager, communication, generated_cryptography, message_db);

    const root: string = await communication.getRlnRoot();
    const leaves: string[] = await communication.getLeaves();

    if (identitiy_commitment) {
        // Create a new profile
        await profile_manager.initProfile(identitiy_commitment, root, leaves);
    } else {
        const loadedProfile: boolean = await profile_manager.loadProfile();
        if (!loadedProfile) {
            throw "No profile exists";
        }
        await profile_manager.updateRootHash(root);
        await profile_manager.updateLeaves(leaves);
    }

    get_proof_callback = proof_generator_callback;

    if (key_exchange_manager == null) {
        key_exchange_manager = new KeyExchangeManager(communication, generated_cryptography, chat_manager, profile_manager, get_proof_callback);
        key_exchange_manager.init();
    }

    // listen to events
    await communication.receiveEvent(syncRlnData);
}

const get_rooms = async (): Promise<IRooms> => {
    if (profile_manager == null)
        throw "init() not called";

    return await profile_manager.getRooms();
}

const send_message = async (chat_room_id: string, raw_message: string) => {
    if (communication == null)
        throw "init() not called";
    await chat_manager.sendMessage(chat_room_id, raw_message, get_proof_callback);
}

const receive_message = async(receive_msg_callback: (message: IMessage, chat_room_id: string) => void) => {
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

    const room = {
        id: room_id,
        name: name,
        type: "PUBLIC",
        symmetric_key: symmetric_key
    };

    await profile_manager.addPublicRoom(room);

    return room;
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

    const room: IPrivateRoom = {
        id: room_id,
        name: name,
        type: "PRIVATE",
        symmetric_key: symmetric_key
    };

    await profile_manager.addPrivateRoom(room);

    return room;
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

    const room: IPrivateRoom = {
        id: room_id,
        name: room_name,
        type: "PRIVATE",
        symmetric_key: room_symmetric_key
    };
    await profile_manager.addPrivateRoom(room);

    return room;
}

/**
 * @deprecated since automated key exchange
 */
const generate_encrypted_invite_direct_room = async(room_id: string) => {
   return "";
}

/**
 * @deprecated since automated key exchange
 */
const update_direct_room_key = async (room_id: string, encrypted_symmetric_key: string) => {}

const create_direct_room = async (name: string, receiver_public_key: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    if (name.length > ProfileManager.ROOM_NAME_MAX_LENGTH)
        throw "Room name cannot have more than " + ProfileManager.ROOM_NAME_MAX_LENGTH + " characters";

    const room_id = uuidv4();
    
    const dh_keypair: IKeyPair = await generated_cryptography.generateECDHKeyPair()

    const room: IDirectRoom = {
        id: room_id,
        name: name,
        type: "DIRECT",
        symmetric_key: "",
        recipient_public_key: receiver_public_key,
        dh_public_key: dh_keypair.publicKey,
        dh_private_key: dh_keypair.privateKey
    };

    await profile_manager.addDirectRoom(room);

    await key_exchange_manager?.saveKeyExchangeBundle(dh_keypair.publicKey, receiver_public_key);
    
    return room;
}

/**
 * @deprecated use persistent storage for chat history.
 */
const get_chat_history = async () => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    const daily_chat_history: any[] = await communication.getChatHistory()
    const decrypted_messages: any[] = [];

    for (let message of daily_chat_history) {
        const [decrypted, roomId] = await chat_manager.decryptMessage(message);

        if (decrypted != null && roomId != null) {
            decrypted_messages.push({
                ...decrypted,
                room_id: roomId
            });
        }
    }

    return groupBy(decrypted_messages, "room_id");
}

const sync_message_history = async () => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    const timestampNow: number = new Date().getTime();

    await chat_manager.syncMessagesForAllRooms(timestampNow);
}

const delete_messages_for_room = async(room_id: string) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    await chat_manager.deleteMessageHistoryForRoom(room_id);
}

const get_messages_for_room = async(room_id: string, from_timestamp: number) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    return await chat_manager.loadMessagesForRoom(room_id, from_timestamp);
}

const get_messages_for_rooms = async (room_ids: string[], from_timestamp: number) => {
    if (generated_cryptography == null || communication == null || profile_manager == null)
        throw "init() not called";

    return await chat_manager.loadMessagesForRooms(room_ids, from_timestamp);
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
    
    // Refresh root and leaves
    await chat_manager.setRootObsolete();
    await chat_manager.checkRootUpToDate();
}

const update_username = async (newName: string) => {
    if (profile_manager == null)
        throw "init() not called";

    await profile_manager.updateUsername(newName)
}

const get_user_handle = async () => {
    if (profile_manager == null)
        throw "init() not called";

    return await profile_manager.getUserHandle()
}

const get_username = () => {
    if (profile_manager == null)
        throw "init() not called";

    return profile_manager.getUserName()
}

const get_contacts = async() => {
    if (profile_manager == null)
        throw "init() not called";

    return await profile_manager.getTrustedContacts();
}

const get_contact = async (name: string): Promise<ITrustedContact> => {
    if (profile_manager == null)
        throw "init() not called";

    return profile_manager.getTrustedContact(name);
}

const insert_contact = async (name: string, public_key: string) => {
    if (profile_manager == null)
        throw "init() not called";

    await profile_manager.insertTrustedContact(name, public_key);
}

const delete_contact = async(name: string) => {
    if (profile_manager == null)
        throw "init() not called";

    await profile_manager.deleteTrustedContact(name);
}

const update_contact = async (old_name: string, new_name: string, public_key: string) => {
    if (profile_manager == null)
        throw "init() not called";

    await profile_manager.updateTrustedContact(old_name, new_name, public_key);
}

const syncRlnData = (event: string) => {
    console.log("Received event: ", event);
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
    sync_message_history,
    delete_messages_for_room,
    get_messages_for_room,
    get_messages_for_rooms,
    get_public_key,
    export_profile,
    recover_profile,
    get_contacts,
    get_contact,
    insert_contact,
    delete_contact,
    update_contact,
    update_username,
    get_user_handle,
    get_username
}