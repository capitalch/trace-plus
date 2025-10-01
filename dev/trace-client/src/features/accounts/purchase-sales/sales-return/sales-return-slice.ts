import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: SalesReturnInitialStateType = {
    savedFormData: null,
    isViewMode: false,
    searchQuery: '',
    lastSalesReturnEditData: null,
}

const salesReturnSlice = createSlice({
    name: 'salesReturn',
    initialState: initialState,

    reducers: {
        saveSalesReturnFormData(state, action: PayloadAction<any>) {
            state.savedFormData = action.payload;
        },
        clearSalesReturnFormData(state) {
            state.savedFormData = null;
        },
        toggleSalesReturnViewMode(state) {
            state.isViewMode = !state.isViewMode;
        },
        setSalesReturnViewMode(state, action: PayloadAction<boolean>) {
            state.isViewMode = action.payload;
        },
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
        },
        clearSearchQuery(state) {
            state.searchQuery = '';
        },
        setLastSalesReturnEditData(state, action: PayloadAction<any>) {
            state.lastSalesReturnEditData = action.payload;
        },
        clearLastSalesReturnEditData(state) {
            state.lastSalesReturnEditData = null;
        },
    }
})

export const salesReturnReducer = salesReturnSlice.reducer;
export const {
    saveSalesReturnFormData,
    clearSalesReturnFormData,
    toggleSalesReturnViewMode,
    setSalesReturnViewMode,
    setSearchQuery,
    clearSearchQuery,
    setLastSalesReturnEditData,
    clearLastSalesReturnEditData
} = salesReturnSlice.actions

export type SalesReturnInitialStateType = {
    savedFormData: any; //SalesReturnFormDataType | null;
    isViewMode: boolean;
    searchQuery: string;
    lastSalesReturnEditData: any; // Store the last successfully saved sales return data for print preview
}