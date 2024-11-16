import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'
import { String } from 'lodash'

const initialState: LoginType = {
  allBusinessUnits: undefined,
  allSecuredControls: undefined,
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
    doLogin: (
      state: LoginType,
      action: PayloadAction<LoginType>
    ) => {
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
      state.isLoggedIn = false
      state.role = undefined
      state.token = undefined
      state.userBusinessUnits = undefined
      state.userDetails = undefined
      state.userSecuredControls = undefined
    },

    setUid: (
      state: LoginType,
      action: PayloadAction<setUidActonType>
    ) => {
      if (!state.userDetails) {
        state.userDetails = {}
      }
      state.userDetails.uid = action.payload.uid
    },
  }
})

export const loginReducer = loginSlice.reducer
export const { doLogin, doLogout, setUid } = loginSlice.actions
export type setUidActonType = {
  uid: string
}

// selectors
export const isLoggedInSelectorFn = (state: RootStateType) =>
  state.login.isLoggedIn

export const userTypeSelectorFn = (state: RootStateType) => state.login.userDetails?.userType


export type UserDetailsType = {
  branchIds?: String;
  clientCode?: string;
  clientId?: number;
  clientName?: string;
  dbName?: string;
  dbParams?: Record<string, string | number>;
  hash?: string;
  id?: number;
  isUserActive?: boolean;
  isClientActive?: boolean;
  isExternalDb?: boolean;
  lastUsedBranchId?: number;
  lastUsedBuId?: number;
  mobileNo?: string;
  uid?: string;
  userEmail?: string;
  userName?: string;
  userType?: 'S' | 'A' | 'B' | undefined;
};

export type BusinessUnitType = {
  buCode?: string;
  buId?: number;
  buName?: string;
};

export type RoleType = {
  clientId?: number;
  roleId?: number;
  roleName?: string;
};

export type SecuredControlType = {
  controlName?: string;
  controlNo?: number;
  controlType?: string;
  descr?: string;
  id?: number;
};

export type LoginType = {
  allBusinessUnits?: BusinessUnitType[];
  allSecuredControls?: SecuredControlType[];
  isLoggedIn: boolean;
  role?: RoleType;
  token: string | undefined;
  userBusinessUnits?: BusinessUnitType[];
  userDetails?: UserDetailsType;
  userSecuredControls?: SecuredControlType[];
};