import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SalesFormDataType } from "./all-sales";

const initialState: SalesInitialStateType = {
    savedFormData: null,
    isViewMode: false,
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
        toggleSalesViewMode(state) {
            state.isViewMode = !state.isViewMode;
        },
        setSalesViewMode(state, action: PayloadAction<boolean>) {
            state.isViewMode = action.payload;
        },
    }
})

export const salesReducer = salesSlice.reducer;
export const {
    saveSalesFormData,
    clearSalesFormData,
    toggleSalesViewMode,
    setSalesViewMode
} = salesSlice.actions

export type SalesInitialStateType = {
    savedFormData: SalesFormDataType | null;
    isViewMode: boolean;
}