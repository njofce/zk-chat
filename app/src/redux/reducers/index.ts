import { AnyAction, combineReducers } from "redux";
import ChatReducer from "./chat";

const appReducer = combineReducers({
  ChatReducer
});

const rootReducer = (state: any, action: AnyAction) => {
  // if (action.type === RESET_APP_STORE) {
  //   state = undefined;
  // }
  return appReducer(state, action);
};

export default rootReducer;
