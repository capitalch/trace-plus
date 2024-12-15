import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'
// import { CompInstances } from './comp-instances'

const initialState: ReduxCompStateType = {
  compSwitch: {},
  compAppLoader: {},
  ledgerSubledger: {
    // [CompInstances.ledgerSubledgerGeneralLedger]: {
    //   accountBalance: 0,
    //   finalAccId:undefined,
    //   hasError: true
    // }
  }
}

const initializeNestedState = <T>(
  state: Record<string, T>,
  key: string,
  defaultValue: T
): void => {
  if (!state[key]) {
    state[key] = defaultValue;
  }
};

const compSlice = createSlice({
  name: 'reduxComp',
  initialState: initialState,
  reducers: {
    // CompAppLoader
    showCompAppLoader: (
      state: ReduxCompStateType,
      action: PayloadAction<{ instance: string; isVisible: boolean }>
    ) => {
      const instance: string = action.payload.instance
      state.compAppLoader[instance] = action.payload.isVisible
    },

    // LedgerSubledger
    updateLedgerSubledger: (state: ReduxCompStateType
      , action: PayloadAction<{
        instance: string
        updates: Partial<LedgerSubledgerInstanceType>
      }>) => {
      const { instance, updates } = action.payload;
      initializeNestedState(state.ledgerSubledger, instance, {
        accountBalance: 0,
        hasError: true
      })
      Object.entries(updates).forEach(([key, value]) => {
        // if (key in state.ledgerSubledger[instance]) {
          const li:any = state.ledgerSubledger[instance]
          li[key] = value
        // }
      });
    },

    // CompSwitch
    setCompSwitchState: (
      state: ReduxCompStateType,
      action: PayloadAction<{ instance: string; switchState: boolean }>
    ) => {
      const instance: string = action.payload.instance
      state.compSwitch[instance] = action.payload.switchState
    }
  }
})

export const reduxCompReducer = compSlice.reducer
export const {
  setCompSwitchState,
  showCompAppLoader,
  updateLedgerSubledger
} = compSlice.actions

//Types
type ReduxCompStateType = {
  compSwitch: Record<string, boolean>
  compAppLoader: Record<string, boolean>
  ledgerSubledger: Record<string, LedgerSubledgerInstanceType>
}

type LedgerSubledgerInstanceType = {
  accountBalance: number
  finalAccId?: number
  hasError: boolean
  ledgerAccId?: number
  ledgerandLeafData?: AccountType[]
  subLedgerData?: AccountType[]
}

type AccountType = {
  accLeaf: 'S' | 'L' | 'Y'
  accName: string
  id: number
}

// selectors
// compSwitch: Retrieves the switch state of the component
export const selectCompSwitchStateFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.compSwitch[instance]

// CompAppLoader: Retrieves the visibility state of a specific app loader
export const compAppLoaderVisibilityFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.compAppLoader[instance] || false

// ledgerSubledger
export const selectLedgerSubledgerFieldFn = (
  state: RootStateType
  , instance: string
  , key: keyof LedgerSubledgerInstanceType
) => state.reduxComp.ledgerSubledger[instance]?.[key]

