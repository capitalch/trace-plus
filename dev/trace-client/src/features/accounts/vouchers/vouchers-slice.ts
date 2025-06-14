import { createSlice } from "@reduxjs/toolkit";

const initialState: VouchersInitialStateType = {
    creditAccId: 0,
    debitAccId: 0
}

const vouchersSlice = createSlice({
    name: 'vouchers',
    initialState: initialState,

    reducers: {

    }
})

export const vouchersReducer = vouchersSlice.reducer;


export type VouchersInitialStateType = {
    creditAccId: number;
    debitAccId: number;
}