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

// CompSyncFusionGrid: {
//   [DataInstancesMap.superAdminClients]: {
//     loadData: undefined
//   },
//   [DataInstancesMap.superAdminRoles]: {
//     loadData: undefined
//   },
//   [DataInstancesMap.superAdminSecuredControls]: {
//     loadData: undefined
//   },
//   [DataInstancesMap.superAdminAdminUsers]:{
//     loadData: undefined
//   }
// }
