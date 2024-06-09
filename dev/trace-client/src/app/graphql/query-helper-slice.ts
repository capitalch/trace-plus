import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { MapDataInstances } from './maps/map-data-instances'

const initialState: InitialStateType = {
  [MapDataInstances.superAdminDashBoard]: undefined
}

const queryHelperSlice = createSlice({
  name: 'queryHelper',
  initialState: initialState,
  reducers: {
    setQueryHelperDataR: (
      state: InitialStateType,
      action: PayloadAction<SetQueryHelperDataActionType>
    ) => {
      state[action.payload.instance] = action.payload.data
    }
  }
})

export const queryHelperReducer = queryHelperSlice.reducer
export const { setQueryHelperDataR } = queryHelperSlice.actions

type InitialStateType = {
  [key: string]: any
}

type SetQueryHelperDataActionType = {
  data: any
  instance: string
}

// Selector functions

