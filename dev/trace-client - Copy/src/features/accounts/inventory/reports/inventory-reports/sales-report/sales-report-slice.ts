import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AgeType,
  BrandType,
  CategoryType,
  DateRangeType,
  TagType,
} from "../../../shared-definitions";
import { format } from "date-fns";

const initialState: SalesReportInitialStateType = {
  filterMode: "category",
  catFilterOption: {
    selectedCategory: { catName: "All", id: "" },
    selectedBrand: { brandName: "All", id: null },
    selectedTag: { id: null, tagName: "All" },
  },
  productCode: null,
  ageFilterOption: {
    selectedAge: { value: null, label: "All" },
  },
  dateRangeFilterOption: {
    selectedDateRange: { label: "today", value: "today" },
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  },
};

const salesReportSlice = createSlice({
  name: "salesReport",
  initialState: initialState,
  reducers: {
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
    setSalesReportDateRange: (
      state: SalesReportInitialStateType,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.dateRangeFilterOption.startDate = action.payload.startDate;
      state.dateRangeFilterOption.endDate = action.payload.endDate;
    },
  },
});

export const salesReportReducer = salesReportSlice.reducer;
export const {
  setSalesReportDateRange,
  setSalesReportFilters,
} = salesReportSlice.actions;

type SalesReportInitialStateType = {
  filterMode: "category" | "productCode";
  catFilterOption: {
    selectedCategory: CategoryType;
    selectedBrand: BrandType;
    selectedTag: TagType;
  };
  productCode: string | null;
  ageFilterOption: {
    selectedAge: AgeType;
  };
  dateRangeFilterOption: {
    selectedDateRange: DateRangeType;
    startDate: string;
    endDate: string;
  };
};

export type SalesReportPayloadActionType = {
  filterMode: "category" | "productCode";
  catFilterOption: {
    selectedCategory: CategoryType;
    selectedBrand: BrandType;
    selectedTag: TagType;
  };
  productCode: string | null;
  ageFilterOption: {
    selectedAge: AgeType;
  };
  dateRangeFilterOption: {
    selectedDateRange: DateRangeType;
    startDate: string;
    endDate: string;
  };
};
