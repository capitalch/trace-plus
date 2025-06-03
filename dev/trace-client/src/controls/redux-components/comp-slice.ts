import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateType } from "../../app/store/store";

const initialState: ReduxCompStateType = {
  compAppLoader: {},
  compCheckBox: {},
  compSwitch: {},
  compTabs: {},
  compDateRange: {},
  ledgerSubledger: {},
  slidingPane: {
    identifier: "",
    isOpen: false,
    title: "",
    width: "90%",
  },
};

const initializeNestedState = <T>(
  state: Record<string, T>,
  key: string,
  defaultValue: T
): void => {
  if (!state[key]) {
    state[key] = defaultValue;
  }
};

const compSlice = createSlice({
  name: "reduxComp",
  initialState: initialState,
  reducers: {
    // CompAppLoader
    showCompAppLoader: (
      state: ReduxCompStateType,
      action: PayloadAction<{ instance: string; isVisible: boolean }>
    ) => {
      const instance: string = action.payload.instance;
      state.compAppLoader[instance] = action.payload.isVisible;
    },

    // LedgerSubledger
    updateLedgerSubledger: (
      state: ReduxCompStateType,
      action: PayloadAction<{
        instance: string;
        updates: Partial<LedgerSubledgerInstanceType>;
      }>
    ) => {
      const { instance, updates } = action.payload;
      initializeNestedState(state.ledgerSubledger, instance, {
        accountBalance: 0,
        hasError: true,
      });
      Object.entries(updates).forEach(([key, value]) => {
        const li: any = state.ledgerSubledger[instance];
        li[key] = value;
      });
    },

    // CompCheckBox
    setCompCheckBoxState: (
      state: ReduxCompStateType,
      action: PayloadAction<{
        instance: string | string[];
        checkBoxState: boolean;
      }>
    ) => {
      let instance: string | string[] = action.payload.instance;
      if (!Array.isArray(instance)) {
        instance = [instance];
      }
      for (const ins of instance) {
        state.compCheckBox[ins] = action.payload.checkBoxState;
      }
    },

    // CompSwitch
    setCompSwitchState: (
      state: ReduxCompStateType,
      action: PayloadAction<{ instance: string; switchState: boolean }>
    ) => {
      const instance: string = action.payload.instance;
      state.compSwitch[instance] = action.payload.switchState;
    },

    // CompDateRange
    setCompDateRangeStartDate: (
      state: ReduxCompStateType,
      action: PayloadAction<{ instance: string; startDate: string }>
    ) => {
      const instance: string = action.payload.instance;
      state.compDateRange[instance] = {
        startDate: "",
        endDate: "",
      };
      state.compDateRange[instance].startDate = action.payload.startDate;
    },

    setCompDateRangeEndDate: (
      state: ReduxCompStateType,
      action: PayloadAction<{ instance: string; endDate: string }>
    ) => {
      const instance: string = action.payload.instance;
      state.compDateRange[instance] = {
        startDate: "",
        endDate: "",
      };
      state.compDateRange[instance].endDate = action.payload.endDate;
    },

    setCompDateRangeStartDateEndDate: (
      state: ReduxCompStateType,
      action: PayloadAction<{
        instance: string;
        endDate: string;
        startDate: string;
      }>
    ) => {
      const instance: string = action.payload.instance;
      state.compDateRange[instance] = {
        startDate: "",
        endDate: "",
      };
      state.compDateRange[instance].endDate = action.payload.endDate;
      state.compDateRange[instance].startDate = action.payload.startDate;
    },

    // sliding pane
    openSlidingPane: (
      state: ReduxCompStateType,
      action: PayloadAction<SlidingPanePayloadActionType>
    ) => {
      state.slidingPane.isOpen = true;
      state.slidingPane.identifier = action.payload.identifier;
      state.slidingPane.title = action.payload.title;
      state.slidingPane.width = action.payload?.width || "90%";
    },
    closeSlidingPane: (state: ReduxCompStateType) => {
      state.slidingPane.isOpen = false;
    },

    //CompTabs
    setActiveTabIndex: (
      state: ReduxCompStateType,
      action: PayloadAction<CompTabPayloadActionType>
    ) => {
      const instance = action.payload.instance;
      if (!state.compTabs[instance]) {
        state.compTabs[instance] = { activeTabIndex: 0 };
      }
      state.compTabs[instance].activeTabIndex = action.payload.activeTabIndex;
      state.compTabs[instance].id = action.payload.id || undefined;
    },
  },
});

export const reduxCompReducer = compSlice.reducer;
export const {
  closeSlidingPane,
  openSlidingPane,
  setActiveTabIndex,
  setCompCheckBoxState,
  setCompDateRangeStartDate,
  setCompDateRangeEndDate,
  setCompDateRangeStartDateEndDate,
  setCompSwitchState,
  showCompAppLoader,
  updateLedgerSubledger,
} = compSlice.actions;

//Types
type ReduxCompStateType = {
  compAppLoader: Record<string, boolean>;
  compCheckBox: Record<string, boolean>;
  compSwitch: Record<string, boolean>;
  compTabs: Record<string, CompTabsType>;
  compDateRange: Record<string, StartDateEndDateType>;
  ledgerSubledger: Record<string, LedgerSubledgerInstanceType>;
  slidingPane: {
    identifier: string;
    isOpen: boolean;
    title: string;
    width: string;
  };
};

type StartDateEndDateType = {
  startDate: string;
  endDate: string;
};

type LedgerSubledgerInstanceType = {
  accountBalance: number;
  finalAccId?: number;
  hasError: boolean;
  ledgerAccId?: number;
  ledgerandLeafData?: AccountType[];
  subLedgerData?: AccountType[];
};

type AccountType = {
  accLeaf: "S" | "L" | "Y";
  accName: string;
  id: number;
};

type CompTabPayloadActionType = {
  activeTabIndex: number;
  id?: number | string;
  instance: string;
};

type CompTabsType = {
  activeTabIndex: number;
  id?: number | string;
};

type SlidingPanePayloadActionType = {
  identifier: string;
  title: string;
  width?: string;
};

// selectors
export const selectCompCheckBoxStateFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.compCheckBox[instance];

// compSwitch: Retrieves the switch state of the component
export const selectCompSwitchStateFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.compSwitch[instance];

// CompAppLoader: Retrieves the visibility state of a specific app loader
export const compAppLoaderVisibilityFn = (
  state: RootStateType,
  instance: string
) => state.reduxComp.compAppLoader[instance] || false;

// ledgerSubledger
export const selectLedgerSubledgerFieldFn = (
  state: RootStateType,
  instance: string,
  key: keyof LedgerSubledgerInstanceType
) => state.reduxComp.ledgerSubledger[instance]?.[key];

// sliding pane
export const selectSlidingPaneStateFn = (state: RootStateType) =>
  state.reduxComp.slidingPane;
