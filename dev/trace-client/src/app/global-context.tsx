export const defaultGlobalContext: GlobalContextType = {
  CompSyncFusionGrid: {},
  CompSyncFusionTreeGrid: {}
}

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
      isCollapsed?: boolean
    }
  }
}

