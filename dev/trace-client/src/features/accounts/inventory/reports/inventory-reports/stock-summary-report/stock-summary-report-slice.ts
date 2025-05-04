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
  isFilterPanelVisible: false,
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
    setStockSummaryReportIsFilterPanelVisible: (
      state: StockSummaryReportInitialStateType,
      action: PayloadAction<boolean>
    ) => {
      state.isFilterPanelVisible = action.payload;
    },
    setStockReportFilters: (
      state: StockSummaryReportInitialStateType,
      action: PayloadAction<StockSummaryReportPayloadActionType>
    ) => {
      state.catFilterOption.selectedCategory =
        action.payload.catFilterOption.selectedCategory;
      state.catFilterOption.selectedBrand =
        action.payload.catFilterOption.selectedBrand;
      state.catFilterOption.selectedTag =
        action.payload.catFilterOption.selectedTag;
      state.productCode = action.payload.productCode;
      state.ageFilterOption.selectedAge =
        action.payload.ageFilterOption.selectedAge;
      state.onDate = action.payload.onDate;
    },
    toggleStockSummaryReportIsFilterPanelVisible: (state: StockSummaryReportInitialStateType) => {
      state.isFilterPanelVisible = !state.isFilterPanelVisible;
    },
  },
});

export const stockSummaryReportReducer = stockSummaryReportSlice.reducer;
export const { setStockSummaryReportIsFilterPanelVisible, setStockReportFilters, toggleStockSummaryReportIsFilterPanelVisible } =
  stockSummaryReportSlice.actions;

type StockSummaryReportInitialStateType = {
  isFilterPanelVisible: boolean;
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
