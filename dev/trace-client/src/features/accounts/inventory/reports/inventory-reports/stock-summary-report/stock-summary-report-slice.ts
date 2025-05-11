import { format } from "date-fns";
import {
  AgeType,
  BrandType,
  CategoryType,
  GrossProfitStatusType,
  TagType,
} from "../../../shared-definitions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: StockSummaryReportInitialStateType = {
  catFilterOption: {
    selectedCategory: { catName: "All", id: "" },
    selectedBrand: { brandName: "All", id: null },
    selectedTag: { id: null, tagName: "All" },
  },
  ageFilterOption: { selectedAge: { value: null, label: "All" } },
  onDate: format(new Date(), "yyyy-MM-dd"),
  selectedGrossProfitStatus: { label: "All", value: 0 },
};

const stockSummaryReportSlice = createSlice({
  name: "stockSummaryReport",
  initialState,
  reducers: {
    setStockSummaryReportFilters: (
      state: StockSummaryReportInitialStateType,
      action: PayloadAction<StockSummaryReportPayloadActionType>
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

      state.selectedGrossProfitStatus =
        action.payload.selectedGrossProfitStatus;
    },
  },
});

export const stockSummaryReportReducer = stockSummaryReportSlice.reducer;
export const { setStockSummaryReportFilters } = stockSummaryReportSlice.actions;

type StockSummaryReportInitialStateType = {
  catFilterOption: {
    selectedCategory: CategoryType;
    selectedBrand: BrandType;
    selectedTag: TagType;
  };
  ageFilterOption: {
    selectedAge: AgeType;
  };
  onDate: string;
  selectedGrossProfitStatus: GrossProfitStatusType;
};

export type StockSummaryReportPayloadActionType = {
  catFilterOption: {
    selectedCategory: CategoryType;
    selectedBrand: BrandType;
    selectedTag: TagType;
  };
  ageFilterOption: {
    selectedAge: AgeType;
  };
  onDate: string;
  selectedGrossProfitStatus: GrossProfitStatusType;
};
