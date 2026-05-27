import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AccountOptionType } from "../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { RootStateType } from "../../../app/store";
import { VoucherFormDataType } from "./all-vouchers/all-vouchers";

export type AccountsCacheKeyType =
    | 'cashBankAccounts'
    | 'paymentDebitAccounts'
    | 'receiptCreditAccounts'
    | 'journalAccounts'

export type AccountsCacheType = {
    cashBankAccounts: AccountOptionType[];
    paymentDebitAccounts: AccountOptionType[];
    receiptCreditAccounts: AccountOptionType[];
    journalAccounts: AccountOptionType[];
    isLoaded: boolean;
}

const initialAccountsCache: AccountsCacheType = {
    cashBankAccounts: [],
    paymentDebitAccounts: [],
    receiptCreditAccounts: [],
    journalAccounts: [],
    isLoaded: false,
}

const initialState: VoucherInitialStateType = {
    savedFormData: null,
    voucherIdToPreview: null,
    isPreviewOpen: false,
    accountsCache: initialAccountsCache,
}

const voucherSlice = createSlice({
    name: 'vouchers',
    initialState: initialState,

    reducers: {
        saveVoucherFormData(state, action: PayloadAction<VoucherFormDataType>) {
            state.savedFormData = action.payload;
        },
        clearVoucherFormData(state) {
            state.savedFormData = null;
        },
        triggerVoucherPreview(state, action: PayloadAction<number>) {
            state.voucherIdToPreview = action.payload;
            state.isPreviewOpen = true;
        },
        closeVoucherPreview(state) {
            state.voucherIdToPreview = null;
            state.isPreviewOpen = false;
        },
        setAccountsCache(state, action: PayloadAction<AccountsCacheType>) {
            state.accountsCache = action.payload;
        },
        updateAccountsCacheKey(
            state,
            action: PayloadAction<{ key: AccountsCacheKeyType; data: AccountOptionType[] }>
        ) {
            state.accountsCache[action.payload.key] = action.payload.data;
        },
        clearAccountsCache(state) {
            state.accountsCache = { ...initialAccountsCache };
        },
    }
})

export const voucherReducer = voucherSlice.reducer;
export const {
    saveVoucherFormData,
    clearVoucherFormData,
    triggerVoucherPreview,
    closeVoucherPreview,
    setAccountsCache,
    updateAccountsCacheKey,
    clearAccountsCache,
} = voucherSlice.actions

// Selectors
export const selectAccountsCache = (state: RootStateType) => state.vouchers.accountsCache
export const selectAccountsCacheIsLoaded = (state: RootStateType) => state.vouchers.accountsCache.isLoaded

export type VoucherInitialStateType = {
    savedFormData: VoucherFormDataType | null;
    voucherIdToPreview: number | null;
    isPreviewOpen: boolean;
    accountsCache: AccountsCacheType;
}
