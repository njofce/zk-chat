import { handle } from "redux-pack";
import { AnyAction } from "redux";
import {
  ADD_ACTIVE_CHAT_ROOM,
  GET_ROOMS,
  CREATE_PUBLIC_ROOM,
  CREATE_PRIVATE_ROOM,
  CREATE_DIRECT_ROOM,
  Room,
  ADD_MESSAGE_TO_ROOM,
  GET_CHAT_HISTORY,
  GET_TRUSTED_CONTACTS
} from "../actions/actionCreator";
import {
  IRooms,
  ITrustedContact
} from "rln-client-lib/dist/src/profile/interfaces";

interface RoomsState {
  rooms: IRooms;
  currentActiveRoom: Room | undefined;
  chatHistory: Messages;
  trustedContacts: ITrustedContact[];
}

export type Messages = {
  [id: string]: any[];
};

const defaultState: RoomsState = {
  rooms: { public: [], private: [], direct: [] },
  currentActiveRoom: undefined,
  chatHistory: {},
  trustedContacts: []
};

const ChatReducer = (state = defaultState, action: AnyAction): RoomsState => {
  const { type, payload, meta } = action;
  switch (type) {
    case GET_ROOMS: {
      return handle(state, action, {
        start: prevState => ({ ...prevState }),
        success: prevState => ({
          ...prevState,
          rooms: payload
        }),
        finish: prevState => ({ ...prevState })
      });
    }
    case CREATE_PUBLIC_ROOM: {
      return handle(state, action, {
        start: prevState => ({ ...prevState }),
        success: prevState => ({
          ...prevState,
          rooms: {
            ...prevState.rooms,
            public: [...prevState.rooms.public, payload]
          },
          currentActiveRoom: payload
        }),
        finish: prevState => ({ ...prevState })
      });
    }
    case CREATE_PRIVATE_ROOM: {
      return handle(state, action, {
        start: prevState => ({ ...prevState }),
        success: prevState => ({
          ...prevState,
          rooms: {
            ...prevState.rooms,
            private: [...prevState.rooms.private, payload]
          },
          currentActiveRoom: payload
        }),
        finish: prevState => ({ ...prevState })
      });
    }
    case CREATE_DIRECT_ROOM: {
      return handle(state, action, {
        start: prevState => ({ ...prevState }),
        success: prevState => ({
          ...prevState,
          rooms: {
            ...prevState.rooms,
            direct: [...prevState.rooms.direct, payload]
          },
          currentActiveRoom: payload
        }),
        finish: prevState => ({ ...prevState })
      });
    }

    case ADD_ACTIVE_CHAT_ROOM: {
      return {
        ...state,
        currentActiveRoom: meta
      };
    }

    case ADD_MESSAGE_TO_ROOM: {
      return {
        ...state,
        chatHistory: {
          ...state.chatHistory,
          [meta.roomId]: state.chatHistory[meta.roomId]
            ? [...state.chatHistory[meta.roomId], meta.message]
            : [meta.message]
        }
      };
    }

    case GET_CHAT_HISTORY: {
      return handle(state, action, {
        start: prevState => ({ ...prevState }),
        success: prevState => ({
          ...prevState,
          chatHistory: payload
        }),
        finish: prevState => ({ ...prevState })
      });
    }

    case GET_TRUSTED_CONTACTS: {
      return handle(state, action, {
        start: prevState => ({ ...prevState }),
        success: prevState => ({
          ...prevState,
          trustedContacts: Object.values(payload)
        }),
        finish: prevState => ({ ...prevState })
      });
    }

    default:
      return state;
  }
};

export default ChatReducer;
