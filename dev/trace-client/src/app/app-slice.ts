import { createSlice } from "@reduxjs/toolkit";

export const appSlice = createSlice({
  name: "app",
  initialState: {},
  reducers: {},
});

export const appReducer = appSlice.reducer;
// const { reducer } = appSlice;
// export { reducer as appReducer };
