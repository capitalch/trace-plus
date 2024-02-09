import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./app-slice";

export const store = configureStore({
    reducer: {
      app: appReducer,
    },
  });
  
  export type RootStateType = ReturnType<typeof store.getState>
  export type AppDispatchType = typeof store.dispatch