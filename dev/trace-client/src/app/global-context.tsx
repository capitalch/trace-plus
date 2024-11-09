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
  // app: 
  CompSyncFusionGrid: {
    [key: string]: {
      loadData?: any
      gridRef?: any
    }
  }
  CompSyncFusionTreeGrid: {
    [key: string]: {
      loadData?: any
      gridRef?: any
      isCollapsed?: boolean // For all nodes collapsed
      expandedKeys?:string[] 
    }
  }
}

