import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'

const initialState: InitialLoginStateType = {
  isLoggedIn: false,
  businessUnits: [],
  clientCode: undefined,
  clientId: undefined,
  clientName: undefined,
  email: undefined,
  id: undefined,
  isClentActive: false,
  isUserActive: false,
  lastUsedBranchId: undefined,
  lastUsedBuId: undefined,
  mobileNo: undefined,
  roleId: undefined,
  roleName: undefined,
  token: undefined,
  uid: undefined,
  userName: undefined,
  userType: undefined
}

export const loginSlice = createSlice({
  name: 'login',
  initialState: initialState,
  reducers: {
    doLogin: (
      state: InitialLoginStateType,
      action: PayloadAction<DoLoginActionType>
    ) => {
      state.isLoggedIn = true
      state.businessUnits = action.payload.businessUnits
      state.clientCode = action.payload.clientCode
      state.clientId = action.payload.clientId
      state.clientName = action.payload.clientName
      state.email = action.payload.email
      state.id = action.payload.id
      state.isClentActive = action.payload.isClentActive
      state.isUserActive = action.payload.isUserActive
      state.lastUsedBranchId = action.payload.lastUsedBranchId
      state.lastUsedBuId = action.payload.lastUsedBuId
      state.mobileNo = action.payload.mobileNo
      state.userName = action.payload.userName
      state.token = action.payload.token
      state.uid = action.payload.uid
      state.userType = action.payload.userType
    },

    doLogout: (state: InitialLoginStateType) => {
      state.isLoggedIn = false
      state.businessUnits = []
      state.clientCode = undefined
      state.clientId = undefined
      state.clientName = undefined
      state.email = undefined
      state.id = undefined
      state.isClentActive = false
      state.isUserActive = false
      state.lastUsedBranchId = undefined
      state.lastUsedBuId = undefined
      state.mobileNo = undefined
      state.userName = undefined
      state.token = undefined
      state.uid = undefined
      state.userType = undefined
    },

    setUid: (
      state: InitialLoginStateType,
      action: PayloadAction<setUidActonType>
    ) => {
      state.uid = action.payload.uid
    },
  }
})

export const loginReducer = loginSlice.reducer
export const { doLogin, doLogout, setUid } = loginSlice.actions

type DoLoginActionType = InitialLoginStateType

export type InitialLoginStateType = {
  isLoggedIn: boolean
  businessUnits: string[] | undefined
  clientCode: string | undefined
  clientId: string | undefined
  clientName: string | undefined
  email: string | undefined
  id: string | undefined
  isClentActive: boolean
  isUserActive: boolean
  lastUsedBranchId: string | undefined
  lastUsedBuId: string | undefined
  mobileNo: string | undefined
  roleId: string | undefined
  roleName: string | undefined
  token: string | undefined
  uid: string | undefined
  userName: string | undefined
  userType: 'S' | 'A' | 'B' | undefined
}

export type setUidActonType = {
  uid: string
}

// selectors
export const isLoggedInSelectorFn = (state: RootStateType) =>
  state.login.isLoggedIn

export const userTypeSelectorFn = (state: RootStateType) => state.login.userType
