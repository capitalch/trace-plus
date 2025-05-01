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
  isPaneOpen: false,
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
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
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
export const { setSalesReportFilters, setSalesReportIsPaneOpen } =
  salesReportSlice.actions;

type SalesReportInitialStateType = {
  isPaneOpen: boolean;
  filterMode: "category" | "productCode";
  catFilterOption: {
    selectedCategory: CategoryType;
    selectedBrand: BrandType;
    selectedTag: TagType;
  };
  productCode: number | null;
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
  productCode: number | null;
  ageFilterOption: {
    selectedAge: AgeType;
  };
  dateRangeFilterOption: {
    selectedDateRange: DateRangeType;
    startDate: string;
    endDate: string;
  };
};
