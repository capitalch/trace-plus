import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./app-slice";
import { counterReducer } from "../features/counter/counter-slice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    counter: counterReducer
  },
});
