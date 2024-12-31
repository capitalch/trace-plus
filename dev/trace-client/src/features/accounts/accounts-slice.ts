import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'

const initialState: AccountsInitialStateType = {
  bankRecon: {
    selectedBank: {
      accId: undefined,
      accName: ''
    }
  }
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
  }
})

export const accountsReducer = accountsSlice.reducer
export const { selectBank } = accountsSlice.actions

export type AccountsInitialStateType = {
  bankRecon: { selectedBank: SelectedBankType }
}

export type SelectedBankType = {
  accId: number | undefined
  accName: string
}

// selectors
export const bankReconSelectedBankFn = (state: RootStateType) =>
  state.accounts.bankRecon.selectedBank
