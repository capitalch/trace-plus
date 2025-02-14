import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateType } from "../../app/store/store";

const initialState: AccountsInitialStateType = {
  bankRecon: {
    selectedBank: {
      accId: undefined,
      accName: "",
    },
  },
  accSettingsChanged: 0,
  exports: {
    exportName: "",
  },
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
  },
});

export const accountsReducer = accountsSlice.reducer;
export const { changeAccSettings, selectBank, setExportName } =
  accountsSlice.actions;

export type AccountsInitialStateType = {
  bankRecon: { selectedBank: SelectedBankType };
  accSettingsChanged: number;
  exports: {
    exportName: string;
  };
};

export type SelectedBankType = {
  accId: number | undefined;
  accName: string;
};

// selectors
export const bankReconSelectedBankFn = (state: RootStateType) =>
  state.accounts.bankRecon.selectedBank;
