import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { DataInstancesMap } from './maps/data-instances-map'

const initialState: InitialStateType = {
  [DataInstancesMap.superAdminDashBoard]: undefined,
  [DataInstancesMap.superAdminClients]: undefined
}

const queryHelperSlice = createSlice({
  name: 'queryHelper',
  initialState: initialState,

  reducers: {
    resetQueryHelperData: (
      state: InitialStateType,
      action: PayloadAction<ResetQueryHelperDataActionType>
    ) => {
      if (state[action.payload.instance]) {
        state[action.payload.instance] = { data: [] }
      }
    },
    setQueryHelperData: (
      state: InitialStateType,
      action: PayloadAction<SetQueryHelperDataActionType>
    ) => {
      if (!state[action.payload.instance]) {
        state[action.payload.instance] = { data: [] }
      }
      state[action.payload.instance].data = action.payload.data
    },

    setLastNoOfRows: (
      state: InitialStateType,
      action: PayloadAction<SetLastNoOfRowsActionType>
    ) => {
      if (!state[action.payload.instance]) {
        state[action.payload.instance] = { data: [], lastNoOfRows: '' }
      }
      state[action.payload.instance].lastNoOfRows = action.payload.lastNoOfRows
    },

    setSearchString: (
      state: InitialStateType,
      action: PayloadAction<SetSearchStringActionType>
    ) => {
      if (!state[action.payload.instance]) {
        state[action.payload.instance] = { data: [], searchString: '' }
      }
      state[action.payload.instance].searchString = action.payload.searchString
    }
  }
})

export const queryHelperReducer = queryHelperSlice.reducer
export const {
  resetQueryHelperData,
  setLastNoOfRows,
  setQueryHelperData,
  setSearchString
} = queryHelperSlice.actions

type InitialStateType = {
  [key: string]: any
  // {
  //   data: any
  //   lastNoOfRows: string
  // }
}

type SetQueryHelperDataActionType = {
  data: any
  instance: string
}

type ResetQueryHelperDataActionType = {
  instance: string
} 

type SetLastNoOfRowsActionType = {
  instance: string
  lastNoOfRows: string
}

type SetSearchStringActionType = {
  instance: string
  searchString: string
}

// Selector functions
