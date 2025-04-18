import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
// import {
//   BrandType,
//   CategoryType,
//   TagType,
// } from "../features/syncfusion/drop-down-tree/drop-down-tree-new-demo";

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

// const initialState: InitialStateType = {
//   filterState: {
//     selectedBrand: null,
//     selectedCategory: null,
//     selectedTag: null,
//   },
// };

export const appSlice = createSlice({
  name: "app",
  initialState: {},
  reducers: {
    // setSelectedCategory: (
    //   state: InitialStateType,
    //   action: PayloadAction<CategoryType | null>
    // ) => {
    //   state.filterState.selectedCategory = action.payload;
    // },
  },

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
// export const { setSelectedCategory } = appSlice.actions;

// type InitialStateType = {
//   filterState: FilterStateType;
// };

// type FilterStateType = {
//   selectedCategory: CategoryType | null;
//   selectedBrand: BrandType | null;
//   selectedTag: TagType | null;
// };
