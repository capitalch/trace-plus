import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseFormDataType } from "./all-purchases/all-purchases";

const initialState: PurchaseInitialStateType = {
    savedFormData: null,
    purchaseIdToPreview: null,
    isPreviewOpen: false,
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
        triggerPurchaseInvoicePreview(state, action: PayloadAction<number>) {
            state.purchaseIdToPreview = action.payload;
            state.isPreviewOpen = true;
        },
        closePurchaseInvoicePreview(state) {
            state.purchaseIdToPreview = null;
            state.isPreviewOpen = false;
        },
    }
})

export const purchaseReducer = purchaseSlice.reducer;
export const {
    savePurchaseFormData
    , clearPurchaseFormData
    , triggerPurchaseInvoicePreview
    , closePurchaseInvoicePreview,
} = purchaseSlice.actions

export type PurchaseInitialStateType = {
    savedFormData: PurchaseFormDataType | null;
    purchaseIdToPreview: number | null;
    isPreviewOpen: boolean;
}