import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VoucherFormDataType } from "./all-vouchers/all-vouchers";

const initialState: VoucherInitialStateType = {
    savedFormData: null
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
        }
    }
})

export const voucherReducer = voucherSlice.reducer;
export const {
    saveVoucherFormData, clearVoucherFormData
} = voucherSlice.actions

export type VoucherInitialStateType = {
    savedFormData: VoucherFormDataType | null;
}