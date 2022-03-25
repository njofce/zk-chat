import {
  create_direct_room,
  create_private_room,
  create_public_room,
  get_rooms,
  join_private_room,
  get_contacts,
  delete_messages_for_room,
  get_messages_for_room,
  get_messages_for_rooms,
  sync_message_history
} from "rln-client-lib"
import { IMessage } from "rln-client-lib/dist/src/chat/interfaces"
import {
  IDirectRoom,
  IPrivateRoom,
  IPublicRoom
} from "rln-client-lib/dist/src/room/interfaces"

export type Room = IDirectRoom | IPublicRoom | IPrivateRoom

export const ADD_ACTIVE_CHAT_ROOM = "ADD_ACTIVE_CHAT_ROOM"
export const addActiveChatRoom = (room: Room | undefined) => ({
  type: ADD_ACTIVE_CHAT_ROOM,
  meta: room
})

export const GET_ROOMS = "GET_ROOMS"
export const getRoomsAction = () => ({
  type: GET_ROOMS,
  promise: get_rooms()
})

export const CREATE_PUBLIC_ROOM = "CREATE_PUBLIC_ROOM"
export const createPublicRoomAction = (name: string) => ({
  type: CREATE_PUBLIC_ROOM,
  promise: create_public_room(name)
})

export const CREATE_PRIVATE_ROOM = "CREATE_PRIVATE_ROOM"
export const createPrivateRoomAction = (name: string) => ({
  type: CREATE_PRIVATE_ROOM,
  promise: create_private_room(name)
})

export const joinPrivateRoomAction = (invite: string) => ({
  type: CREATE_PRIVATE_ROOM,
  promise: join_private_room(invite)
})

export const CREATE_DIRECT_ROOM = "CREATE_DIRECT_ROOM"
export const createDirectRoomAction = (
  name: string,
  receiver_public_key: string
) => ({
  type: CREATE_DIRECT_ROOM,
  promise: create_direct_room(name, receiver_public_key)
})

export const ADD_MESSAGE_TO_ROOM = "ADD_MESSAGE_TO_ROOM"
export const addMessageToRoomAction = (message: IMessage, roomId: string) => ({
  type: ADD_MESSAGE_TO_ROOM,
  meta: { message, roomId }
})

export const RUN_SYNC_MESSAGE_HISTORY = "RUN_SYNC_MESSAGE_HISTORY"
export const runSyncMessageHistory = (meta?: any) => ({
  type: RUN_SYNC_MESSAGE_HISTORY,
  promise: sync_message_history(),
  meta
})

export const LOAD_MESSAGES_FOR_ROOM = "LOAD_MESSAGES_FOR_ROOM"
export const loadMessagesForRoom = (
  roomId: string,
  fromTimestamp: number,
  shouldReset: boolean = false,
  meta: any
) => ({
  type: LOAD_MESSAGES_FOR_ROOM,
  meta: { roomId, shouldReset, ...meta },
  promise: get_messages_for_room(roomId, fromTimestamp)
})

export const LOAD_MESSAGES_FOR_ROOMS = "LOAD_MESSAGES_FOR_ROOMS"
export const loadMessagesForRooms = (
  roomIds: string[],
  fromTimestamp: number
) => ({
  type: LOAD_MESSAGES_FOR_ROOMS,
  meta: { roomIds },
  promise: get_messages_for_rooms(roomIds, fromTimestamp)
})

export const DELETE_MESSAGES_FOR_ROOM = "DELETE_MESSAGES_FOR_ROOM"
export const deleteMessagesForRoom = (roomId: string) => ({
  type: DELETE_MESSAGES_FOR_ROOM,
  meta: { roomId },
  promise: delete_messages_for_room(roomId)
})

export const GET_TRUSTED_CONTACTS = "GET_TRUSTED_CONTACTS"
export const getTrustedContacts = () => ({
  type: GET_TRUSTED_CONTACTS,
  promise: get_contacts()
})
