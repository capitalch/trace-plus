import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'

const initialState: ReduxCompInitialStateType = {
  reduxCompSwitch: {},
  reduxCompAppLoader: {},
  reduxCompLedgerSubledger: {}
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
    setReduxCompLedgerSubledgerFinalAccId: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompLedgerSubledgerActionType>) => {
      const instance: string = action.payload.instance
      state.reduxCompLedgerSubledger[instance] = {}
      state.reduxCompLedgerSubledger[instance].finalAccId = action.payload.finalAccId
    },

    setReduxCompLedgerSubledgerLedgerAccId: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompLedgerSubledgerActionType>) => {
      const instance: string = action.payload.instance
      state.reduxCompLedgerSubledger[instance] = {}
      state.reduxCompLedgerSubledger[instance].ledgerAccId = action.payload.ledgerAccId
    },

    setReduxCompLedgerSubledgerDataForSubledger: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompLedgerSubledgerActionType>) => {
      const instance: string = action.payload.instance
      state.reduxCompLedgerSubledger[instance] = {}
      state.reduxCompLedgerSubledger[instance].subLedgerData = action.payload.subLedgerData
    },

    // ReduxCompSwitch
    changeReduxCompSwitch: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompSwitchActionStateType>
    ) => {
      const instance: string = action.payload.instance
      state.reduxCompSwitch[instance] = action.payload.switchState
    },

  }
})

export const reduxCompReducer = reduxCompSlice.reducer
export const {
  changeReduxCompSwitch
  , setReduxCompLedgerSubledgerFinalAccId
  , setReduxCompLedgerSubledgerLedgerAccId
  , setReduxCompLedgerSubledgerDataForSubledger
  , showReduxCompAppLoader } = reduxCompSlice.actions

type ReduxCompInitialStateType = {
  reduxCompSwitch: {
    [key: string]: boolean
  }
  reduxCompAppLoader: {
    [key: string]: boolean
  }
  reduxCompLedgerSubledger: {
    [key: string]: {
      // isError?: boolean
      finalAccId?: number | undefined
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
  instance: string
  finalAccId?: number | undefined
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
export const reduxCompSwitchSelectorFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.reduxCompSwitch[instance]

export const reduxCompAppLoaderSelectorFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.reduxCompAppLoader[instance]
