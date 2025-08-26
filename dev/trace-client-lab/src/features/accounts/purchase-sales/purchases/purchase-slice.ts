import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseFormDataType } from "./all-purchases/all-purchases";

const initialState: PurchaseInitialStateType = {
    savedFormData: null,
    isInvoiceExists: false,
}

const purchaseSlice = createSlice({
    name: 'purchase',
    initialState: initialState,

    reducers: {
        savePurchaseFormData(state, action: PayloadAction<PurchaseFormDataType>) {
            state.savedFormData = action.payload;
        },
        clearPurchaseFormData(state) {
            state.savedFormData = null;
        },
        setInvoicExists(state, action: PayloadAction<boolean>) {
            state.isInvoiceExists = action.payload
        }
    }
})

export const purchaseReducer = purchaseSlice.reducer;
export const {
    savePurchaseFormData
    , clearPurchaseFormData
    , setInvoicExists
} = purchaseSlice.actions

export type PurchaseInitialStateType = {
    savedFormData: PurchaseFormDataType | null;
    isInvoiceExists: boolean;
}