import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateType } from "../../app/store/store";
import {
  BrandType,
  CategoryType,
  TagType,
} from "./inventory/reports/inventory-reports/purchase-price-variation-report/purchase-price-variation-filter-control";

const initialState: AccountsInitialStateType = {
  accSettingsChanged: 0,
  allTransactionsFilter: {
    dateType: "transactionDate",
    endDate: "",
    startDate: "",
    selectedQuickDate: "fiscalYear",
    transactionType: "all",
  },
  bankRecon: {
    selectedBank: {
      accId: undefined,
      accName: "",
    },
  },
  exports: {
    exportName: "",
  },
  productOpeningBalanceEdit: {},
  purchasePriceVariationFilterState: {
    isPaneOpen: false,
    selectedBrand: null,
    selectedCategory: null,
    selectedTag: null,
  },
  purchaseReportFilterState: {
    isPaneOpen: false,
    selectMode: "predefined",
    predefinedFilterOption: {
      value: "",
      startDate: "",
      endDate: "",
    },
    customFilterOption: {
      startDate: "",
      endDate: "",
    },
    // selectedPredefinedValue: null,
    selectedStartDate: "",
    selectedEndDate: "",
  },
  tranHeaderEdit: {},
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState: initialState,

  reducers: {
    changeAccSettings: (state: AccountsInitialStateType) => {
      state.accSettingsChanged = Date.now();
    },

    selectBank: (
      state: AccountsInitialStateType,
      action: PayloadAction<SelectedBankType>
    ) => {
      state.bankRecon.selectedBank = action.payload;
    },

    // Exports
    setExportName: (
      state: AccountsInitialStateType,
      action: PayloadAction<string>
    ) => {
      state.exports.exportName = action.payload;
    },

    // All transactions filter for report
    setAllTransactionFilter: (
      state: AccountsInitialStateType,
      action: PayloadAction<AllTransactionsFilterType>
    ) => {
      state.allTransactionsFilter = action.payload;
    },

    // Products opening balance selection by catId, brandId, label
    setProductOpeningBalanceEdit: (
      state: AccountsInitialStateType,
      action: PayloadAction<ProductOpeningBalanceEditType>
    ) => {
      state.productOpeningBalanceEdit = { ...action.payload };
    },

    reSetProductOpeningBalanceEdit: (state: AccountsInitialStateType) => {
      state.productOpeningBalanceEdit = {
        brandId: undefined,
        catId: undefined,
        id: undefined,
        labelId: undefined,
        lastPurchaseDate: undefined,
        openingPrice: 0,
        productId: undefined,
      };
    },

    // purchase price variation filter
    setPurchasePriceVariationIsPaneOpen: (
      state: AccountsInitialStateType,
      action: PayloadAction<boolean>
    ) => {
      state.purchasePriceVariationFilterState.isPaneOpen = action.payload;
    },

    setSelectedBrand: (
      state: AccountsInitialStateType,
      action: PayloadAction<BrandType | null>
    ) => {
      state.purchasePriceVariationFilterState.selectedBrand = action.payload;
    },

    setSelectedCategory: (
      state: AccountsInitialStateType,
      action: PayloadAction<CategoryType | null>
    ) => {
      state.purchasePriceVariationFilterState.selectedCategory = action.payload;
    },

    setSelectedTag: (
      state: AccountsInitialStateType,
      action: PayloadAction<TagType | null>
    ) => {
      state.purchasePriceVariationFilterState.selectedTag = action.payload;
    },

    resetPurchasePriceVariationFilters: (state: AccountsInitialStateType) => {
      state.purchasePriceVariationFilterState.selectedBrand = null;
      state.purchasePriceVariationFilterState.selectedCategory = null;
      state.purchasePriceVariationFilterState.selectedTag = null;
    },

    // Purchase report filter
    setPurchaseReportCustomFilterOption: (
      state: AccountsInitialStateType,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.purchaseReportFilterState.customFilterOption = action.payload;
    },
    setPurchaseReportPredefinedFilterOption: (
      state: AccountsInitialStateType,
      action: PayloadAction<{
        value: string | number;
        startDate: string;
        endDate: string;}>
    ) => {
      state.purchaseReportFilterState.predefinedFilterOption  = action.payload;
    },
    setPurchaseReportFilterDateInterval: (
      state: AccountsInitialStateType,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.purchaseReportFilterState.selectedStartDate =
        action.payload.startDate;
      state.purchaseReportFilterState.selectedEndDate = action.payload.endDate;
    },

    setPurchaseReportIsPaneOpen: (
      state: AccountsInitialStateType,
      action: PayloadAction<boolean>
    ) => {
      state.purchaseReportFilterState.isPaneOpen = action.payload;
    },

    setPurchaseReportSelectMode: (
      state: AccountsInitialStateType,
      action: PayloadAction<"predefined" | "custom">
    ) => {
      state.purchaseReportFilterState.selectMode = action.payload;
    },

    // tranHeader edits
    setTranHeaderIdToEdit: (
      state: AccountsInitialStateType,
      action: PayloadAction<TranHeaderEditType>
    ) => {
      if (!state.tranHeaderEdit[action.payload.instance]) {
        state.tranHeaderEdit[action.payload.instance] = {
          id: null,
        };
      }
      state.tranHeaderEdit[action.payload.instance].id =
        action.payload.tranHeaderId;
    },

    resetTranHeaderIdToEdit: (
      state: AccountsInitialStateType,
      action: PayloadAction<TranHeaderEditType>
    ) => {
      if (state.tranHeaderEdit[action.payload.instance]) {
        state.tranHeaderEdit[action.payload.instance].id = undefined;
      }
    },
  },
});

export const accountsReducer = accountsSlice.reducer;
export const {
  changeAccSettings,
  selectBank,
  setAllTransactionFilter,
  setExportName,
  reSetProductOpeningBalanceEdit,
  setProductOpeningBalanceEdit,

  // purchase price variation filters
  resetPurchasePriceVariationFilters,
  setPurchasePriceVariationIsPaneOpen,
  setSelectedBrand,
  setSelectedCategory,
  setSelectedTag,
  // purchase report filters
  setPurchaseReportCustomFilterOption,
  setPurchaseReportFilterDateInterval,
  setPurchaseReportIsPaneOpen,
  setPurchaseReportPredefinedFilterOption,
  setPurchaseReportSelectMode,
  // tranHeader edits
  resetTranHeaderIdToEdit,
  setTranHeaderIdToEdit,
} = accountsSlice.actions;

export type AccountsInitialStateType = {
  accSettingsChanged: number;
  allTransactionsFilter: AllTransactionsFilterType;
  bankRecon: { selectedBank: SelectedBankType };
  exports: {
    exportName: string;
  };
  productOpeningBalanceEdit: ProductOpeningBalanceEditType;
  purchasePriceVariationFilterState: PurchasePriceVariationFilterType;
  purchaseReportFilterState: PurchaseReportFilterType;
  tranHeaderEdit: {
    [key: string]: {
      id: number | null | undefined;
    };
  };
};

export type AllTransactionsFilterType = {
  transactionType: string;
  dateType: "transactionDate" | "entryDate";
  startDate: string;
  endDate: string;
  selectedQuickDate: string;
};

export type ProductOpeningBalanceEditType = {
  id?: number;
  catId?: number;
  brandId?: number;
  labelId?: number;
  productId?: number;
  qty?: number;
  openingPrice?: number;
  lastPurchaseDate?: string;
};

type PurchasePriceVariationFilterType = {
  isPaneOpen: boolean;
  selectedCategory: CategoryType | null;
  selectedBrand: BrandType | null;
  selectedTag: TagType | null;
};

type PurchaseReportFilterType = {
  isPaneOpen: boolean;
  selectMode: "predefined" | "custom";
  predefinedFilterOption:{
    value: string | number;
    startDate: string;
    endDate: string;
  },
  customFilterOption:{
    startDate: string;
    endDate: string;
  },
  // selectedPredefinedValue: string | number | null;
  selectedStartDate: string;
  selectedEndDate: string;
};

export type SelectedBankType = {
  accId: number | undefined;
  accName: string;
};

export type TranHeaderEditType = {
  instance: string;
  tranHeaderId?: number;
};

// selectors
export const bankReconSelectedBankFn = (state: RootStateType) =>
  state.accounts.bankRecon.selectedBank;
