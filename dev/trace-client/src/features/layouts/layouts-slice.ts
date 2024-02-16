import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootStateType } from "../../app/store/store";

const initialState: InitialStateType = {
  sideBar: {
    isSideBarOpen: false,
  },
  navBar: {
    // selectedMenuItemName: "",
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
  },
});

export const layoutsReducer = layoutsSlice.reducer;
export const { setIsSideBarOpen } = layoutsSlice.actions;


type IsSideBarOpenActionType = {
  isSideBarOpen: boolean;
};
type InitialStateType = {
  sideBar: {
    isSideBarOpen: boolean;
  };
  navBar: {
    // selectedMenuItemName: string;
  };
};

// Selector functions
export const isSideBarOpenSelectorFn = (state: RootStateType) =>
  state.layouts.sideBar.isSideBarOpen;
