// const initialState

import { createSlice } from "@reduxjs/toolkit";
import { BrandType, CategoryType, TagType } from "../../../shared-types";

const initialState: SalesReportInitialStateType = {
  isPaneOpen: false,
  filterMode: "category",
  catFilterOption: {
    selectedCategory: null,
    selectedBrand: null,
    selectedTag: null,
  },
  productCode: null,
  ageFilterOption: {
    selectedAge: null,
  },
  dateRangeFilterOption: {
    selectedDateRange: null,
    startDate: null,
    endDate: null,
  },
};

const salesReportSlice = createSlice({
  name: "salesReport",
  initialState: initialState,
  reducers: {
    setSalesReportIsPaneOpen: (state, action) => {
      state.isPaneOpen = action.payload;
    },
    setSalesReportFilterMode: (state, action) => {
      state.filterMode = action.payload;
    },
    // setSalesReportCatFilterOption: (state, action) => {
    //     state.catFilterOption = action.payload;
    // },
    // setSalesReportProductCodeFilterOption: (state, action) => {
    //     state.productCodeFilterOption = action.payload;
    // },
    // setSalesReportAgeFilterOption: (state, action) => {
    //     state.ageFilterOption = action.payload;
    // },
    // setSalesReportDateRangeFilterOption: (state, action) => {
    //     state.dateRangeFilterOption = action.payload;
    //
  },
});

export const salesReportReducer = salesReportSlice.reducer;
export const {
  setSalesReportFilterMode,
  setSalesReportIsPaneOpen,
  // setSalesReportCatFilterOption,
  // setSalesReportProductCodeFilterOption,
  // setSalesReportAgeFilterOption,
  // setSalesReportDateRangeFilterOption,
} = salesReportSlice.actions;

type SalesReportInitialStateType = {
  isPaneOpen: boolean;
  filterMode: "category" | "productCode";
  catFilterOption: {
    selectedCategory: CategoryType | null;
    selectedBrand: BrandType | null;
    selectedTag: TagType | null;
  };
  productCode: number | null;
  ageFilterOption: {
    selectedAge: string | null;
  };
  dateRangeFilterOption: {
    selectedDateRange: string | null;
    startDate: string | null;
    endDate: string | null;
  };
};
