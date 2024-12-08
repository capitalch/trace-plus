import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'

const initialState: ReduxCompInitialStateType = {
  reduxCompSwitch: {},
  reduxCompAppLoader: {}
}

const reduxCompSlice = createSlice({
  name: 'reduxComp',
  initialState: initialState,
  reducers: {
    changeReduxCompSwitch: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompSwitchActionStateType>
    ) => {
      const instance: string = action.payload.instance
      state.reduxCompSwitch[instance] = action.payload.switchState
    },
    showReduxCompAppLoader: (
      state: ReduxCompInitialStateType,
      action: PayloadAction<ReduxCompAppLoaderActionType>
    ) => {
      const instance: string = action.payload.instance
      state.reduxCompAppLoader[instance] = action.payload.toShow
    }
  }
})

export const reduxCompReducer = reduxCompSlice.reducer
export const { changeReduxCompSwitch, showReduxCompAppLoader } =
  reduxCompSlice.actions

type ReduxCompInitialStateType = {
  reduxCompSwitch: {
    [key: string]: boolean
  }
  reduxCompAppLoader: {
    [key: string]: boolean
  }
}

type ReduxCompAppLoaderActionType = {
  instance: string
  toShow: boolean
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
