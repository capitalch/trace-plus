import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
    setSalesReportIsPaneOpen: (
      state: SalesReportInitialStateType,
      action: PayloadAction<boolean>
    ) => {
      state.isPaneOpen = action.payload;
    },
    setSalesReportFilters: (
      state: SalesReportInitialStateType,
      action: PayloadAction<SalesReportPayloadActionType>
    ) => {
      state.filterMode = action.payload.filterMode;
      state.catFilterOption = action.payload.catFilterOption;
      state.productCode = action.payload.productCode;
      state.ageFilterOption = action.payload.ageFilterOption;
      state.dateRangeFilterOption = action.payload.dateRangeFilterOption;
    },
  },
});

export const salesReportReducer = salesReportSlice.reducer;
export const {
  setSalesReportFilters,
  setSalesReportIsPaneOpen,
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

export type SalesReportPayloadActionType = {
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
