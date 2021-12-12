import { DefaultRootState } from "react-redux";
import { AnyAction } from "redux";
import { CREATE_ROOM, ADD_ACTIVE_CHAT_ROOM } from "../actions/actionCreator";

const defaultState: any = {
  test: [],
  rooms: [],
  currentActiveRoom: {roomType: "", roomName: ""}
};

const TestReducer = (state: any = defaultState, action: AnyAction) => {
  const { type, payload, meta } = action;
  switch (type) {
    case CREATE_ROOM: {
      return {
        // rooms: [...state.rooms, meta],
        currentActiveRoom: { roomType: meta.roomType, roomName: meta.data.name }
      };
    }
    case ADD_ACTIVE_CHAT_ROOM: {
      return {
        currentActiveRoom: { roomType: meta.roomType, roomName: meta.data.name }
      };
    }

    default:
      return state;
  }
};

export default TestReducer;
