import { createContext } from "react";

export const defaultGlobalContext: GlobalContextType = {
  CompSyncFusionGrid: {},
  CompSyncFusionTreeGrid: {},
  DataInstances: {}
};

export const GlobalContext =
  createContext<GlobalContextType>(defaultGlobalContext);

export function resetGlobalContext(globalContext: GlobalContextType) {
  globalContext.CompSyncFusionGrid = {};
  globalContext.CompSyncFusionTreeGrid = {};
  // globalContext.DataInstances = {};
}

export type GlobalContextType = {
  CompSyncFusionGrid: {
    [key: string]: {
      gridRef?: any;
      loadData?: any;
      scrollPos?: number;
    };
  };
  CompSyncFusionTreeGrid: {
    [key: string]: {
      expandedKeys?: Set<number>;
      gridRef?: any;
      loadData?: any;
      scrollPos?: number;
    };
  };
  DataInstances: {
    [key: string]: {
      deletedIds: (number | string)[];
      // deletedIds: number[] | string[];
    };
  };
};
