// import { format } from "date-fns";
import { BrandType, CategoryType, TagType } from "../../../shared-definitions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: StockTransReportInitialStateType = {
  filterMode: 'category',
  catFilterOption: {
    selectedCategory: { catName: "All", id: "" },
    selectedBrand: { brandName: "All", id: null },
    selectedTag: { id: null, tagName: "All" },
  },
  productCode: null,
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
      state.productCode = action.payload.productCode;
    },
  },
});

export const stockTransReportReducer = stockTransReportSlice.reducer;
export const { setStockTransReportFilters } = stockTransReportSlice.actions;

export type StockTransReportInitialStateType = {
  filterMode: "category" | "productCode";
  catFilterOption: {
    selectedCategory: CategoryType;
    selectedBrand: BrandType;
    selectedTag: TagType;
  };
  productCode: string | null;
};