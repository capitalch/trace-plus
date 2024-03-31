import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'

const initialState: InitialLoginStateType = {
  isLoggedIn: false,
  businessUnits: [],
  clientCode: undefined,
  clientId: undefined,
  clientName: undefined,
  email: undefined,
  isClentActive: false,
  isUserActive: false,
  lastUsedBranchId: undefined,
  lastUsedBuId: undefined,
  mobileNo: undefined,
  name: undefined,
  token: undefined,
  uid: undefined,
  userType: undefined
}

export const loginSlice = createSlice({
  name: 'login',
  initialState: initialState,
  reducers: {
    doLoginR: (
      state: InitialLoginStateType,
      action: PayloadAction<DoLoginActionType>
    ) => {
      state.isLoggedIn = true
      state.businessUnits = action.payload.businessUnits
      state.clientCode = action.payload.clientCode
      state.clientId = action.payload.clientId
      state.clientName = action.payload.clientName
      state.email = action.payload.email
      state.isClentActive = action.payload.isClentActive
      state.isUserActive = action.payload.isUserActive
      state.lastUsedBranchId = action.payload.lastUsedBranchId
      state.lastUsedBuId = action.payload.lastUsedBuId
      state.mobileNo = action.payload.mobileNo
      state.name = action.payload.name
      state.token = action.payload.token
      state.uid = action.payload.uid
      state.userType = action.payload.userType
    },

    doLogoutR: (state: InitialLoginStateType) => {
      state.isLoggedIn = false
      state.businessUnits = []
      state.clientCode = undefined
      state.clientId = undefined
      state.clientName = undefined
      state.email = undefined
      state.isClentActive = false
      state.isUserActive = false
      state.lastUsedBranchId = undefined
      state.lastUsedBuId = undefined
      state.mobileNo = undefined
      state.name = undefined
      state.token = undefined
      state.uid = undefined
      state.userType = undefined
    }
  }
})

export const loginReducer = loginSlice.reducer
export const { doLoginR, doLogoutR } = loginSlice.actions

type DoLoginActionType = InitialLoginStateType

type InitialLoginStateType = {
  isLoggedIn: boolean
  businessUnits: string[] | undefined
  clientCode: string | undefined
  clientId: string | undefined
  clientName: string | undefined
  email: string | undefined
  isClentActive: boolean
  isUserActive: boolean
  lastUsedBranchId: string | undefined
  lastUsedBuId: string | undefined
  mobileNo: string | undefined
  name: string | undefined
  token: string | undefined
  uid: string | undefined
  userType: 'S' | 'A' | 'B' | undefined
}

// selectors
export const isLoggedInSelectorFn = (state: RootStateType) =>
  state.login.isLoggedIn

export const userTypeSelectorFn = (state: RootStateType) => state.login.userType

// export type LoginInfoType = {
//   businessUnits: string[]
//   clientCode: string
//   clientId: string
//   clientName: string
//   email: string
//   isClentActive: boolean
//   isUserActive: boolean
//   lastUsedBrandId: string
//   lastUsedBuId: string
//   mobileNo: string
//   name: string
//   token: string
//   uid: string
//   userType: string
// }
