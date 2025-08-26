import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseFormDataType } from "../purchases/all-purchases/all-purchases";

const initialState: PurchaseReturnInitialStateType = {
    savedFormData: null,
    toggle: true,
    // isInvoiceExists: false,
}

const purchaseReturnSlice = createSlice({
    name: 'purchaseReturn',
    initialState: initialState,

    reducers: {
        savePurchaseReturnFormData(state, action: PayloadAction<PurchaseFormDataType>) {
            state.savedFormData = action.payload;
        },
        clearPurchaseReturnFormData(state) {
            state.savedFormData = null;
        },
        triggerPurchaseReturn(state,){
            state.toggle = !state.toggle
        }
        // setInvoicExists(state, action: PayloadAction<boolean>) {
        //     state.isInvoiceExists = action.payload
        // }
    }
})

export const purchaseReturnReducer = purchaseReturnSlice.reducer;
export const {
    savePurchaseReturnFormData
    , clearPurchaseReturnFormData
    , triggerPurchaseReturn
    // , setInvoicExists
} = purchaseReturnSlice.actions

export type PurchaseReturnInitialStateType = {
    savedFormData: PurchaseFormDataType | null;
    toggle: boolean
    // isInvoiceExists: boolean;
}