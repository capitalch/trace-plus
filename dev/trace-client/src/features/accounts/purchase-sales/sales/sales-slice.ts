import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: SalesInitialStateType = {
    savedFormData: null,
    isViewMode: false,
    searchQuery: '',
    lastSalesEditData: null,
}

const salesSlice = createSlice({
    name: 'sales',
    initialState: initialState,

    reducers: {
        saveSalesFormData(state, action: PayloadAction<any>) {
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
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
        },
        clearSearchQuery(state) {
            state.searchQuery = '';
        },
        setLastSalesEditData(state, action: PayloadAction<any>) {
            state.lastSalesEditData = action.payload;
        },
        clearLastSalesEditData(state) {
            state.lastSalesEditData = null;
        },
    }
})

export const salesReducer = salesSlice.reducer;
export const {
    saveSalesFormData,
    clearSalesFormData,
    toggleSalesViewMode,
    setSalesViewMode,
    setSearchQuery,
    clearSearchQuery,
    setLastSalesEditData,
    clearLastSalesEditData
} = salesSlice.actions

export type SalesInitialStateType = {
    savedFormData: any ; //SalesFormDataType | null;
    isViewMode: boolean;
    searchQuery: string;
    lastSalesEditData: any; // Store the last successfully saved sales data for print preview
}