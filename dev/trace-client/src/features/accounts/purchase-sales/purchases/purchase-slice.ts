import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseFormDataType } from "./all-purchases/all-purchases";

const initialState: PurchaseInitialStateType = {
    savedFormData: null,
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
    }
})

export const purchaseReducer = purchaseSlice.reducer;
export const {
    savePurchaseFormData
    , clearPurchaseFormData
} = purchaseSlice.actions

export type PurchaseInitialStateType = {
    savedFormData: PurchaseFormDataType | null;
}