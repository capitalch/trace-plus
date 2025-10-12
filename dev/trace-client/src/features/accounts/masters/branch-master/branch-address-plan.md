# Branch Address Feature - Implementation Plan

## Overview
Implement branch address functionality by storing address information (address1, address2, pin, phones[], gstin) in the BranchM table's jData JSONB column. The phones field supports multiple mobile and landline numbers. This enhancement will provide complete address management for branches while maintaining compatibility with existing data and following established architectural patterns.

## Database Schema

### Existing BranchM Table Structure
```typescript
BranchM {
  id: number
  branchName: string
  branchCode: string
  remarks: string | null
  jData: Json | null      // ← Store address here
  timestamp: string | null
}
```

### Address Data Structure in jData
```json
{
  "address": {
    "address1": "123 Main Street",
    "address2": "Suite 100",
    "pin": "123456",
    "phones": "9876543210, 9876543211, 022-12345678"
  },
  "gstin": "27AABCU9603R1ZM"
}
```

**jData Structure:**
- **address**: Object containing address-related fields (address1, address2, pin, phones)
- **gstin**: Separate top-level field in jData for tax identification

**Phones Field Format:**
- String containing comma-separated list of phone numbers
- Supports both mobile numbers (10 digits) and landline numbers
- Example: `"9876543210, 9876543211, 022-12345678, 044-28123456"`
- Validated as a comma-separated list using `checkMobileNos` or `checkLandPhones` validators

## Implementation Steps

### 1. Type System Updates
**File:** `src/features/accounts/masters/branch-master/new-edit-branch.tsx:124-129`

**Current Type:**
```typescript
export type NewEditBranchType = {
    id?: number
    branchCode: string
    branchName: string
    remarks?: string
}
```

**Updated Type:**
```typescript
export type NewEditBranchType = {
    id?: number
    branchCode: string
    branchName: string
    remarks?: string
    address1?: string
    address2?: string
    pin?: string
    phones?: string  // Comma-separated phone numbers
    gstin?: string
}
```

**Additional Types for jData:**
```typescript
type BranchAddressType = {
    address1: string
    address2?: string
    pin: string
    phones?: string  // Comma-separated: "9876543210, 022-12345678"
}

type BranchJDataType = {
    address?: BranchAddressType
    gstin?: string  // Separate from address object
}
```

---

### 2. Form UI Enhancement
**File:** `src/features/accounts/masters/branch-master/new-edit-branch.tsx:43-92`

**Location:** Add after the Remarks field (line 78-86), before Submit button

**New Address Section:**
```tsx
{/* Branch Address Section */}
<div className="sm:col-span-2 mt-4 border-t border-primary-200 pt-4">
    <h3 className="font-bold text-primary-800 mb-3">Branch Address</h3>
</div>

{/* Address Line 1 */}
<label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
    <span className="font-bold">Address Line 1 <WidgetAstrix /></span>
    <input
        type="text"
        placeholder="e.g. 123 Main Street"
        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
        {...register('address1', {
            required: Messages.errRequired,
            validate: checkNoSpecialChar
        })}
    />
    {errors.address1 && <WidgetFormErrorMessage errorMessage={errors.address1.message} />}
</label>

{/* Address Line 2 */}
<label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
    <span className="font-bold">Address Line 2</span>
    <input
        type="text"
        placeholder="e.g. Suite 100, Building B"
        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
        {...register('address2')}
    />
</label>

{/* Pin Code */}
<label className="flex flex-col font-medium text-primary-800">
    <span className="font-bold">Pin Code <WidgetAstrix /></span>
    <input
        type="text"
        placeholder="e.g. 123456"
        maxLength={6}
        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
        {...register('pin', {
            required: Messages.errRequired,
            pattern: {
                value: /^\d{6}$/,
                message: 'Pin code must be 6 digits'
            }
        })}
    />
    {errors.pin && <WidgetFormErrorMessage errorMessage={errors.pin.message} />}
</label>

{/* Phones - Multiple mobile and landline numbers */}
<label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
    <span className="font-bold">Phone Numbers</span>
    <input
        type="text"
        placeholder="e.g. 9876543210, 9876543211, 022-12345678"
        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
        {...register('phones', {
            validate: (value) => {
                if (!value) return true; // Optional field
                // Check if it's mobile numbers or landline numbers or mixed
                const mobileError = checkMobileNos(value);
                if (!mobileError) return true;

                const landPhoneError = checkLandPhones(value);
                if (!landPhoneError) return true;

                // If both fail, return a combined error
                return 'Please enter valid mobile numbers (10 digits) or landline numbers, separated by commas';
            }
        })}
    />
    {errors.phones && <WidgetFormErrorMessage errorMessage={errors.phones.message} />}
    <span className="text-xs text-gray-500 mt-1">Separate multiple numbers with commas</span>
</label>

{/* GSTIN */}
<label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
    <span className="font-bold">GSTIN</span>
    <input
        type="text"
        placeholder="e.g. 27AABCU9603R1ZM"
        maxLength={15}
        className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300 uppercase"
        {...register('gstin', {
            validate: checkGstin
        })}
    />
    {errors.gstin && <WidgetFormErrorMessage errorMessage={errors.gstin.message} />}
</label>
```

**Import Addition:**
```typescript
const {
    checkNoSpaceOrSpecialChar,
    checkNoSpecialChar,
    checkMobileNos,   // ← Add this (for multiple mobile numbers)
    checkLandPhones,  // ← Add this (for multiple landline numbers)
    checkGstin        // ← Add this
} = useValidators()
```

---

### 3. Default Values Update
**File:** `src/features/accounts/masters/branch-master/new-edit-branch.tsx:32-41`

**Updated useForm Configuration:**
```typescript
const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
} = useForm<NewEditBranchType>({
    mode: "onTouched",
    criteriaMode: "all",
    defaultValues: {
        id: id,
        branchCode: branchCode,
        branchName: branchName,
        remarks: remarks,
        address1: address1 || '',
        address2: address2 || '',
        pin: pin || '',
        phones: phones || '',  // Comma-separated phone numbers
        gstin: gstin || ''
    },
});
```

---

### 4. Data Serialization Logic
**File:** `src/features/accounts/masters/branch-master/new-edit-branch.tsx:95-121`

**Updated onSubmit Function:**
```typescript
async function onSubmit(data: NewEditBranchType) {
    if (!isDirty) {
        Utils.showAlertMessage('Warning', Messages.messNothingToDo)
        return
    }
    try {
        // Construct jData with address and gstin as separate fields
        const jData: any = {}

        // Add address object if at least address1 and pin are provided
        if (data.address1 && data.pin) {
            jData.address = {
                address1: data.address1,
                address2: data.address2 || null,
                pin: data.pin,
                phones: data.phones || null  // Comma-separated phone numbers
            }
        }

        // Add gstin as separate field in jData (not inside address)
        if (data.gstin) {
            jData.gstin = data.gstin
        }

        await Utils.doGenericUpdate({
            buCode: buCode || '',
            tableName: AllTables.BranchM.name,
            xData: {
                id: data.id,
                branchCode: data.branchCode,
                branchName: data.branchName,
                remarks: data.remarks,
                jData: Object.keys(jData).length > 0 ? jData : null
            }
        })
        Utils.showSaveMessage()
        dispatch(changeAccSettings())
        dispatch(closeSlidingPane())
        const loadData = context.CompSyncFusionGrid[instance].loadData
        if (loadData) {
            await loadData()
        }
    } catch (e: any) {
        console.log(e)
    }
}
```

---

### 5. Grid Display Updates
**File:** `src/features/accounts/masters/branch-master/branch-master.tsx:81-102`

**Add Address Column:**
```typescript
function getColumns(): SyncFusionGridColumnType[] {
    return ([
        {
            field: 'branchName',
            headerText: 'Branch name',
            type: 'string',
            width: 180,
        },
        {
            field: 'branchCode',
            headerText: 'Branch code',
            type: 'string',
            width: 100,
        },
        {
            field: 'address',
            headerText: 'Address',
            type: 'string',
            width: 250,
            template: addressTemplate
        },
        {
            field: 'remarks',
            headerText: 'Remarks',
            type: 'string',
        },
    ])
}

function addressTemplate(props: any) {
    const jData = props.jData
    if (!jData || !jData.address) {
        return <span className="text-xs text-gray-400">No address</span>
    }

    const { address1, pin, phones } = jData.address
    const gstin = jData.gstin  // GSTIN is separate from address object
    const addressText = `${address1 || ''}${pin ? ', PIN: ' + pin : ''}`

    return (
        <div className="text-xs">
            <div className="truncate" title={addressText}>{addressText}</div>
            {phones && <div className="text-gray-500 truncate" title={phones}>Ph: {phones}</div>}
            {gstin && <div className="text-gray-500">GSTIN: {gstin}</div>}
        </div>
    )
}
```

---

### 6. Edit Functionality Enhancement
**File:** `src/features/accounts/masters/branch-master/branch-master.tsx:125-136`

**Updated handleOnEdit Function:**
```typescript
async function handleOnEdit(args: any) {
    const props: NewEditBranchType = SlidingPaneMap[SlidingPaneEnum.branchMaster].props

    // Parse address and gstin from jData (as separate fields)
    let address1 = ''
    let address2 = ''
    let pin = ''
    let phones = ''
    let gstin = ''

    if (args.jData) {
        // Parse address object
        if (args.jData.address) {
            const addr = args.jData.address
            address1 = addr.address1 || ''
            address2 = addr.address2 || ''
            pin = addr.pin || ''
            phones = addr.phones || ''
        }

        // Parse gstin (separate from address)
        gstin = args.jData.gstin || ''
    }

    props.id = args.id
    props.branchCode = args.branchCode
    props.branchName = args.branchName
    props.remarks = args.remarks
    props.address1 = address1
    props.address2 = address2
    props.pin = pin
    props.phones = phones
    props.gstin = gstin

    dispatch(openSlidingPane({
        identifier: SlidingPaneEnum.branchMaster,
        title: 'Edit branch',
        width: '700px'  // Increased width for address fields
    }))
}
```

---

### 7. Component Props Update
**File:** `src/features/accounts/masters/branch-master/new-edit-branch.tsx:17-18`

**Updated Props Destructuring:**
```typescript
export function NewEditBranch({ props }: any) {
    const {
        id,
        branchCode,
        branchName,
        remarks,
        address1,
        address2,
        pin,
        phones,  // Comma-separated phone numbers
        gstin
    } = props
    // ... rest of the component
}
```

---

### 8. SlidingPane Width Adjustment
**File:** `src/features/accounts/masters/branch-master/new-branch-button.tsx`

**Update openSlidingPane Call:**
```typescript
dispatch(openSlidingPane({
    identifier: SlidingPaneEnum.branchMaster,
    title: 'New branch',
    width: '700px'  // Increased from 600px to accommodate address fields
}))
```

---

## Validation Rules Summary

| Field | Required | Validator | Pattern/Rule |
|-------|----------|-----------|--------------|
| address1 | Yes | checkNoSpecialChar | No special characters |
| address2 | No | None | Free text |
| pin | Yes | Custom regex | 6-digit numeric: `/^\d{6}$/` |
| phones | No | checkMobileNos / checkLandPhones | Comma-separated mobile or landline numbers |
| gstin | No | checkGstin | 15-char GSTIN format: `27AABCU9603R1ZM` |

### Phones Field Validation Details:
The phones field accepts comma-separated phone numbers and validates them flexibly:
- **Mobile Numbers**: `checkMobileNos` validates format like `9876543210, 9876543211`
- **Landline Numbers**: `checkLandPhones` validates format like `022-12345678, 044-28123456`
- **Mixed**: Tries both validators; if either passes, validation succeeds
- **Examples**:
  - Valid: `"9876543210"` (single mobile)
  - Valid: `"9876543210, 9876543211"` (multiple mobiles)
  - Valid: `"022-12345678, 044-28123456"` (multiple landlines)
  - Valid: `"02212345678"` (landline without dash)
  - Invalid: `"12345"` (incomplete number)

---

## Responsive Design Specifications

### Grid Layout Classes:
- Container: `grid gap-x-8 gap-y-4 grid-cols-1 sm:grid-cols-2`
- Full width fields (address1, address2, phones, gstin): `sm:col-span-2`
- Half width fields (pin): Default (1 column)
- Section header: `sm:col-span-2`

### Styling Guidelines:
- All Tailwind classes (no inline styles)
- Left-aligned layout
- Consistent spacing: `mt-1`, `gap-x-8`, `gap-y-4`
- Border: `border-[1px] border-primary-200`
- Text colors: `text-primary-800` (labels), `text-gray-300` (placeholders)
- Error text: Red color only for validation errors

---

## Backward Compatibility

### Handling Existing Records:
1. **Records without jData:** Display "No address" in grid
2. **Records with jData but no address:** Display "No address" in grid
3. **Edit existing records:** Populate empty strings for missing address fields
4. **Save without address:** Set jData to null if no address provided

### Safe Parsing Pattern:
```typescript
// Parse address object
const address = args.jData?.address || {}
const address1 = address.address1 || ''
const address2 = address.address2 || ''
const pin = address.pin || ''
const phones = address.phones || ''  // Comma-separated string

// Parse gstin (separate from address object)
const gstin = args.jData?.gstin || ''
```

---

## Testing Checklist

### Functionality Tests:
- [ ] Create new branch with complete address
- [ ] Create new branch without address (optional fields)
- [ ] Edit existing branch (without jData/address)
- [ ] Edit existing branch (with address)
- [ ] Update only address fields
- [ ] Update only non-address fields
- [ ] Save with invalid pin format
- [ ] Save with single mobile number
- [ ] Save with multiple mobile numbers (comma-separated)
- [ ] Save with single landline number
- [ ] Save with multiple landline numbers (comma-separated)
- [ ] Save with invalid phone format
- [ ] Grid displays address correctly
- [ ] Grid displays multiple phone numbers correctly
- [ ] Grid displays "No address" for old records

### UI/UX Tests:
- [ ] Form layout responsive on mobile
- [ ] Form layout responsive on tablet
- [ ] Form layout responsive on desktop
- [ ] SlidingPane width adequate (700px)
- [ ] Address section visually separated
- [ ] Error messages display correctly
- [ ] Validation triggers on blur (onTouched)
- [ ] Submit button disabled with errors
- [ ] Long addresses truncate in grid
- [ ] Tooltip shows full address on hover

### Data Integrity Tests:
- [ ] jData structure matches schema (address and gstin as separate fields)
- [ ] Address object contains only address-related fields
- [ ] GSTIN is stored separately from address object
- [ ] Null values handled correctly
- [ ] Special characters rejected in address1
- [ ] 6-digit pin validation works
- [ ] Single mobile number validation works
- [ ] Multiple mobile numbers validation works
- [ ] Single landline validation works
- [ ] Multiple landlines validation works
- [ ] Invalid phone numbers rejected
- [ ] GSTIN validation works (15-char format)
- [ ] GSTIN field converts to uppercase
- [ ] Phones field stores comma-separated string correctly
- [ ] Can save address without GSTIN
- [ ] Can save GSTIN without address
- [ ] Database saves jData as JSONB
- [ ] Grid refresh after save
- [ ] Redux state updates correctly

### useUtilsInfo Hook Tests:
- [ ] branchAddress available in useUtilsInfo hook
- [ ] branchGstin available in useUtilsInfo hook
- [ ] branchAddress returns undefined when no address in jData
- [ ] branchGstin returns undefined when no GSTIN in jData
- [ ] Can access address1, address2, pin, phones from branchAddress
- [ ] Type safety works with BranchAddressType
- [ ] Hook updates when branch changes
- [ ] Components can use branchAddress without additional queries

---

## File Modifications Summary

### Files to Modify:
1. **new-edit-branch.tsx** (Primary changes)
   - Update NewEditBranchType interface
   - Add address form fields UI
   - Update default values
   - Implement jData serialization
   - Update props destructuring

2. **branch-master.tsx**
   - Add address column to grid
   - Create address template function
   - Update handleOnEdit with jData parsing
   - Adjust SlidingPane width in edit handler

3. **new-branch-button.tsx**
   - Adjust SlidingPane width for new branch

4. **login-slice.ts** (Type definitions)
   - Update BranchType to include jData field
   - Add BranchAddressType and BranchJDataType interfaces

5. **utils-info-hook.tsx** (Hook enhancement)
   - Parse branch address from currentBranch.jData
   - Parse branch GSTIN from currentBranch.jData
   - Expose branchAddress and branchGstin in return object

### No New Files Required
All functionality implemented within existing component structure.

---

## Integration with useUtilsInfo Hook

### Overview
Make branch address and GSTIN available globally through the `useUtilsInfo` hook, allowing any component to access the current branch's address information without additional database queries.

### 9. Update BranchType in login-slice.ts
**File:** `src/features/login/login-slice.ts`

**Current BranchType:**
```typescript
export type BranchType = {
  branchId: number
  branchName: string
  branchCode: string
}
```

**Updated BranchType:**
```typescript
export type BranchType = {
  branchId: number
  branchName: string
  branchCode: string
  jData?: BranchJDataType | null
}

export type BranchAddressType = {
  address1: string
  address2?: string
  pin: string
  phones?: string
}

export type BranchJDataType = {
  address?: BranchAddressType
  gstin?: string
}
```

**Why this change?**
- BranchType needs to include jData field to carry address and GSTIN information
- These types will be shared across the application
- Ensures type safety when accessing branch address data

---

### 10. Enhance useUtilsInfo Hook
**File:** `src/utils/utils-info-hook.tsx`

**Current Implementation:**
```typescript
export function useUtilsInfo() {
    // ... existing code ...
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn)
    const branchId: number | undefined = currentBranch?.branchId
    const branchCode: string | undefined = currentBranch?.branchCode
    const branchName = currentBranch?.branchName

    return ({
        branchId,
        branchCode,
        branchName,
        // ... other fields
    })
}
```

**Updated Implementation:**
```typescript
import { BranchType, BranchAddressType, BranchJDataType } from "../features/login/login-slice"

export function useUtilsInfo() {
    // ... existing code ...
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn)
    const branchId: number | undefined = currentBranch?.branchId
    const branchCode: string | undefined = currentBranch?.branchCode
    const branchName = currentBranch?.branchName

    // Parse branch address from jData
    const branchAddress: BranchAddressType | undefined = currentBranch?.jData?.address
    const branchGstin: string | undefined = currentBranch?.jData?.gstin

    return ({
        branchId,
        branchCode,
        branchName,
        branchAddress,    // New: Full address object
        branchGstin,      // New: Branch GSTIN
        // ... other fields
    })
}
```

**Usage Example in Components:**
```typescript
import { useUtilsInfo } from "../../../../utils/utils-info-hook"

function MyComponent() {
    const {
        branchId,
        branchName,
        branchAddress,
        branchGstin
    } = useUtilsInfo()

    // Access address fields
    const address1 = branchAddress?.address1 || ''
    const pin = branchAddress?.pin || ''
    const phones = branchAddress?.phones || ''

    // Access GSTIN
    const gstin = branchGstin || ''

    return (
        <div>
            <h3>{branchName}</h3>
            {branchAddress && (
                <div>
                    <p>{branchAddress.address1}</p>
                    {branchAddress.address2 && <p>{branchAddress.address2}</p>}
                    <p>PIN: {branchAddress.pin}</p>
                    {branchAddress.phones && <p>Phone: {branchAddress.phones}</p>}
                </div>
            )}
            {branchGstin && <p>GSTIN: {branchGstin}</p>}
        </div>
    )
}
```

**Benefits:**
- **Global Access**: Any component can access branch address without prop drilling
- **Type Safety**: Full TypeScript support with BranchAddressType
- **Performance**: No additional database queries needed
- **Consistency**: Single source of truth for branch data
- **Convenience**: Simple hook call provides all branch information

---

### 11. Update Branch Data Loading
**File:** Location where branches are loaded (likely in login flow or app initialization)

**Ensure jData is Fetched:**
When loading branch data from the database, ensure the SQL query or GraphQL query includes the `jData` field:

```sql
SELECT id, "branchCode", "branchName", "jData"
FROM "BranchM"
WHERE id = $1
```

**Update Redux State:**
When setting the current branch in Redux, ensure jData is included:
```typescript
dispatch(setCurrentBranch({
    branchId: branch.id,
    branchCode: branch.branchCode,
    branchName: branch.branchName,
    jData: branch.jData  // Include jData
}))
```

---

## Dependencies & Imports

### Required Validators:
```typescript
import { useValidators } from "../../../../utils/validators-hook"

const {
    checkNoSpaceOrSpecialChar,
    checkNoSpecialChar,
    checkMobileNos,   // New - validates comma-separated mobile numbers
    checkLandPhones,  // New - validates comma-separated landline numbers
    checkGstin        // New - validates GSTIN format
} = useValidators()
```

**Phone Validators Details:**

1. **checkMobileNos** - Validates comma-separated mobile numbers
   - Pattern: `/^(?:\+91|91)?\s?\d{10}(?:[\s,](?:\+91|91)?\s?\d{10})*$/`
   - Examples:
     - Valid: `"9876543210"`
     - Valid: `"9876543210, 9876543211"`
     - Valid: `"9876543210,9876543211,9876543212"`
     - Valid: `"+919876543210, 919876543211"`

2. **checkLandPhones** - Validates comma-separated landline numbers
   - Pattern: `/^(?:\+91\s?|91\s?)?(?:\d{3,5}\s?\d{6,10}|\d{8,10})(?:[,\s]+(?:\+91\s?|91\s?)?(?:\d{3,5}\s?\d{6,10}|\d{8,10}))*$/`
   - Examples:
     - Valid: `"022-12345678"`
     - Valid: `"02212345678"`
     - Valid: `"022-12345678, 044-28123456"`
     - Valid: `"02212345678,04428123456"`

**GSTIN Validator Details:**
- Format: 15 characters alphanumeric
- Pattern: `^([0][1-9]|[1-2][0-9]|[3][0-7])([A-Z]{5})([0-9]{4})([A-Z]{1}[1-9A-Z]{1})([Z]{1})([0-9A-Z]{1})+$`
- Example: `27AABCU9603R1ZM`
- First 2 digits: State code (01-37)
- Next 10 chars: PAN of business
- 13th char: Entity type
- 14th char: Z (default)
- 15th char: Check digit

### Required Widgets:
```typescript
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix"
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message"
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width"
```

---

## Technical Notes

### GraphQL Mutation:
- `Utils.doGenericUpdate()` handles JSONB automatically
- No schema changes required
- PostgreSQL JSONB field already exists in BranchM

### Redux Integration:
- `changeAccSettings()` triggers global refresh
- `closeSlidingPane()` closes form modal
- Grid refresh via `context.CompSyncFusionGrid[instance].loadData`

### Form State Management:
- React Hook Form handles all form state
- `isDirty` check prevents unnecessary saves
- Error state disables submit button
- Validation runs on "onTouched" mode

---

## Future Enhancements (Not in Scope)

- Auto-complete for addresses
- Google Maps integration
- State/City dropdowns
- Address validation API
- Multiple addresses per branch
- Billing vs. Shipping address differentiation

---

## Implementation Order

### Phase 1: Core Branch Address Feature
1. Update TypeScript types (NewEditBranchType, BranchAddressType, BranchJDataType)
2. Add address form fields UI
3. Implement validation rules
4. Update form submission logic (jData serialization)
5. Update edit handler (jData parsing)
6. Add grid column with template
7. Adjust SlidingPane width

### Phase 2: Global Hook Integration
8. Update BranchType in login-slice.ts to include jData field
9. Export BranchAddressType and BranchJDataType from login-slice.ts
10. Enhance useUtilsInfo hook to parse and expose branchAddress and branchGstin
11. Ensure branch loading queries include jData field
12. Update Redux state to include jData when setting current branch

### Phase 3: Testing & Validation
13. Test with new branch records (complete address)
14. Test with new branch records (partial/no address)
15. Test with existing branch records (without jData)
16. Test grid display and address template
17. Test useUtilsInfo hook in sample component
18. Verify type safety and TypeScript compilation
19. Test branch switching and hook updates
20. Final UI/UX polish and edge case handling

---

## Success Criteria

### Core Feature Success Criteria:
- ✅ Address fields appear in new/edit branch form
- ✅ Validation works correctly for all fields
- ✅ Address data saves to jData column with proper structure
- ✅ GSTIN saved separately from address in jData
- ✅ Address displays in grid correctly
- ✅ Existing records without address still work
- ✅ Form is responsive across devices
- ✅ No breaking changes to existing functionality
- ✅ Follows established coding patterns
- ✅ Type-safe TypeScript implementation
- ✅ Good UI/UX with proper spacing and styling

### Global Hook Integration Success Criteria:
- ✅ BranchType updated to include jData field
- ✅ BranchAddressType and BranchJDataType exported from login-slice
- ✅ useUtilsInfo hook exposes branchAddress and branchGstin
- ✅ Any component can access branch address via useUtilsInfo
- ✅ No additional database queries needed to get branch address
- ✅ Type safety maintained throughout the chain
- ✅ Hook updates correctly when branch changes
- ✅ Backward compatible with existing code
