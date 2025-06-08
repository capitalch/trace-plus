import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ReduxCompStateType = {

}

const accountPickerTreeSlice = createSlice({
    name: "accountPickerTree",
    initialState,
    reducers: {
        setAccountPickerAccId: (state: ReduxCompStateType, action: PayloadAction<AccountPickerTreePayloadActionType>) => {
            const instance = action.payload.instance;
            if (!state[instance]) {
                state[instance] = { id: null };
            }
            state[instance].id = action.payload.id;
        },
    }
})

export const accountPickerTreeReducer = accountPickerTreeSlice.reducer;
export const { setAccountPickerAccId } = accountPickerTreeSlice.actions;

type ReduxCompStateType = {
    [key: string]: {
        id: string | null
    };
}

type AccountPickerTreePayloadActionType = {
    instance: string;
    id: string | null

}