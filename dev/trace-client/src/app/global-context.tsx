// import { FC } from 'react'

import { MapDataInstances } from "./graphql/maps/map-data-instances"

export const defaultGlobalContext: GlobalContextType = {
  app: {
    // name: 'Trace+'
  },
  CompSyncFusionGrid: {
    [MapDataInstances.superAdminClients]: {
      loadData: undefined
    }
  }
}

export type GlobalContextType = {
  app: {
    // name: string
  }
  CompSyncFusionGrid: {
    [key: string]: {
      loadData: any
      gridRef?: any
    }
  }
}
