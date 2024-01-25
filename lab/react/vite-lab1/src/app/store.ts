import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./app-slice";
import { counterReducer } from "../features/redux-counter/counter-slice";
import { navigationReducer } from "../features/navigation/navigation-slice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    counter: counterReducer,
    navigation: navigationReducer
  },
});

export type RootStateType = ReturnType<typeof store.getState>
export type AppDispatchType = typeof store.dispatch
