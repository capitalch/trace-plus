import { FC } from 'react'

export const defaultGlobalContext: GlobalContextType = {
  layouts: {
    navBar: {
      modalDialogA: () => <></>,
      modalDialogB: () => <></>,
    }
  }
}

export type GlobalContextType = {
  layouts: {
    navBar: {
      modalDialogA: FC
      modalDialogB: FC
    }
  }
}
