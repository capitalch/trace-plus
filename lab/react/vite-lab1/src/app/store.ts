import { configureStore } from "@reduxjs/toolkit";
import { counterReducer } from "../features/redux-counter/counter-slice";
import { filterControlReducer } from "../features/syncfusion/drop-down-tree/filter-control-slice";
// import { appReducer } from "./app-slice";

export const store = configureStore({
  reducer: {
    filterControl: filterControlReducer,
    counter: counterReducer,
  },
});

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;
