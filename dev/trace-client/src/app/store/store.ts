import { configureStore } from "@reduxjs/toolkit";
// import { appReducer } from "./app-slice";
import { layoutsReducer } from "../../features/layouts/layouts-slice";
import { loginReducer } from "../../features/login/login-slice";

export const store = configureStore({
    reducer: {
      // app: appReducer,
      layouts: layoutsReducer,
      login: loginReducer,
    },
  });
  
  export type RootStateType = ReturnType<typeof store.getState>
  export type AppDispatchType = typeof store.dispatch