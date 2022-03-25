import { AnyAction, combineReducers } from "redux"
import ChatReducer from "./chat"

const appReducer = combineReducers({
  ChatReducer
})

const rootReducer = (state: any, action: AnyAction) => {
  return appReducer(state, action)
}

export default rootReducer
