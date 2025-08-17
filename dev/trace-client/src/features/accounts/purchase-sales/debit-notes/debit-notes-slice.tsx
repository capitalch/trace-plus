import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DebitNoteFormDataType } from "./debit-notes";

const initialState: DebitNoteInitialStateType = {
    savedFormData: null,
}

const debitNotesSlice = createSlice({
    name: 'debitNotes',
    initialState: initialState,

    reducers: {
        saveDebitNoteFormData(state, action: PayloadAction<DebitNoteFormDataType>) {
            state.savedFormData = action.payload;
        },
        clearDebitNoteFormData(state) {
            state.savedFormData = null;
        },
    }
})

export const debitNotesReducer = debitNotesSlice.reducer;
export const {
    saveDebitNoteFormData
    , clearDebitNoteFormData
} = debitNotesSlice.actions

type DebitNoteInitialStateType = {
    savedFormData: DebitNoteFormDataType | null;
}