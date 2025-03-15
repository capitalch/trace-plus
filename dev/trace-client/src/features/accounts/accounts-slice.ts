import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateType } from "../../app/store/store";

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
      state.productOpeningBalanceEdit = {...action.payload};
    },

    reSetProductOpeningBalanceEdit: (
      state: AccountsInitialStateType,
      // action: PayloadAction<ProductOpeningBalanceEditType>
    ) => {
      state.productOpeningBalanceEdit = {
        brandId: undefined,
        catId: undefined,
        id: undefined,
        labelId: undefined,
        lastPurchaseDate: undefined,
        openingPrice:0,
        productId: undefined
      };
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
} = accountsSlice.actions;

export type AccountsInitialStateType = {
  accSettingsChanged: number;
  allTransactionsFilter: AllTransactionsFilterType;
  bankRecon: { selectedBank: SelectedBankType };
  exports: {
    exportName: string;
  };
  productOpeningBalanceEdit: ProductOpeningBalanceEditType;
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

export type SelectedBankType = {
  accId: number | undefined;
  accName: string;
};

// selectors
export const bankReconSelectedBankFn = (state: RootStateType) =>
  state.accounts.bankRecon.selectedBank;
