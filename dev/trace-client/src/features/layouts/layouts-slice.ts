import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootStateType } from "../../app/store/store";
// import { MenuItemType } from "../../utils/global-types-interfaces-enums";

const initialState: InitialStateType = {
  sideBar: {
    isSideBarOpen: false,
  },
  navBar: {
    menuItem: "accounts",
  },
};

export const layoutsSlice = createSlice({
  name: "layouts",
  initialState: initialState,
  reducers: {
    setIsSideBarOpen: (
      state: InitialStateType,
      action: PayloadAction<IsSideBarOpenActionType>
    ) => {
      state.sideBar.isSideBarOpen = action.payload.isSideBarOpen;
    },

    setMenuItem: (
      state: InitialStateType,
      action: PayloadAction<MenuItemActionType>
    ) => {
      state.navBar.menuItem = action.payload.menuItem;
    },
  },
});

export const layoutsReducer = layoutsSlice.reducer;
export const { setIsSideBarOpen, setMenuItem } = layoutsSlice.actions;

type IsSideBarOpenActionType = {
  isSideBarOpen: boolean;
};

export type MenuItemType = "accounts" | "superAdmin" | "admin";
type MenuItemActionType = {
  menuItem: MenuItemType;
};

type InitialStateType = {
  sideBar: {
    isSideBarOpen: boolean;
  };
  navBar: {
    menuItem: MenuItemType;
  };
};

// Selector functions
export const isSideBarOpenSelectorFn = (state: RootStateType) =>
  state.layouts.sideBar.isSideBarOpen;

export const menuItemSelectorFn = (state: RootStateType) =>
  state.layouts.navBar.menuItem;
