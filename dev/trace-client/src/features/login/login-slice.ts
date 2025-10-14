import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store'
import { String } from 'lodash'

const initialState: LoginType = {
  allBusinessUnits: undefined,
  allSecuredControls: undefined,
  currentBusinessUnit: undefined,
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
      state.accSettings = undefined
      state.allBranches = undefined
      state.allBusinessUnits = undefined
      state.allFinYears = undefined
      state.allSecuredControls = undefined
      state.currentBranch = undefined
      state.currentBusinessUnit = undefined
      state.currentFinYear = undefined
      state.isLoggedIn = false
      state.role = undefined
      state.token = undefined
      state.userBusinessUnits = undefined
      state.userDetails = undefined
      state.userSecuredControls = undefined
    },

    setCurrentBranch: (
      state: LoginType,
      action: PayloadAction<BranchType>
    ) => {
      state.currentBranch = action.payload
    },

    setAllBusinessUnits: (
      state: LoginType,
      action: PayloadAction<BusinessUnitType[]>
    ) => {
      state.allBusinessUnits = action.payload
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

    setCurrentDateFormat: (
      state: LoginType,
      action: PayloadAction<string>
    ) => {
      state.currentDateFormat = action.payload
    },

    setCurrentFinYear: (
      state: LoginType,
      action: PayloadAction<FinYearType>
    ) => {
      state.currentFinYear = action.payload
    },

    setFinYearsBranchesAccSettings: (
      state: LoginType
      , action: PayloadAction<FinYearsBranchesAccSettingsType>) => {
      state.accSettings = action.payload.accSettings
      state.allFinYears = action.payload.finYears
      state.allBranches = action.payload.branches
    },

    setDecodedDbParamsObject: (
      state: LoginType,
      action: PayloadAction<any>
    ) => {
      if (!state.userDetails) {
        state.userDetails = {}
      }
      state.userDetails.decodedDbParamsObject = action.payload
    },

    setToken: (state: LoginType,
      action: PayloadAction<string>) => {
      state.token = action.payload
    },

    setUserBusinessUnits: (
      state: LoginType,
      action: PayloadAction<BusinessUnitType[]>
    ) => {
      state.userBusinessUnits = action.payload
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
  setAllBusinessUnits,
  setCurrentBranch,
  setCurrentBusinessUnit,
  setCurrentDateFormat,
  setCurrentFinYear,
  setDecodedDbParamsObject,
  setFinYearsBranchesAccSettings,
  setToken,
  setUserBusinessUnits,
  setUid
} = loginSlice.actions

export type setUidActonType = {
  uid: string
}

export type FinYearsBranchesAccSettingsType = {
  accSettings: AccSettingType[],
  finYears: FinYearType[],
  branches?: BranchType[]
}

export type UserDetailsType = {
  branchIds?: String
  clientCode?: string
  clientId?: number
  clientName?: string
  dbName?: string
  dbParams?: string
  decodedDbParamsObject?: { [key: string]: string | undefined }
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
  jData: any
  intValue: number
}

export type BranchAddressType = {
  address1: string
  address2?: string
  pin: string
  phones?: string
  email?: string
  stateCode?: string
}

export type BranchJDataType = {
  address?: BranchAddressType
  gstin?: string
}

export type BranchType = {
  branchId: number
  branchName: string
  branchCode: string
  jData?: BranchJDataType | null
}

export type BusinessUnitType = {
  buCode?: string
  buId?: number
  buName?: string
}

export type FinYearType = {
  finYearId: number
  startDate: string
  endDate: string
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
  currentDateFormat?: string
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

export const userBusinessUnitsSelectorFn = (state: RootStateType) =>
  state.login.userBusinessUnits

export const allFinYearsSelectorFn = (state: RootStateType) =>
  state.login.allFinYears

export const allBranchesSelectorFn = (state: RootStateType) =>
  state.login.allBranches

export const allFinYearsBranchesSelectorFn = createSelector(
  [allFinYearsSelectorFn, allBranchesSelectorFn],
  (allFinYears, allBranches) => ({
    allFinYears: allFinYears,
    allBranches: allBranches
  }))

export const currentFinYearSelectorFn = (state: RootStateType) =>
  state.login.currentFinYear

export const currentBranchSelectorFn = (state: RootStateType) =>
  state.login.currentBranch

export const currentDateFormatSelectorFn = (state: RootStateType) =>
  state.login.currentDateFormat

