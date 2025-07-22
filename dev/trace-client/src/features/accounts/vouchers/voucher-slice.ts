import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VoucherFormDataType } from "./all-vouchers/all-vouchers";

const initialState: VoucherInitialStateType = {
    savedFormData: null,
    voucherIdToPreview: null,
    isPreviewOpen: false,
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
    }
})

export const voucherReducer = voucherSlice.reducer;
export const {
    saveVoucherFormData
    , clearVoucherFormData
    , triggerVoucherPreview
    , closeVoucherPreview,
} = voucherSlice.actions

export type VoucherInitialStateType = {
    savedFormData: VoucherFormDataType | null;

    voucherIdToPreview: number | null;
    isPreviewOpen: boolean;
}