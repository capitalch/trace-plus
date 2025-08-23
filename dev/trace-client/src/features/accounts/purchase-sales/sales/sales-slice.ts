import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SalesFormDataType } from "./all-sales/all-sales";

const initialState: SalesInitialStateType = {
    savedFormData: null,
}

const salesSlice = createSlice({
    name: 'sales',
    initialState: initialState,

    reducers: {
        saveSalesFormData(state, action: PayloadAction<SalesFormDataType>) {
            state.savedFormData = action.payload;
        },
        clearSalesFormData(state) {
            state.savedFormData = null;
        },
    }
})

export const salesReducer = salesSlice.reducer;
export const {
    saveSalesFormData
    , clearSalesFormData
} = salesSlice.actions

export type SalesInitialStateType = {
    savedFormData: SalesFormDataType | null;
}