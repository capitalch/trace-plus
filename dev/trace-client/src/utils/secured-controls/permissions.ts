import { useSelector } from 'react-redux'
import { RootStateType } from '../../app/store'
// import { RootStateType } from '../app/store'

/**
 * Custom React hook to check if user has permission for a control
 *
 * @param controlName - The secured control name (e.g., 'vouchers.create')
 * @returns true if user has permission, false otherwise
 *
 * @example
 * const canCreate = useUserHasControlPermission('vouchers.create')
 * if (canCreate) {
 *   // Show submit button
 * }
 */

export const useUserHasControlPermission = (controlName: string): boolean => {
    const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
    const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

    // Admin users (userType = 'A') have all permissions
    if (userType === 'A') {
        return true
    }

    // Super Admin users (userType = 'S') have all permissions
    if (userType === 'S') {
        return true
    }

    // Check if control exists in user's secured controls
    return userSecuredControls?.some(control => control.controlName === controlName) ?? false
    // const userHasControlPermission = (control) => userSecuredControls?.some(control => control.controlName === controlName) ?? false
    // return { userHasControlPermission }
}

/**
 * Pure function to check permission (for use outside components)
 *
 * @param state - Redux root state
 * @param controlName - The secured control name
 * @returns true if user has permission, false otherwise
 */
export const hasControlPermission = (state: RootStateType, controlName: string): boolean => {
  const userType = state.login.userDetails?.userType
  const userSecuredControls = state.login.userSecuredControls

  // Admin and Super Admin users have all permissions
  if (userType === 'A' || userType === 'S') {
    return true
  }

  // Check if control exists in user's secured controls
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}

/**
 * Hook to check multiple permissions at once
 *
 * @param controlNames - Array of control names to check
 * @returns Object with permission results
 *
 * @example
 * const { canCreate, canEdit, canDelete } = useUserHasMultiplePermissions({
 *   canCreate: 'vouchers.create',
 *   canEdit: 'vouchers.edit',
 *   canDelete: 'vouchers.delete'
 * })
 */
export const useUserHasMultiplePermissions = <T extends Record<string, string>>(
  permissions: T
): Record<keyof T, boolean> => {
  const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

  // Admin and Super Admin users have all permissions
  if (userType === 'A' || userType === 'S') {
    return Object.keys(permissions).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Record<keyof T, boolean>)
  }

  // Check each permission
  return Object.entries(permissions).reduce((acc, [key, controlName]) => {
    acc[key as keyof T] = userSecuredControls?.some(
      control => control.controlName === controlName
    ) ?? false
    return acc
  }, {} as Record<keyof T, boolean>)
}