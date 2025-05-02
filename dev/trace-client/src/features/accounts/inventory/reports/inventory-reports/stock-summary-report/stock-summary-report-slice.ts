import { format } from "date-fns";
import {
  AgeType,
  BrandType,
  CategoryType,
  //   DateRangeType,
  TagType,
} from "../../../shared-definitions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: StockSummaryReportInitialStateType = {
  catFilterOption: {
    selectedCategory: { catName: "All", id: "" },
    selectedBrand: { brandName: "All", id: null },
    selectedTag: { id: null, tagName: "All" },
  },
  productCode: null,
  ageFilterOption: { selectedAge: { value: null, label: "All" } },
  onDate: format(new Date(), "yyyy-MM-dd"),
};

const stockSummaryReportSlice = createSlice({
  name: "stockSummaryReport",
  initialState,
  reducers: {
    setStockReportFilters: (
      state: StockSummaryReportInitialStateType,
      action: PayloadAction<StockSummaryReportPayloadActionType>
    ) => {
        state.catFilterOption.selectedCategory = action.payload.catFilterOption.selectedCategory;
        state.catFilterOption.selectedBrand = action.payload.catFilterOption.selectedBrand;
        state.catFilterOption.selectedTag = action.payload.catFilterOption.selectedTag;
        state.productCode = action.payload.productCode;
        state.ageFilterOption.selectedAge = action.payload.ageFilterOption.selectedAge;
        state.onDate = action.payload.onDate;
    },
  },
});

export const stockSummaryReportReducer = stockSummaryReportSlice.reducer;
export const { setStockReportFilters } = stockSummaryReportSlice.actions;

type StockSummaryReportInitialStateType = {
  catFilterOption: {
    selectedCategory: CategoryType;
    selectedBrand: BrandType;
    selectedTag: TagType;
  };
  productCode: string | null;
  ageFilterOption: {
    selectedAge: AgeType;
  };
  onDate: string;
};

type StockSummaryReportPayloadActionType = {
  catFilterOption: {
    selectedCategory: CategoryType;
    selectedBrand: BrandType;
    selectedTag: TagType;
  };
  productCode: string | null;
  ageFilterOption: {
    selectedAge: AgeType;
  };
  onDate: string;
};
