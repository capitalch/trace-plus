import { format } from "date-fns";
import { AgeType, BrandType, CategoryType, TagType } from "../../../shared-definitions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: StockTransReportInitialStateType = {
  catFilterOption: {
    selectedCategory: { catName: "All", id: "" },
    selectedBrand: { brandName: "All", id: null },
    selectedTag: { id: null, tagName: "All" },
  },
  ageFilterOption: { selectedAge: { value: null, label: "All" } },
  onDate: format(new Date(), "yyyy-MM-dd"),
};

const stockTransReportSlice = createSlice({
  name: "stockTransactionsReport",
  initialState,
  reducers: {
    setStockTransReportFilters: (
      state: StockTransReportInitialStateType,
      action: PayloadAction<StockTransReportInitialStateType>
    ) => {
      state.catFilterOption.selectedCategory =
        action.payload.catFilterOption.selectedCategory;
      state.catFilterOption.selectedBrand =
        action.payload.catFilterOption.selectedBrand;
      state.catFilterOption.selectedTag =
        action.payload.catFilterOption.selectedTag;

      state.ageFilterOption.selectedAge =
        action.payload.ageFilterOption.selectedAge;

      state.onDate = action.payload.onDate;

    },
  },
});

export const stockTransReportReducer = stockTransReportSlice.reducer;
export const { setStockTransReportFilters } = stockTransReportSlice.actions;

type StockTransReportInitialStateType = {
  catFilterOption: {
    selectedCategory: CategoryType;
    selectedBrand: BrandType;
    selectedTag: TagType;
  };
  ageFilterOption: {
    selectedAge: AgeType;
  };
  onDate: string;
};