import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootStateType } from "../../app/store/store";

const initialState: InitialStateType = {
  isLoggedIn: false,
  uid: "",
  email: "",
  userType: "",
};

export const loginSlice = createSlice({
    name: "login",
    initialState: initialState,
    reducers: {
      doLogin: (
        state: InitialStateType,
        action: PayloadAction<DoLoginActionType>
      ) => {
        const userType = action?.payload?.userType;
        state.isLoggedIn = true;
        state.email = action?.payload?.email;
        state.uid = action?.payload?.uid;
        state.userType = userType;
      },
  
      doLogout: (state: InitialStateType) => {
        state.isLoggedIn = false;
        state.email = "";
        state.uid = "";
        state.userType = "";
      },
  
    },
  });
  
  export const loginReducer = loginSlice.reducer;
  export const { doLogin, doLogout, } = loginSlice.actions;
  
  type DoLoginActionType = {
    email: string;
    uid: string;
    userType: string;
    isLoggedIn: boolean;
  };
  

type InitialStateType = {
  isLoggedIn: boolean;
  uid: string;
  email: string;
  userType: string;
};

export const isLoggedInSelectorFn = (state: RootStateType) =>
  state.login.isLoggedIn;

  export const userTypeSelectorFn = (state: RootStateType) =>
  state.login.userType;