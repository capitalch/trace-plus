// import { FC } from 'react'

export const defaultGlobalContext: GlobalContextType = {
  app: {
    name: 'Trace+'
    , version: '0.1.0'
  }
}

export type GlobalContextType = {
  app: {
    name: string
    version: string
  }
  // layouts: {
  //   navBar: {

  //   }
  // }
}
