import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: VoucherInitialStateType = {
    autoRefNo: '',
    creditEntries: [{
        accId: null,
        amount: 0,
        dc: 'C',
        detailsId: null,
        instrNo: '',
        tranHeaderId: null,
        lineRefNo: '',
        lineRemarks: ''
    }],
    debitEntries: [{
        accId: null,
        amount: 0,
        dc: 'D',
        detailsId: null,
        instrNo: '',
        tranHeaderId: null,
        lineRefNo: '',
        lineRemarks: ''
    }],
    remarks: '',
    totalCredits: 0,
    totalDebits: 0,
    tranDate: Date(),
    tranHeaderId: null,
    userRefNo: '',
    voucherType: 'Payment'
}

const voucherSlice = createSlice({
    name: 'vouchers',
    initialState: initialState,

    reducers: {
        setVoucherTotalCredits: (
            state: VoucherInitialStateType,
            action: PayloadAction<number>
        ) => {
            state.totalCredits = action.payload;
        },

        setVoucherTotalDebits: (
            state: VoucherInitialStateType,
            action: PayloadAction<number>
        ) => {
            state.totalDebits = action.payload;
        },

        setVoucherType: (
            state: VoucherInitialStateType,
            action: PayloadAction<VourcherType>
        ) => {
            state.voucherType = action.payload;
        },
    }
})

export const voucherReducer = voucherSlice.reducer;
export const {
    setVoucherTotalCredits,
    setVoucherTotalDebits,
    setVoucherType
} = voucherSlice.actions

export type VoucherInitialStateType = {
    autoRefNo: string;
    creditEntries: EntryItemType[]
    debitEntries: EntryItemType[]
    remarks: string;
    totalCredits: number;
    totalDebits: number;
    tranDate: string;
    tranHeaderId: number | null;
    userRefNo: string;
    voucherType: VourcherType
}

export type VourcherType = 'Contra' | 'Journal' | 'Payment' | 'Receipt'
export type EntryItemType = {
    accId: number | null;
    amount: number;
    dc: 'D' | 'C';
    detailsId: number | null;
    instrNo: string;
    tranHeaderId: number | null;
    lineRefNo: string;
    lineRemarks: string;
}