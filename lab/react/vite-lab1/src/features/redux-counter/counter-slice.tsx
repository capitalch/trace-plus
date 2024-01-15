import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
    name: 'counter',
    initialState: {
        count: 0
    },
    reducers: {

        doIncrement: (state: any, action: any) => {
            const step = action.payload.step
            state.count = state.count + step
        },
        doDecrement: (state: any, action: any) => {
            const step = action.payload.step
            state.count = state.count - step
        }
    }
})
const counterReducer = counterSlice.reducer
const { doIncrement, doDecrement } = counterSlice.actions
export { counterReducer, doIncrement, doDecrement }