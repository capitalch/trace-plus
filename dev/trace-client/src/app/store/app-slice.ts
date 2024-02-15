import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootStateType } from "./store";
import {
  TopNavBarSelectedMenuItemNameEnum,
  UserTypesEnum,
} from "../../utils/global-types-interfaces-enums";

const initialState: InitialStateType = {
  // accessToken:undefined,
  login: {
    isLoggedIn: false,
    uid: "",
    email: "",
    userType: "",
  },
  layouts: {
    sideBar: {
      isSideBarOpen: false,
    },
    topNavBar: {
      selectedMenuItemName: "",
    },
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
      const userType = action?.payload?.userType;
      state.login.isLoggedIn = true;
      state.login.email = action?.payload?.email;
      state.login.uid = action?.payload?.uid;
      state.login.userType = userType;
      if (userType === UserTypesEnum.Admin) {
        state.layouts.topNavBar.selectedMenuItemName =
          TopNavBarSelectedMenuItemNameEnum.Accounts;
      } else if (userType === UserTypesEnum.BusinessUser) {
        state.layouts.topNavBar.selectedMenuItemName =
          TopNavBarSelectedMenuItemNameEnum.Accounts;
      } else {
        state.layouts.topNavBar.selectedMenuItemName =
          TopNavBarSelectedMenuItemNameEnum.SuperAdmin;
      }
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
      state.layouts.sideBar.isSideBarOpen = action.payload.isSideBarOpen;
    },

    // setTopNavBarActiveMenuIte
  },
});

export const appReducer = appSlice.reducer;
export const { doLogin, doLogout, setIsSideBarOpen } = appSlice.actions;

type IsSideBarOpenActionType = {
  isSideBarOpen: boolean;
};

type DoLoginActionType = {
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
    sideBar: {
      isSideBarOpen: boolean;
    };
    topNavBar: {
      selectedMenuItemName: string;
    };
  };
  count: number;
};

// Selector functions
export const isLoggedInSelectorFn = (state: RootStateType) =>
  state.app.login.isLoggedIn;

export const isSideBarOpenSelectorFn = (state: RootStateType) =>
  state.app.layouts.sideBar.isSideBarOpen;

export const userTypeSelectorFn = (state: RootStateType) =>
  state.app.login.userType;

export const topNavBarSelectedMenuItemNameSelectorFn = (state: RootStateType) =>
  state.app.layouts.topNavBar.selectedMenuItemName;
