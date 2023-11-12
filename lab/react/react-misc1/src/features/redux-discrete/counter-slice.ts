import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
    name: 'counter',
    initialState:{
        value: 0
    },
    reducers: {
        increment: (state: any)=>{
            state.value += 1;
        },
        decrement: (state: any)=>{
            state.value -= 1;
        },
        incrementByAmount:(state:any, action: incrementByAmountActionType)=>{
            state.value = state.value + action.payload.amount
        }
    }
})

export const {increment, decrement, incrementByAmount}  = counterSlice.actions
const {reducer} = counterSlice
export {reducer as counterReducer}

type incrementByAmountActionType = {
    payload: {
        amount: number
    }
}