import { useFormContext, useWatch } from "react-hook-form"
import { useSelector } from 'react-redux'
import { RootStateType } from '../../app/store'
import { VoucherFormDataType } from "../../features/accounts/vouchers/all-vouchers/all-vouchers"

// ============================================================================
// Base Permission Hooks
// ============================================================================

/**
 * Hook to check if user has a single control permission
 *
 * @param controlName - The control name to check (e.g., "purchase.create")
 * @returns boolean - true if user has the permission
 *
 * @example
 * const canCreate = useUserHasControlPermission('purchase.create')
 * if (canCreate) {
 *   // Show create button
 * }
 */
export const useUserHasControlPermission = (controlName: string): boolean => {
  // const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

  // if (userType === 'A' || userType === 'S') return true
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}

/**
 * Non-hook version to check if user has a control permission (use in selectors/functions)
 *
 * @param state - Redux root state
 * @param controlName - The control name to check
 * @returns boolean - true if user has the permission
 */
export const hasControlPermission = (state: RootStateType, controlName: string): boolean => {
  // const userType = state.login.userDetails?.userType
  const userSecuredControls = state.login.userSecuredControls

  // if (userType === 'A' || userType === 'S') return true
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}

/**
 * Hook to check multiple permissions at once
 *
 * @param permissions - Object mapping keys to control names
 * @returns Object with same keys, mapped to boolean permission status
 *
 * @example
 * const perms = useUserHasMultiplePermissions({
 *   canCreate: 'purchase.create',
 *   canEdit: 'purchase.edit'
 * })
 * // Result: { canCreate: true, canEdit: false }
 */
export const useUserHasMultiplePermissions = <T extends Record<string, string>>(
  permissions: T
): Record<keyof T, boolean> => {
  // const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

  // if (userType === 'A' || userType === 'S') {
  //   return Object.keys(permissions).reduce((acc, key) => {
  //     acc[key as keyof T] = true
  //     return acc
  //   }, {} as Record<keyof T, boolean>)
  // }

  return Object.entries(permissions).reduce((acc, [key, controlName]) => {
    acc[key as keyof T] = userSecuredControls?.some(
      control => control.controlName === controlName
    ) ?? false
    return acc
  }, {} as Record<keyof T, boolean>)
}

// ============================================================================
// Module-Specific Permission Hooks
// ============================================================================

/**
 * Hook to check all permissions for Voucher module (dynamic based on voucher type)
 *
 * @param voucherType - Optional voucher type (Payment, Receipt, Contra, Journal)
 *                      If not provided, uses form context value
 * @returns Object with permission flags for all actions
 *
 * @example
 * const { canCreate, canEdit, canDelete } = useVoucherPermissions('Payment')
 *
 * if (canCreate) {
 *   // Show Submit button
 * }
 */
export function useVoucherPermissions(voucherType?: string) {
  const formContext = useFormContext<VoucherFormDataType>()
  const formVoucherType = useWatch({ control: formContext.control, name: "voucherType" })

  const resolvedVoucherType = voucherType || formVoucherType
  const voucherTypeLower = resolvedVoucherType?.toLowerCase() || ""

  // Always call the permissions hook (unconditionally)
  const permissions = useUserHasMultiplePermissions({
    canView: `vouchers.${voucherTypeLower}.view`,
    canSelect: `vouchers.${voucherTypeLower}.select`,
    canCreate: `vouchers.${voucherTypeLower}.create`,
    canEdit: `vouchers.${voucherTypeLower}.edit`,
    canDelete: `vouchers.${voucherTypeLower}.delete`,
    canPreview: `vouchers.${voucherTypeLower}.preview`,
    canExport: `vouchers.${voucherTypeLower}.export`
  })

  // If no voucher type, return all false
  if (!resolvedVoucherType) {
    return {
      canView: false,
      canSelect: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canPreview: false,
      canExport: false
    }
  }
  return permissions
}

/**
 * Hook to check all permissions for Purchase module
 *
 * @returns Object with permission flags for all actions
 *
 * @example
 * const { canCreate, canEdit, canDelete } = usePurchasePermissions()
 *
 * if (canCreate) {
 *   // Show Submit button
 * }
 */
export function usePurchasePermissions() {
  const permissions = useUserHasMultiplePermissions({
    canView: 'purchase.view',
    canCreate: 'purchase.create',
    canEdit: 'purchase.edit',
    canDelete: 'purchase.delete',
    canPreview: 'purchase.preview',
    canExport: 'purchase.export'
  })

  return permissions
}

/**
 * Hook to check all permissions for Purchase Return module
 *
 * @returns Object with permission flags for all actions
 *
 * @example
 * const { canCreate, canEdit, canDelete } = usePurchaseReturnPermissions()
 *
 * if (canCreate) {
 *   // Show Submit button
 * }
 */
export function usePurchaseReturnPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canView: 'purchase-return.view',
    canCreate: 'purchase-return.create',
    canEdit: 'purchase-return.edit',
    canDelete: 'purchase-return.delete',
    canPreview: 'purchase-return.preview',
    canExport: 'purchase-return.export'
  })

  return permissions
}

/**
 * Hook to check all permissions for Sales module
 *
 * @returns Object with permission flags for all actions
 *
 * @example
 * const { canCreate, canEdit, canDelete } = useSalesPermissions()
 *
 * if (canCreate) {
 *   // Show Submit button
 * }
 */
export function useSalesPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canView: 'sales.view',
    canCreate: 'sales.create',
    canEdit: 'sales.edit',
    canDelete: 'sales.delete',
    canPreview: 'sales.preview',
    canExport: 'sales.export'
  })

  return permissions
}

/**
 * Hook to check all permissions for Sales Return module
 *
 * @returns Object with permission flags for all actions
 *
 * @example
 * const { canCreate, canEdit, canDelete } = useSalesReturnPermissions()
 *
 * if (canCreate) {
 *   // Show Submit button
 * }
 */
export function useSalesReturnPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canView: 'sales-return.view',
    canCreate: 'sales-return.create',
    canEdit: 'sales-return.edit',
    canDelete: 'sales-return.delete',
    canPreview: 'sales-return.preview',
    canExport: 'sales-return.export'
  })

  return permissions
}

/**
 * Hook to check all permissions for Debit Notes module
 *
 * @returns Object with permission flags for all actions
 *
 * @example
 * const { canCreate, canEdit, canDelete } = useDebitNotesPermissions()
 *
 * if (canCreate) {
 *   // Show Submit button
 * }
 */
export function useDebitNotesPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canView: 'debit-notes.view',
    canCreate: 'debit-notes.create',
    canEdit: 'debit-notes.edit',
    canDelete: 'debit-notes.delete',
    canPreview: 'debit-notes.preview',
    canExport: 'debit-notes.export'
  })

  return permissions
}

/**
 * Hook to check all permissions for Credit Notes module
 *
 * @returns Object with permission flags for all actions
 *
 * @example
 * const { canCreate, canEdit, canDelete } = useCreditNotesPermissions()
 *
 * if (canCreate) {
 *   // Show Submit button
 * }
 */
export function useCreditNotesPermissions() {
  const permissions = useUserHasMultiplePermissions({
    canView: 'credit-notes.view',
    canCreate: 'credit-notes.create',
    canEdit: 'credit-notes.edit',
    canDelete: 'credit-notes.delete',
    canPreview: 'credit-notes.preview',
    canExport: 'credit-notes.export'
  })

  return permissions
}
