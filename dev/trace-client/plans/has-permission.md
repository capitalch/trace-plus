# Plan: Create Centralized hasControlPermission Method

## Overview
Create a centralized utility function `hasControlPermission(controlName)` that checks if a user has permission to access a specific secured control based on the secured controls implementation documented in `secured-controls.md`.

## Requirements Analysis

Based on the `secured-controls.md` documentation:
- **userSecuredControls**: Array stored in Redux login state (`state.login.userSecuredControls`)
- **userType**: Stored in Redux login state (`state.login.userDetails.userType`)
- **User Types**: 'S' (Super Admin), 'A' (Admin), 'B' (Business User)
- **Admin users (userType = 'A')** should always have full access to all controls
- **Other users** should have access only if the control exists in their `userSecuredControls` array

## Implementation Plan

### 1. Create Utility File
**Location**: `src/utils/permissions.ts` or `src/utils/has-control-permission.ts`

**Rationale**:
- Centralized location for permission-related utilities
- Easy to import across the application
- Maintainable and testable

### 2. Implement hasControlPermission Function

**Function Signature**:
```typescript
hasControlPermission(controlName: string): boolean
```

**Logic**:
1. Access Redux store to get:
   - `userType` from `state.login.userDetails.userType`
   - `userSecuredControls` from `state.login.userSecuredControls`

2. Check if `userType === 'A'`:
   - If yes, return `true` immediately (Admins have all permissions)

3. For other user types:
   - Check if `controlName` exists in `userSecuredControls` array
   - Return `true` if found, `false` otherwise

**Implementation Options**:

**Option A**: Hook-based approach (Recommended)
- Create a custom React hook `useHasControlPermission()`
- Uses `useSelector` to access Redux state
- Can be used directly in components

**Option B**: Utility function with store parameter
- Function accepts Redux store state as parameter
- More flexible for non-component usage
- Requires passing state explicitly

**Recommendation**: Implement both:
- A hook for component usage: `userHasControlPermission(controlName: string): boolean`
- A pure function for non-component usage: `hasControlPermission(state: RootStateType, controlName: string): boolean`

### 3. Function Implementation Details

#### Custom Hook Implementation
```typescript
import { useSelector } from 'react-redux'
import { RootStateType } from '../app/store'

export const userHasControlPermission = (controlName: string): boolean => {
  const userType = useSelector((state: RootStateType) => state.login.userDetails?.userType)
  const userSecuredControls = useSelector((state: RootStateType) => state.login.userSecuredControls)

  // Admin users have all permissions
  if (userType === 'A') {
    return true
  }

  // Check if control exists in user's secured controls
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}
```

#### Pure Function Implementation
```typescript
export const hasControlPermission = (state: RootStateType, controlName: string): boolean => {
  const userType = state.login.userDetails?.userType
  const userSecuredControls = state.login.userSecuredControls

  // Admin users have all permissions
  if (userType === 'A') {
    return true
  }

  // Check if control exists in user's secured controls
  return userSecuredControls?.some(control => control.controlName === controlName) ?? false
}
```

### 4. Edge Cases to Handle

1. **User not logged in**:
   - `userType` is undefined
   - `userSecuredControls` is undefined
   - Should return `false`

2. **Empty userSecuredControls array**:
   - User has no permissions assigned
   - Should return `false` (except for Admin)

3. **Invalid controlName**:
   - Empty string or null/undefined
   - Should return `false`

4. **Super Admin (userType = 'S')**:
   - Based on documentation, Super Admins manage the system
   - Decision needed: Should they also have all permissions like Admins?
   - Current plan: Only 'A' returns true automatically (as per requirement)

### 5. Testing Considerations

Create test cases for:
1. Admin user (userType = 'A') → always returns true
2. Business user with matching control → returns true
3. Business user without matching control → returns false
4. Super Admin with/without control → returns based on userSecuredControls (not auto-true)
5. Undefined/null userType → returns false
6. Undefined/null userSecuredControls → returns false
7. Empty controlName → returns false

### 6. Usage Examples

#### In Components
```typescript
import { userHasControlPermission } from '@/utils/permissions'

const VoucherForm = () => {
  const canSave = userHasControlPermission('voucher.save')
  const canDelete = userHasControlPermission('voucher.delete')

  return (
    <div>
      {canSave && <button>Save</button>}
      {canDelete && <button>Delete</button>}
    </div>
  )
}
```

#### In Selectors or Utilities
```typescript
import { hasControlPermission } from '@/utils/permissions'

const selectCanAccessFeature = (state: RootStateType) => {
  return hasControlPermission(state, 'feature.access')
}
```

### 7. Integration Points

Files that may need to use this function:
- `src/features/accounts/vouchers/voucher-controls/form-action-buttons.tsx` (currently open in IDE)
- Any component that conditionally renders based on permissions
- Menu rendering logic (`src/features/layouts/nav-bar/nav-bar-hook.tsx`)
- Route guards and protected routes

### 8. Documentation

Add JSDoc comments to the function:
```typescript
/**
 * Checks if the current user has permission to access a specific secured control.
 *
 * Admin users (userType = 'A') always have full permissions.
 * Other users have access only if the control exists in their userSecuredControls array.
 *
 * @param controlName - The name of the secured control to check (e.g., 'voucher.save')
 * @returns true if user has permission, false otherwise
 *
 * @example
 * const canSave = userHasControlPermission('voucher.save')
 * if (canSave) {
 *   // Show save button
 * }
 */
```

## File Structure

```
src/
  utils/
    permissions.ts  (NEW FILE)
      ├── userHasControlPermission (React hook)
      └── hasControlPermission (Pure function)
```

## Implementation Steps

1. ✓ Analyze secured-controls.md and login state structure
2. Create `src/utils/permissions.ts` file
3. Implement `userHasControlPermission` hook
4. Implement `hasControlPermission` pure function
5. Add TypeScript types and interfaces
6. Add JSDoc documentation
7. Export functions from the file
8. Test the functions manually with different user types
9. Update existing code to use the new function (if needed)

## Notes

- The requirement specifies `userType = 'A'` should always return true
- Super Admins ('S') and Business Users ('B') will follow standard permission checking
- The function name `hasControlPermission` follows JavaScript naming conventions (camelCase)
- Implementation focuses on reusability and type safety
