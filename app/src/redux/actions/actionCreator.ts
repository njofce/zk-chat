import {
  create_direct_room,
  create_private_room,
  create_public_room,
  get_chat_history,
  get_rooms,
  join_private_room
} from "rln-client-lib";
import {
  IDirectRoom,
  IPrivateRoom,
  IPublicRoom
} from "rln-client-lib/dist/src/room/interfaces";

export type Room = IDirectRoom | IPublicRoom | IPrivateRoom;

export const ADD_ACTIVE_CHAT_ROOM = "ADD_ACTIVE_CHAT_ROOM";
export const addActiveChatRoom = (room: Room | undefined) => ({
  type: ADD_ACTIVE_CHAT_ROOM,
  meta: room
});

export const GET_ROOMS = "GET_ROOMS";
export const getRoomsAction = () => ({
  type: GET_ROOMS,
  promise: get_rooms()
});

export const CREATE_PUBLIC_ROOM = "CREATE_PUBLIC_ROOM";
export const createPublicRoomAction = (name: string) => ({
  type: CREATE_PUBLIC_ROOM,
  promise: create_public_room(name)
});

export const CREATE_PRIVATE_ROOM = "CREATE_PRIVATE_ROOM";
export const createPrivateRoomAction = (name: string) => ({
  type: CREATE_PRIVATE_ROOM,
  promise: create_private_room(name)
});

export const joinPrivateRoomAction = (invite: string) => ({
  type: CREATE_PRIVATE_ROOM,
  promise: join_private_room(invite)
});

export const CREATE_DIRECT_ROOM = "CREATE_DIRECT_ROOM";
export const createDirectRoomAction = (
  name: string,
  receiver_public_key: string
) => ({
  type: CREATE_DIRECT_ROOM,
  promise: create_direct_room(name, receiver_public_key)
});

export const ADD_MESSAGE_TO_ROOM = "ADD_MESSAGE_TO_ROOM";
export const addMessageToRoomAction = (message: string, roomId: string) => ({
  type: ADD_MESSAGE_TO_ROOM,
  meta: { message, roomId }
});

export const GET_CHAT_HISTORY = "GET_CHAT_HISTORY";
export const getChatHistoryAction = () => ({
  type: GET_CHAT_HISTORY,
  promise: get_chat_history()
});
