import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchData = createAsyncThunk(
  "app/fetchData",
  async (args: any, thunkApi: any): Promise<any> => {
    try {
      const apiUrl = "http://localhost:8000/api";
      const res: any = await axios.get(apiUrl);
      // console.log(thunkApi);
      console.log(args, res);
      return { data: res?.data };
    } catch (err: any) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const appSlice = createSlice({
  name: "app",
  initialState: {},
  reducers: {},
  extraReducers: (builder: any) => {
    builder
      .addCase(fetchData.pending, (state: any, action: any) => {
        console.log(action);
        state.isLoading = true;
      })
      .addCase(fetchData.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        console.log(action);
      })
      .addCase(fetchData.rejected, (state: any, action: any) => {
        state.isLoading = false;
        console.log(action);
      });
  },
});

export const appReducer = appSlice.reducer;
// const { reducer } = appSlice;
// export { reducer as appReducer };
