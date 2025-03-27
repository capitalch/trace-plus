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
      scrollPos?: number
    }
  }
  CompSyncFusionTreeGrid: {
    [key: string]: {
      expandedKeys?: Set<number>
      gridRef?: any
      loadData?: any
      scrollPos?: number
    }
  }
}

