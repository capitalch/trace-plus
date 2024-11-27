import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootStateType } from "../../app/store/store"


const initialState: AccountsInitialStateType = {
    trialBalance: undefined
}

const accountsSlice = createSlice({
    name: 'accounts',
    initialState: initialState,
    reducers: {
        setTrialBalance: (state: AccountsInitialStateType, action: PayloadAction<AccountsInitialStateType>) => {
            state.trialBalance = action.payload.trialBalance
        }
    }
})

export const accountsReducer = accountsSlice.reducer
export const { setTrialBalance } = accountsSlice.actions


export type AccountsInitialStateType = {
    trialBalance?: FinalAccountsType[]
}

export type FinalAccountsType = {
    accCode: string,
    accLeaf: 'S' | 'Y' | 'L' | 'N'
    accName: string,
    accType: 'A' | 'L' | 'E' | 'I',
    closing: number,
    closing_dc: 'D' | 'C'
    credit: number,
    debit: number,
    id: number,
    opening: number,
    opening_dc: 'D' | 'C',
    parentId: number,
    children: number[]
}

// selectors
export const trialBalanceSelectorFn = (state: RootStateType)=>
    state.accounts.trialBalance