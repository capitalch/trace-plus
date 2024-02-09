import { FC } from 'react'

export const appContext:AppGlobalContextType = {

}

export type AppGlobalContextType = {
  settings?: SettingsType
}

export type SettingsType = {
  name?: string
  component?: FC
  myFunc?: () => void
}
