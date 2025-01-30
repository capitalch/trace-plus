import { createContext } from "react"

export const defaultGlobalContext: GlobalContextType = {
  CompSyncFusionGrid: {},
  CompSyncFusionTreeGrid: {}
}

export const GlobalContext = createContext<GlobalContextType>(defaultGlobalContext)

export function resetGlobalContext(globalContext: GlobalContextType) {
  globalContext.CompSyncFusionGrid = {}
  globalContext.CompSyncFusionTreeGrid = {}
}

export type GlobalContextType = {
  CompSyncFusionGrid: {
    [key: string]: {
      gridRef?: any
      loadData?: any
    }
  }
  CompSyncFusionTreeGrid: {
    [key: string]: {
      expandedKeys?: Set<number>
      gridRef?: any
      // isCollapsed?: boolean // For all nodes collapsed
      loadData?: any
      scrollPos?: number
    }
  }
}

