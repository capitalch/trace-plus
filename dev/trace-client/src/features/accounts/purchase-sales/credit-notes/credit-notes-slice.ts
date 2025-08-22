import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DebitCreditNoteFormDataType } from "../debit-notes/debit-notes";

const initialState: CreditNoteInitialStateType = {
    savedFormData: null,
}

const creditNotesSlice = createSlice({
    name: 'creditNotes',
    initialState: initialState,

    reducers: {
        saveCreditNoteFormData(state, action: PayloadAction<DebitCreditNoteFormDataType>) {
            state.savedFormData = action.payload;
        },
        clearCreditNoteFormData(state) {
            state.savedFormData = null;
        },
    }
})

export const creditNotesReducer = creditNotesSlice.reducer;
export const {
    saveCreditNoteFormData
    , clearCreditNoteFormData
} = creditNotesSlice.actions

type CreditNoteInitialStateType = {
    savedFormData: DebitCreditNoteFormDataType | null;
}