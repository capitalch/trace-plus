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
    isOpenModalDialogA: false,
    isOpenModalDialogB: false
  }
}

export const layoutsSlice = createSlice({
  name: 'layouts',
  initialState: initialState,
  reducers: {
    // navbar
    setShowNavBarDropDownR: (
      state: InitialStateType,
      action: PayloadAction<ShowNavBarDropDownActionType>
    ) => {
      state.navBar.toShowNavBarDropDown = action.payload.toShowNavBarDropDown
    },

    // sidebar
    setIsSideBarOpenR: (
      state: InitialStateType,
      action: PayloadAction<IsSideBarOpenActionType>
    ) => {
      state.sideBar.isSideBarOpen = action.payload.isSideBarOpen
    },

    setMenuItemR: (
      state: InitialStateType,
      action: PayloadAction<MenuItemActionType>
    ) => {
      state.navBar.menuItem = action.payload.menuItem
      // reset the parentId and childId of sidemenu
      state.sideBar.selectedParentId = ''
      state.sideBar.selectedParentId = ''
    },

    setSideBarSelectedParentIdR: (
      state: InitialStateType,
      action: PayloadAction<SideBarSelectedParentIdType>
    ) => {
      state.sideBar.selectedParentId = action.payload.id
    },

    setSideBarSelectedChildIdR: (
      state: InitialStateType,
      action: PayloadAction<SideBarSelectedChildIdType>
    ) => {
      state.sideBar.selectedChildId = action.payload.id
    },

    setSideBarSelectedParentChildIdsR: (
      state: InitialStateType,
      action: PayloadAction<SideBarSelectedParentChildIdsType>
    ) => {
      state.sideBar.selectedParentId = action.payload.parentId
      state.sideBar.selectedChildId = action.payload.childId
    },

    // ModalDialogA
    showModalDialogAR: (
      state: InitialStateType,
      action: PayloadAction<NavBarIsOpenModalDialogType>
    ) => {
      state.navBar.isOpenModalDialogA = action.payload.isOpen
    },

    // ModalDialogB
    showModalDialogBR: (
      state: InitialStateType,
      action: PayloadAction<NavBarIsOpenModalDialogType>
    ) => {
      state.navBar.isOpenModalDialogB = action.payload.isOpen
    }
  }
})

export const layoutsReducer = layoutsSlice.reducer
export const {
  setIsSideBarOpenR,
  setMenuItemR,
  setShowNavBarDropDownR,
  setSideBarSelectedChildIdR,
  setSideBarSelectedParentIdR,
  setSideBarSelectedParentChildIdsR,
  showModalDialogAR,
  showModalDialogBR
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

type NavBarIsOpenModalDialogType = {
  isOpen: boolean
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
    isOpenModalDialogA: boolean
    isOpenModalDialogB: boolean
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
