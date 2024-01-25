import { PayloadAction, createSlice } from "@reduxjs/toolkit";
// import { RootStateType } from "../../app/store";

const initialState: InitialStateType = {
    count: 0
}
export const counterSlice = createSlice({
    name: 'counter',
    initialState: initialState,
    reducers: {

        /**
         * Updates the count in the state by the specified step.
         *
         * @param {InitialStateType} state - The initial state
         * @param {PayloadAction<DoIncrementType>} action - The payload action for incrementing
         */
        doIncrement: (state: InitialStateType, action: PayloadAction<DoIncrementType>) => {
            const step = action.payload.step
            state.count = state.count + step
        },
        doDecrement: (state: InitialStateType, action: PayloadAction<DoDecrementType>) => {
            const step = action.payload.step
            state.count = state.count - step
        }
    }
})

const counterReducer = counterSlice.reducer
const { doIncrement, doDecrement } = counterSlice.actions
export { counterReducer, doIncrement, doDecrement }

type InitialStateType = {
    count: number
}

type DoIncrementType = {
    step: number
}

type DoDecrementType = {
    step: number
}