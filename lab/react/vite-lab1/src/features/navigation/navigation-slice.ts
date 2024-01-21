import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

const initialState: { isSidebarOpen: boolean } = {
  isSidebarOpen: false,
};

export const navigationSlice = createSlice({
  name: "navigation",
  initialState: initialState,
  reducers: {
    setSidebarOpen: (state: any, action: PayloadAction<any>) => {
      state.isSidebarOpen = action.payload.isSidebarOpen;
    },
  },
});

export const navigationReducer = navigationSlice.reducer;
const { setSidebarOpen } = navigationSlice.actions;
export { setSidebarOpen };

export const sidebarSelectorFn = (state: RootState) => state.navigation.isSidebarOpen;
