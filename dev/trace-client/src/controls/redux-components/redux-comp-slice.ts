import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'
import { ReduxCompLedgerSubledger } from './redux-comp-ledger-subledger'
import { ReduxComponentsInstances } from './redux-components-instances'

const initialState: ReduxCompInitialStateType = {
  reduxCompSwitch: {},
  reduxCompAppLoader: {},
  reduxCompLedgerSubledger: {
    [ReduxComponentsInstances.reduxCompLedgerSubledgerGeneralLedger]: {
      accountBalance: 0,
      hasError: true
    }
  }
}

const reduxCompSlice = createSlice({
  name: 'reduxComp',
  initialState: initialState,
  reducers: {
    // ReduxCompAppLoader
    showReduxCompAppLoader: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompAppLoaderActionType>
    ) => {
      const instance: string = action.payload.instance
      state.reduxCompAppLoader[instance] = action.payload.toShow
    },

    // ReduxCompLedgerSubledger
    setReduxCompLedgerSubledgerAccountBalance: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompLedgerSubledgerActionType>
    ) => {
      const instance: string = action.payload.instance
      if (!state.reduxCompLedgerSubledger[instance]) {
        state.reduxCompLedgerSubledger[instance] = { hasError: false, accountBalance:0 }
      }
      state.reduxCompLedgerSubledger[instance].accountBalance = action.payload.accountBalance
      // state.reduxCompLedgerSubledger[instance].hasError = action.payload.hasError
    },

    setReduxCompLedgerSubledgerDataForSubledger: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompLedgerSubledgerActionType>
    ) => {
      const instance: string = action.payload.instance
      if (!state.reduxCompLedgerSubledger[instance]) {
        state.reduxCompLedgerSubledger[instance] = { hasError: false }
      }
      state.reduxCompLedgerSubledger[instance].subLedgerData = action.payload.subLedgerData
      state.reduxCompLedgerSubledger[instance].hasError = action.payload.hasError
    },

    setReduxCompLedgerSubledgerFinalAccId: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompLedgerSubledgerActionType>
    ) => {
      const instance: string = action.payload.instance
      if (!state.reduxCompLedgerSubledger[instance]) {
        state.reduxCompLedgerSubledger[instance] = { hasError: false }
      }
      state.reduxCompLedgerSubledger[instance].finalAccId = action.payload.finalAccId
      state.reduxCompLedgerSubledger[instance].hasError = action.payload.hasError
    },

    setReduxCompLedgerSubledgerHasError: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompLedgerSubledgerActionType>
    ) => {
      const instance: string = action.payload.instance
      if (!state.reduxCompLedgerSubledger[instance]) {
        state.reduxCompLedgerSubledger[instance] = { hasError: false }
      }
      state.reduxCompLedgerSubledger[instance].hasError =
        action.payload.hasError
    },

    setReduxCompLedgerSubledgerLedgerAccId: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompLedgerSubledgerActionType>
    ) => {
      const instance: string = action.payload.instance
      if (!state.reduxCompLedgerSubledger[instance]) {
        state.reduxCompLedgerSubledger[instance] = { hasError: false }
      }
      state.reduxCompLedgerSubledger[instance].ledgerAccId = action.payload.ledgerAccId
      state.reduxCompLedgerSubledger[instance].hasError = action.payload.hasError
    },

    // ReduxCompSwitch
    changeReduxCompSwitch: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompSwitchActionStateType>
    ) => {
      const instance: string = action.payload.instance
      state.reduxCompSwitch[instance] = action.payload.switchState
    }
  }
})

export const reduxCompReducer = reduxCompSlice.reducer
export const {
  changeReduxCompSwitch,
  setReduxCompLedgerSubledgerAccountBalance,
  setReduxCompLedgerSubledgerFinalAccId,
  setReduxCompLedgerSubledgerHasError,
  setReduxCompLedgerSubledgerLedgerAccId,
  setReduxCompLedgerSubledgerDataForSubledger,
  showReduxCompAppLoader
} = reduxCompSlice.actions

type ReduxCompInitialStateType = {
  reduxCompSwitch: {
    [key: string]: boolean
  }
  reduxCompAppLoader: {
    [key: string]: boolean
  }
  reduxCompLedgerSubledger: {
    [key: string]: {
      accountBalance?: number
      finalAccId?: number | undefined
      hasError: boolean
      ledgerAccId?: number | undefined
      subLedgerData?: ReduxCompLedgerSubledgerAccountType[]
    }
  }
}

type ReduxCompAppLoaderActionType = {
  instance: string
  toShow: boolean
}

type ReduxCompLedgerSubledgerActionType = {
  accountBalance?: number
  instance: string
  finalAccId?: number | undefined
  hasError: boolean
  ledgerAccId?: number | undefined
  subLedgerData?: ReduxCompLedgerSubledgerAccountType[]
}

type ReduxCompLedgerSubledgerAccountType = {
  accLeaf: 'S'
  accName: string
  id: number
}

type ReduxCompSwitchActionStateType = {
  instance: string
  switchState: boolean
}

// selectors
// reduxCompSwitch
export const reduxCompSwitchSelectorFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.reduxCompSwitch[instance]

// reduxCompAppLoader
export const reduxCompAppLoaderSelectorFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.reduxCompAppLoader[instance]

// reduxCompLedgerSubledger
// accountBalance
export const reduxCompLedgerSubledgerAccountBalancedFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.reduxCompLedgerSubledger[instance].accountBalance || 0
// finalAccId
export const reduxCompLedgerSubledgerFinalAccIdFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.reduxCompLedgerSubledger[instance].finalAccId
// hasError
export const reduxCompLedgerSubledgerLedgerHasErrorFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.reduxCompLedgerSubledger[instance].hasError
// ledgerAccId
export const reduxCompLedgerSubledgerLedgerAccIdFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.reduxCompLedgerSubledger[instance].ledgerAccId
// subledgerData
export const reduxCompLedgerSubledgerDataForSubledgerFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.reduxCompLedgerSubledger[instance]?.subLedgerData