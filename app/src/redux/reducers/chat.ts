import { handle } from "redux-pack"
import { AnyAction } from "redux"
import {
  ADD_ACTIVE_CHAT_ROOM,
  GET_ROOMS,
  CREATE_PUBLIC_ROOM,
  CREATE_PRIVATE_ROOM,
  CREATE_DIRECT_ROOM,
  Room,
  ADD_MESSAGE_TO_ROOM,
  GET_TRUSTED_CONTACTS,
  DELETE_MESSAGES_FOR_ROOM,
  LOAD_MESSAGES_FOR_ROOM,
  LOAD_MESSAGES_FOR_ROOMS,
  RUN_SYNC_MESSAGE_HISTORY,
  GET_USER_HANDLE
} from "../actions/actionCreator";
import {
  IRooms,
  ITrustedContact,
  IMessage
} from "zk-chat-client";

interface RoomsState {
  rooms: IRooms;
  currentActiveRoom: Room | undefined;
  chatHistory: Messages;
  trustedContacts: ITrustedContact[];
  chatHistorySyncing: boolean
  stayOnBottom: boolean
  userHandle: string
  loading: boolean
}

export type Messages = {
  [id: string]: IMessage[]
}

const defaultState: RoomsState = {
  rooms: { public: [], private: [], direct: [] },
  currentActiveRoom: undefined,
  chatHistory: {},
  trustedContacts: [],
  chatHistorySyncing: false,
  stayOnBottom: true,
  userHandle: "",
  loading: false
}

const ChatReducer = (state = defaultState, action: AnyAction): RoomsState => {
  const { type, payload, meta } = action
  switch (type) {
    case GET_ROOMS: {
      return handle(state, action, {
        start: (prevState) => ({ ...prevState }),
        success: (prevState) => ({
          ...prevState,
          rooms: payload
        }),
        finish: (prevState) => ({ ...prevState })
      })
    }
    case CREATE_PUBLIC_ROOM: {
      return handle(state, action, {
        start: (prevState) => ({ ...prevState }),
        success: (prevState) => ({
          ...prevState,
          rooms: {
            ...prevState.rooms,
            public: [...prevState.rooms.public, payload]
          },
          currentActiveRoom: payload
        }),
        finish: (prevState) => ({ ...prevState })
      })
    }
    case CREATE_PRIVATE_ROOM: {
      return handle(state, action, {
        start: (prevState) => ({ ...prevState }),
        success: (prevState) => ({
          ...prevState,
          rooms: {
            ...prevState.rooms,
            private: [...prevState.rooms.private, payload]
          },
          currentActiveRoom: payload
        }),
        finish: (prevState) => ({ ...prevState })
      })
    }
    case CREATE_DIRECT_ROOM: {
      return handle(state, action, {
        start: (prevState) => ({ ...prevState }),
        success: (prevState) => ({
          ...prevState,
          rooms: {
            ...prevState.rooms,
            direct: [...prevState.rooms.direct, payload]
          },
          currentActiveRoom: payload
        }),
        finish: (prevState) => ({ ...prevState })
      })
    }

    case ADD_ACTIVE_CHAT_ROOM: {
      return {
        ...state,
        currentActiveRoom: meta
      }
    }

    case ADD_MESSAGE_TO_ROOM: {
      return {
        ...state,
        chatHistory: {
          ...state.chatHistory,
          [meta.roomId]: state.chatHistory[meta.roomId]
            ? [...state.chatHistory[meta.roomId], meta.message]
            : [meta.message]
        },
        stayOnBottom: true
      }
    }

    case RUN_SYNC_MESSAGE_HISTORY: {
      return handle(state, action, {
        start: (prevState) => ({
          ...prevState,
          chatHistorySyncing: true
        }),
        success: (prevState) => ({ ...prevState }),
        finish: (prevState) => ({
          ...prevState,
          chatHistorySyncing: false
        })
      })
    }

    case LOAD_MESSAGES_FOR_ROOM: {
      return handle(state, action, {
        start: (prevState) => ({ ...prevState, loading: true }),
        success: (prevState) => ({
          ...prevState,
          chatHistory: {
            ...prevState.chatHistory,
            [meta.roomId]: meta.shouldReset
              ? [...payload]
              : [...payload, ...prevState.chatHistory[meta.roomId]]
          },
          stayOnBottom: false
        }),
        finish: (prevState) => ({ ...prevState, loading: false })
      })
    }

    case LOAD_MESSAGES_FOR_ROOMS: {
      return handle(state, action, {
        start: (prevState) => ({ ...prevState }),
        success: (prevState) => ({
          ...prevState,
          chatHistory: {
            ...prevState.chatHistory,
            ...payload
          }
        }),
        finish: (prevState) => ({ ...prevState })
      })
    }

    case DELETE_MESSAGES_FOR_ROOM: {
      return handle(state, action, {
        start: (prevState) => ({ ...prevState }),
        success: (prevState) => ({
          ...prevState,
          chatHistory:{
            [meta.roomId]: []
          }
          
        }),
        finish: (prevState) => ({ ...prevState })
      })
    }

    case GET_TRUSTED_CONTACTS: {
      return handle(state, action, {
        start: (prevState) => ({ ...prevState }),
        success: (prevState) => ({
          ...prevState,
          trustedContacts: Object.values(payload)
        }),
        finish: (prevState) => ({ ...prevState })
      })
    }

    case GET_USER_HANDLE: {
      return handle(state, action, {
        start: (prevState) => ({ ...prevState }),
        success: (prevState) => ({
          ...prevState,
          userHandle: payload
        }),
        finish: (prevState) => ({ ...prevState })
      })
    }

    default:
      return state
  }
}

export default ChatReducer
