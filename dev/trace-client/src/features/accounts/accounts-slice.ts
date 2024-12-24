import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'

const initialState: AccountsInitialStateType = {
  bankRecon: {
    selectedBank: {
      accId: undefined,
      accName: ''
    }
  }
  // trialBalance: undefined
}

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: initialState,
  reducers: {
    selectBank: (
      state: AccountsInitialStateType,
      action: PayloadAction<SelectedBankType>
    ) => {
      state.bankRecon.selectedBank = action.payload
    }
    // setTrialBalance: (state: AccountsInitialStateType, action: PayloadAction<AccountsInitialStateType>) => {
    //     state.trialBalance = action.payload.trialBalance
    // }
  }
})

export const accountsReducer = accountsSlice.reducer
export const { selectBank } = accountsSlice.actions

export type AccountsInitialStateType = {
  bankRecon: { selectedBank: SelectedBankType }
  // trialBalance?: FinalAccountsType[]
}

export type SelectedBankType = {
  accId: number | undefined
  accName: string
}

// export type FinalAccountsType = {
//     accCode: string,
//     accLeaf: 'S' | 'Y' | 'L' | 'N'
//     accName: string,
//     accType: 'A' | 'L' | 'E' | 'I',
//     closing: number,
//     closing_dc: 'D' | 'C'
//     credit: number,
//     debit: number,
//     id: number,
//     opening: number,
//     opening_dc: 'D' | 'C',
//     parentId: number,
//     children: number[]
// }

// selectors
export const bankReconSelectedBankFn = (state: RootStateType) =>
  state.accounts.bankRecon.selectedBank
// export const trialBalanceSelectorFn = (state: RootStateType)=>
//     state.accounts.trialBalance
