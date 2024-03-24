import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'

const initialState: InitialStateType = {
  isLoggedIn: false,
  email: '',
  token: undefined,
  uid: '',
  userType: ''
}

export const loginSlice = createSlice({
  name: 'login',
  initialState: initialState,
  reducers: {
    doLoginR: (
      state: InitialStateType,
      action: PayloadAction<DoLoginActionType>
    ) => {
      const userType = action?.payload?.userType
      state.isLoggedIn = true
      state.email = action?.payload?.email
      state.uid = action?.payload?.uid
      state.userType = userType
      state.token = action?.payload?.token
    },

    doLogoutR: (state: InitialStateType) => {
      state.isLoggedIn = false
      state.token = undefined
      state.email = ''
      state.uid = ''
      state.userType = ''
    }
  }
})

export const loginReducer = loginSlice.reducer
export const { doLoginR, doLogoutR } = loginSlice.actions

type DoLoginActionType = {
  email: string
  isLoggedIn: boolean
  token: string | undefined
  uid: string
  userType: string
}

type InitialStateType = {
  email: string
  isLoggedIn: boolean
  token: string | undefined
  uid: string
  userType: string
}

// selectors
export const isLoggedInSelectorFn = (state: RootStateType) =>
  state.login.isLoggedIn

export const userTypeSelectorFn = (state: RootStateType) => state.login.userType
