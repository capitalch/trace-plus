// import { DataInstancesMap } from "./graphql/maps/data-instances-map"

export const defaultGlobalContext: GlobalContextType = {
  CompSyncFusionGrid: {},
  CompSyncFusionTreeGrid: {}
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
    }
  }
}
