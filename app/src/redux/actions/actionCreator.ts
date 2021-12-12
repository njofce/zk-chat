export const CREATE_ROOM = "CREATE_ROOM";
export const createRoomAction = (roomType: string, data: any) => ({
  type: CREATE_ROOM,
  meta: { roomType, data }
});

export const ADD_ACTIVE_CHAT_ROOM = "ADD_ACTIVE_CHAT_ROOM";
export const addActiveChatRoom = (roomType: string, data: any) => ({
  type: ADD_ACTIVE_CHAT_ROOM,
  meta: { roomType, data }
});