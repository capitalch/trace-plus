# Plan: Refactor Sales Type Change Handler

## Current Situation
The code in `payment-details.tsx` (lines 249-256) contains repetitive logic for handling sales type changes. The same code pattern appears three times for 'retail', 'bill', and 'institution' radio button onChange handlers.

## Selected Code Pattern (Currently Duplicated)
```tsx
setValue('salesType', e.target.value as SalesType)
// setValue(`debitAccounts.${0}.accId`, null, { shouldValidate: true })
// clearFirstRowId()
setValue(`debitAccounts.${0}.isParentAutoSubledger`, null)
setValue(`debitAccounts.${0}.accClass`, '')
setValue(`debitAccounts.${0}.accName`, '')
setValue(`debitAccounts.${0}.accId`, null)
trigger(`debitAccounts.${0}.accId`)
```

## Locations to Refactor
- **Retail radio button**: Lines 228-237
- **Bill radio button**: Lines 249-258
- **Institution radio button**: Lines 270-279

## Proposed Solution

### Step 1: Create a Reusable Handler Function
Create a single `handleSalesTypeChange` function that:
- Accepts the new sales type as a parameter
- Contains the shared logic from the selected code
- Keeps the commented lines as requested
- Can be called by all three radio button onChange handlers

### Step 2: Extract Common Logic
The handler function will:
```tsx
const handleSalesTypeChange = (newSalesType: SalesType) => {
    setValue('salesType', newSalesType)
    // setValue(`debitAccounts.${0}.accId`, null, { shouldValidate: true })
    // clearFirstRowId()
    setValue(`debitAccounts.${0}.isParentAutoSubledger`, null)
    setValue(`debitAccounts.${0}.accClass`, '')
    setValue(`debitAccounts.${0}.accName`, '')
    setValue(`debitAccounts.${0}.accId`, null)
    trigger(`debitAccounts.${0}.accId`)
}
```

### Step 3: Update All Three Radio Buttons
Replace the inline onChange logic in each radio button with:
```tsx
onChange={(e) => handleSalesTypeChange(e.target.value as SalesType)}
```

### Step 4: Placement in Component
Position the `handleSalesTypeChange` function:
- After the existing `handleRemove` function (around line 143)
- Before the `getAccClassNames` function (line 154)
- This groups all handler functions together for better code organization

## Benefits
1. **DRY Principle**: Eliminates code duplication across three radio handlers
2. **Maintainability**: Single source of truth for sales type change logic
3. **Consistency**: Ensures all sales types behave identically when selected
4. **Commented Lines Preserved**: Keeps the commented lines for future reference as requested
5. **Readability**: Cleaner radio button JSX with delegated logic

## Files to Modify
- `src/features/accounts/purchase-sales/sales/payment-details/payment-details.tsx`

## Implementation Steps
1. Add the `handleSalesTypeChange` function after line 143
2. Update retail radio button (lines 228-237) to use the handler
3. Update bill radio button (lines 249-258) to use the handler
4. Update institution radio button (lines 270-279) to use the handler
5. Verify all three radio buttons still work correctly

## Testing Considerations
- Test switching between all three sales types
- Verify first debit account is properly cleared when changing types
- Ensure validation triggers correctly after type change
- Confirm commented lines remain in the extracted function
