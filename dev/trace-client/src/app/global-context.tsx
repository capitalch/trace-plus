// import { DataInstancesMap } from "./graphql/maps/data-instances-map"

export const defaultGlobalContext: GlobalContextType = {
  CompSyncFusionGrid: {}
}

export type GlobalContextType = {
  // app: 
  CompSyncFusionGrid: {
    [key: string]: {
      loadData?: any
      gridRef?: any
    }
  }
}
