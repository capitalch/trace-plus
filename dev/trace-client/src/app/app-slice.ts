import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootStateType } from './store'

const initialState: InitialStateType = {
  login: {
    isLoggedIn: false,
    uid: '',
    email: '',
    userType: ''
  },
  count: 0
}
export const appSlice = createSlice({
  name: 'app',
  initialState: initialState,
  reducers: {

    doLogin: (state: InitialStateType, action:PayloadAction<DoLoginType>)=> {
        state.login.isLoggedIn = true
        state.login.email = action.payload.email
        state.login.uid = action.payload.uid
        state.login.userType = action.payload.userType
    },

    doLogout: (state: InitialStateType)=> {
        state.login.isLoggedIn = false
        state.login.email = ''
        state.login.uid = ''
        state.login.userType = ''
    }

    
  }
})

export const appReducer = appSlice.reducer
export const { doLogin, doLogout} = appSlice.actions

type DoLoginType = {
    email: string;
    uid: string;
    userType: string
}

type InitialStateType = {
  login: {
    isLoggedIn: boolean
    uid: string
    email: string
    userType: string
  }
  count: number
}

// type SetIsLoggedInType = {
//   isLoggedIn: boolean
// }

// Selector functions
export const isLoggedInSelectorFn = (state: RootStateType) =>
  state.app.login.isLoggedIn
