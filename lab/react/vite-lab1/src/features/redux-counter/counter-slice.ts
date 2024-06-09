import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store'

const initialState: InitialStateType = {
  value: 0
}
export const counterSlice = createSlice({
  name: 'counter',
  initialState: initialState,
  reducers: {
    incrementR: (state: InitialStateType) => {
      state.value += 1
    },
    decrementR: (state: InitialStateType) => {
      state.value -= 1
    },
    incrementByAmountR: (state: InitialStateType, action: PayloadAction<IncrementByAmountType>) => {
      state.value += action.payload.amount
    }
  }
})

export const counterReducer = counterSlice.reducer
export const { incrementR, decrementR, incrementByAmountR } = counterSlice.actions

export const countSelectorFn = (state: RootStateType) => state.counter.value

export type InitialStateType = {
  value: number
}

type IncrementByAmountType = {
  amount: number
}
