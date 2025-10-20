import { useSelector } from 'react-redux'
import { RootStateType } from '../../app/store'
export const useUserHasControlPermission = (controlName: string): boolean => {
  const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

//   if (userType === 'A' || userType === 'S') return true
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}

export const hasControlPermission = (state: RootStateType, controlName: string): boolean => {
  const userType = state.login.userDetails?.userType
  const userSecuredControls = state.login.userSecuredControls

//   if (userType === 'A' || userType === 'S') return true
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}

export const useUserHasMultiplePermissions = <T extends Record<string, string>>(
  permissions: T
): Record<keyof T, boolean> => {
  const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

//   if (userType === 'A' || userType === 'S') {
//     return Object.keys(permissions).reduce((acc, key) => {
//       acc[key as keyof T] = true
//       return acc
//     }, {} as Record<keyof T, boolean>)
//   }

  return Object.entries(permissions).reduce((acc, [key, controlName]) => {
    acc[key as keyof T] = userSecuredControls?.some(
      control => control.controlName === controlName
    ) ?? false
    return acc
  }, {} as Record<keyof T, boolean>)
}