import { AnyAction, combineReducers } from "redux";
import TestReducer from "./test";

const appReducer = combineReducers({
  TestReducer
});

const rootReducer = (state: any, action: AnyAction) => {
  // if (action.type === RESET_APP_STORE) {
  //   state = undefined;
  // }
  return appReducer(state, action);
};

export default rootReducer;
