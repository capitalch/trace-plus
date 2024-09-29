import { DataInstancesMap } from "./graphql/maps/data-instances-map"

export const defaultGlobalContext: GlobalContextType = {
  // app: {
  //   // name: 'Trace+'
  // },
  CompSyncFusionGrid: {
    [DataInstancesMap.superAdminClients]: {
      loadData: undefined
    }
  }
}

export type GlobalContextType = {
  // app: 
  CompSyncFusionGrid: {
    [key: string]: {
      loadData: any
      gridRef?: any
    }
  }
}
