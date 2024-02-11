import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootStateType } from "./store";

const initialState: InitialStateType = {
  // accessToken:undefined,
  login: {
    isLoggedIn: false,
    uid: "",
    email: "",
    userType: "",
  },
  layouts: {
    isSideBarOpen: false,
  },
  count: 0,
};
export const appSlice = createSlice({
  name: "app",
  initialState: initialState,
  reducers: {
    doLogin: (
      state: InitialStateType,
      action: PayloadAction<DoLoginActionType>
    ) => {
      // state.accessToken = action?.payload?.accesstoken
      state.login.isLoggedIn = true;
      state.login.email = action?.payload?.email;
      state.login.uid = action?.payload?.uid;
      state.login.userType = action?.payload?.userType;
    },

    doLogout: (state: InitialStateType) => {
      state.login.isLoggedIn = false;
      state.login.email = "";
      state.login.uid = "";
      state.login.userType = "";
    },

    setIsSideBarOpen: (
      state: InitialStateType,
      action: PayloadAction<IsSideBarOpenActionType>
    ) => {
      state.layouts.isSideBarOpen = action.payload.isSideBarOpen;
    },
  },
});

export const appReducer = appSlice.reducer;
export const { doLogin, doLogout, setIsSideBarOpen } = appSlice.actions;

type IsSideBarOpenActionType = {
  isSideBarOpen: boolean;
};

type DoLoginActionType = {
  // accesstoken: string | undefined
  email: string;
  uid: string;
  userType: string;
  isLoggedIn: boolean;
};

type InitialStateType = {
  // accessToken: string | undefined
  login: {
    isLoggedIn: boolean;
    uid: string;
    email: string;
    userType: string;
  };
  layouts: {
    isSideBarOpen: boolean;
  };
  count: number;
};

// type SetIsLoggedInType = {
//   isLoggedIn: boolean
// }

// Selector functions
export const isLoggedInSelectorFn = (state: RootStateType) =>
  state.app.login.isLoggedIn;

export const isSideBarOpenSelectorFn = (state: RootStateType) =>
  state.app.layouts.isSideBarOpen;
