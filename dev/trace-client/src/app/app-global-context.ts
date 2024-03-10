import { FC } from 'react'

export const appContext: AppGlobalContextType = {
  accessToken: undefined
}

export type AppGlobalContextType = {
  settings?: SettingsType
  accessToken: string | undefined
}

export type SettingsType = {
  name?: string
  component?: FC
  myFunc?: () => void
}
