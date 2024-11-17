import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'
import { String } from 'lodash'

const initialState: LoginType = {
  allBusinessUnits: undefined,
  allSecuredControls: undefined,
  currentBusinessUnit: undefined,
  currentBusinessUnits: undefined,
  isLoggedIn: false,
  role: undefined,
  token: undefined,
  userBusinessUnits: undefined,
  userDetails: undefined,
  userSecuredControls: undefined
}

export const loginSlice = createSlice({
  name: 'login',
  initialState: initialState,
  reducers: {
    doLogin: (state: LoginType, action: PayloadAction<LoginType>) => {
      state.allBusinessUnits = action.payload.allBusinessUnits
      state.allSecuredControls = action.payload.allSecuredControls
      state.isLoggedIn = true
      state.role = action.payload.role
      state.token = action.payload.token
      state.userBusinessUnits = action.payload.userBusinessUnits
      state.userDetails = action.payload.userDetails
      state.userSecuredControls = action.payload.userSecuredControls
    },

    doLogout: (state: LoginType) => {
      state.allBusinessUnits = undefined
      state.allSecuredControls = undefined
      state.currentBusinessUnit = undefined
      state.currentBusinessUnits = undefined
      state.isLoggedIn = false
      state.role = undefined
      state.token = undefined
      state.userBusinessUnits = undefined
      state.userDetails = undefined
      state.userSecuredControls = undefined
    },

    setCurrentBusinessUnit: (
      state: LoginType,
      action: PayloadAction<BusinessUnitType>
    ) => {
      state.currentBusinessUnit = {
        buId: action.payload.buId,
        buCode: action.payload.buCode,
        buName: action.payload.buName
      }
    },

    setCurrentBusinessUnits: (
      state: LoginType,
      action: PayloadAction<BusinessUnitType[]>
    ) => {
      state.currentBusinessUnits = action.payload
    },

    setUid: (state: LoginType, action: PayloadAction<setUidActonType>) => {
      if (!state.userDetails) {
        state.userDetails = {}
      }
      state.userDetails.uid = action.payload.uid
    }
  }
})

export const loginReducer = loginSlice.reducer
export const {
  doLogin,
  doLogout,
  setCurrentBusinessUnit,
  setCurrentBusinessUnits,
  setUid
} = loginSlice.actions

export type setUidActonType = {
  uid: string
}

export type UserDetailsType = {
  branchIds?: String
  clientCode?: string
  clientId?: number
  clientName?: string
  dbName?: string
  dbParams?: string
  hash?: string
  id?: number
  isUserActive?: boolean
  isClientActive?: boolean
  isExternalDb?: boolean
  lastUsedBranchId?: number
  lastUsedBuId?: number
  lastUsedFinYearId?: number
  mobileNo?: string
  uid?: string
  userEmail?: string
  userName?: string
  userType?: 'S' | 'A' | 'B' | undefined
}

export type AccSettingType = {
  settingsId: number
  key: string
  textValue: string
  jData: object
  intValue: number
}

export type BranchType = {
  branchId: number
  branchName: string
  branchCode: string
}

export type BusinessUnitType = {
  buCode?: string
  buId?: number
  buName?: string
}

export type FinYearType = {
  finYearId: number
  startDate: Date
  endDate: Date
}

export type RoleType = {
  clientId?: number
  roleId?: number
  roleName?: string
}

export type SecuredControlType = {
  controlName?: string
  controlNo?: number
  controlType?: string
  descr?: string
  id?: number
}

export type LoginType = {
  accSettings?: AccSettingType[]
  allBranches?: BranchType[]
  allBusinessUnits?: BusinessUnitType[]
  allFinYears?: FinYearType[]
  allSecuredControls?: SecuredControlType[]
  currentBranch?: BranchType
  currentBusinessUnit?: BusinessUnitType
  currentBusinessUnits?: BusinessUnitType[]
  currentFinYear?: FinYearType
  isLoggedIn: boolean
  role?: RoleType
  token: string | undefined
  userBusinessUnits?: BusinessUnitType[]
  userDetails?: UserDetailsType
  userSecuredControls?: SecuredControlType[]
}

// selectors
export const isLoggedInSelectorFn = (state: RootStateType) =>
  state.login.isLoggedIn

export const userTypeSelectorFn = (state: RootStateType) =>
  state.login.userDetails?.userType

export const currentBusinessUnitSelectorFn = (state: RootStateType) =>
  state.login.currentBusinessUnit

export const currentBusinessUnitsSelectorFn = (state: RootStateType) =>
  state.login.currentBusinessUnits
