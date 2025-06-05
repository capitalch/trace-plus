import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootStateType } from '../../app/store/store'

const initialState: InitialStateType = {
  sideBar: {
    isSideBarOpen: false,
    selectedChildId: '',
    selectedParentId: ''
  },
  navBar: {
    menuItem: 'accounts',
    toShowNavBarDropDown: false,
  }
}

export const layoutsSlice = createSlice({
  name: 'layouts',
  initialState: initialState,
  reducers: {
    // navbar
    setShowNavBarDropDown: (
      state: InitialStateType,
      action: PayloadAction<ShowNavBarDropDownActionType>
    ) => {
      state.navBar.toShowNavBarDropDown = action.payload.toShowNavBarDropDown
    },

    // sidebar
    setIsSideBarOpen: (
      state: InitialStateType,
      action: PayloadAction<IsSideBarOpenActionType>
    ) => {
      state.sideBar.isSideBarOpen = action.payload.isSideBarOpen
    },

    setMenuItem: (
      state: InitialStateType,
      action: PayloadAction<MenuItemActionType>
    ) => {
      state.navBar.menuItem = action.payload.menuItem
      // reset the parentId and childId of sidemenu
      state.sideBar.selectedParentId = ''
    },

    setSideBarSelectedParentId: (
      state: InitialStateType,
      action: PayloadAction<SideBarSelectedParentIdType>
    ) => {
      state.sideBar.selectedParentId = action.payload.id
    },

    setSideBarSelectedChildId: (
      state: InitialStateType,
      action: PayloadAction<SideBarSelectedChildIdType>
    ) => {
      state.sideBar.selectedChildId = action.payload.id
    },

    setSideBarSelectedParentChildIds: (
      state: InitialStateType,
      action: PayloadAction<SideBarSelectedParentChildIdsType>
    ) => {
      state.sideBar.selectedParentId = action.payload.parentId
      state.sideBar.selectedChildId = action.payload.childId
    },
  }
})

export const layoutsReducer = layoutsSlice.reducer
export const {
  setIsSideBarOpen,
  setMenuItem,
  setShowNavBarDropDown,
  setSideBarSelectedChildId,
  setSideBarSelectedParentId,
  setSideBarSelectedParentChildIds,
} = layoutsSlice.actions

type IsSideBarOpenActionType = {
  isSideBarOpen: boolean
}

type ShowNavBarDropDownActionType = {
  toShowNavBarDropDown: boolean
}

type SideBarSelectedParentIdType = {
  id: string
}

type SideBarSelectedChildIdType = {
  id: string
}

type SideBarSelectedParentChildIdsType = {
  parentId: string
  childId: string
}

export type MenuItemType = 'accounts' | 'superAdmin' | 'admin'
type MenuItemActionType = {
  menuItem: MenuItemType
}

type InitialStateType = {
  sideBar: {
    isSideBarOpen: boolean
    selectedChildId: string
    selectedParentId: string
  }
  navBar: {
    menuItem: MenuItemType
    toShowNavBarDropDown: boolean
  }
}

// Selector functions
export const isSideBarOpenSelectorFn = (state: RootStateType) =>
  state.layouts.sideBar.isSideBarOpen

export const menuItemSelectorFn = (state: RootStateType) =>
  state.layouts.navBar.menuItem

export const sideBarSelectedParentIdFn = (state: RootStateType) =>
  state.layouts.sideBar.selectedParentId

export const sideBarSelectedChildIdFn = (state: RootStateType) =>
  state.layouts.sideBar.selectedChildId

export const showNavBarDropDownFn = (state: RootStateType) =>
  state.layouts.navBar.toShowNavBarDropDown
