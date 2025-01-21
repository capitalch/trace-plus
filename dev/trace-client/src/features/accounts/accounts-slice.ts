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
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState: initialState,

  reducers: {
    selectBank: (
      state: AccountsInitialStateType,
      action: PayloadAction<SelectedBankType>
    ) => {
      state.bankRecon.selectedBank = action.payload;
    },

    changeAccSettings: (state: AccountsInitialStateType) => {
      state.accSettingsChanged = Date.now();
    },
  },
});

export const accountsReducer = accountsSlice.reducer;
export const { selectBank, changeAccSettings } = accountsSlice.actions;

export type AccountsInitialStateType = {
  bankRecon: { selectedBank: SelectedBankType };
  accSettingsChanged: number;
};

export type SelectedBankType = {
  accId: number | undefined;
  accName: string;
};

// selectors
export const bankReconSelectedBankFn = (state: RootStateType) =>
  state.accounts.bankRecon.selectedBank;