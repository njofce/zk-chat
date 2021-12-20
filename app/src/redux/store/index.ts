import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import rootReducer from "../reducers";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { middleware as reduxPackMiddleware } from "redux-pack";

const initialState = {};

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...[thunk, reduxPackMiddleware]))
);

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
