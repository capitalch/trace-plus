// import { PayloadAction, createSlice } from "@reduxjs/toolkit";
// import { RootStateType } from "./store";


// const initialState: InitialStateType = {
//   login: {
//     isLoggedIn: false,
//     uid: "",
//     email: "",
//     userType: "",
//   },
//   layouts: {
//     sideBar: {
//       isSideBarOpen: false,
//     },
//     navBar: {
//       // selectedMenuItemName: "",
//     },
//   },
//   count: 0,
// };

// export const appSlice = createSlice({
//   name: "app",
//   initialState: initialState,
//   reducers: {
//     doLogin: (
//       state: InitialStateType,
//       action: PayloadAction<DoLoginActionType>
//     ) => {
//       const userType = action?.payload?.userType;
//       state.login.isLoggedIn = true;
//       state.login.email = action?.payload?.email;
//       state.login.uid = action?.payload?.uid;
//       state.login.userType = userType;
//     },

//     doLogout: (state: InitialStateType) => {
//       state.login.isLoggedIn = false;
//       state.login.email = "";
//       state.login.uid = "";
//       state.login.userType = "";
//     },

//     setIsSideBarOpen: (
//       state: InitialStateType,
//       action: PayloadAction<IsSideBarOpenActionType>
//     ) => {
//       state.layouts.sideBar.isSideBarOpen = action.payload.isSideBarOpen;
//     },

//     // setTopNavBarActiveMenuIte
//   },
// });

// export const appReducer = appSlice.reducer;
// export const { doLogin, doLogout, setIsSideBarOpen } = appSlice.actions;

// type IsSideBarOpenActionType = {
//   isSideBarOpen: boolean;
// };

// type DoLoginActionType = {
//   email: string;
//   uid: string;
//   userType: string;
//   isLoggedIn: boolean;
// };

// type InitialStateType = {
//   // accessToken: string | undefined
//   login: {
//     isLoggedIn: boolean;
//     uid: string;
//     email: string;
//     userType: string;
//   };
//   layouts: {
//     sideBar: {
//       isSideBarOpen: boolean;
//     };
//     navBar: {
//       // selectedMenuItemName: string;
//     };
//   };
//   count: number;
// };

// Selector functions
// export const isLoggedInSelectorFn = (state: RootStateType) =>
//   state.app.login.isLoggedIn;

// export const isSideBarOpenSelectorFn = (state: RootStateType) =>
//   state.app.layouts.sideBar.isSideBarOpen;

// export const userTypeSelectorFn = (state: RootStateType) =>
//   state.app.login.userType;
