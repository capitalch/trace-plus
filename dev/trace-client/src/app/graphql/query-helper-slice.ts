import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { MapDataInstances } from './maps/map-data-instances'

const initialState: InitialStateType = {
  [MapDataInstances.superAdminDashBoard]: undefined,
  [MapDataInstances.superAdminClients]: undefined
}

const queryHelperSlice = createSlice({
  name: 'queryHelper',
  initialState: initialState,

  reducers: {
    setQueryHelperDataR: (
      state: InitialStateType,
      action: PayloadAction<SetQueryHelperDataActionType>
    ) => {
      state[action.payload.instance] = { }
      state[action.payload.instance].data = action.payload.data
    },

    setLastNoOfRowsR: (
      state: InitialStateType,
      action: PayloadAction<SetLastNoOfRowsActionType>
    ) => {
      if (!state[action.payload.instance]) {
        state[action.payload.instance] = { data: [], lastNoOfRows: '' }
      }
      state[action.payload.instance].lastNoOfRows = action.payload.lastNoOfRows
    }
  }
})

export const queryHelperReducer = queryHelperSlice.reducer
export const { setQueryHelperDataR, setLastNoOfRowsR } =
  queryHelperSlice.actions

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

type SetLastNoOfRowsActionType = {
  instance: string
  lastNoOfRows: string
}

// Selector functions
