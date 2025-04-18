import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BrandType, CategoryType, TagType } from "./drop-down-tree-new-demo";

const initialState: InitialStateType = {
  filterControlState: {
    selectedBrand: null,
    selectedCategory: null,
    selectedTag: null,
  },
};

export const filterControlSlice = createSlice({
  name: "filterControl",
  initialState: initialState,
  reducers: {
    setSelectedCategory: (
      state: InitialStateType,
      action: PayloadAction<CategoryType | null>
    ) => {
      state.filterControlState.selectedCategory = action.payload;
    },
  },
});

export const filterControlReducer = filterControlSlice.reducer;
export const { setSelectedCategory } = filterControlSlice.actions;

type InitialStateType = {
  filterControlState: FilterControlStateType;
};

type FilterControlStateType = {
  selectedCategory: CategoryType | null;
  selectedBrand: BrandType | null;
  selectedTag: TagType | null;
};
