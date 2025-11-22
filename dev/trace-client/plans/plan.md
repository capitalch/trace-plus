# Plan: Copy Customer Details to Shipping Address When Empty

## Problem
When Shipping Address is empty, the Shipping Address section should display Customer Details as a fallback.

## Current Behavior
- Line 307: `if (!_.isEmpty(shipTo))` - Only shows Shipping Address section if shipTo has data
- If shipTo is empty/null, Shipping Address section is not displayed at all

## Solution

### Change the condition to always show Shipping Address section
Replace the conditional check to use effectiveBillTo as fallback when shipTo is empty.

### Implementation Steps

**File**: `src/features/accounts/purchase-sales/sales/all-sales-invoice-jspdf.tsx`

**Step 1**: Change line 306-307
```typescript
// OLD:
const shipTo: ShippingInfoType | undefined | null = shippingInfo;
if (!_.isEmpty(shipTo)) {

// NEW:
const shipTo: ShippingInfoType | undefined | null = shippingInfo;
const effectiveShipTo = !_.isEmpty(shipTo) ? shipTo : effectiveBillTo;
if (effectiveShipTo) {
```

**Step 2**: Update shipToAddress array (line 318-327) to use effectiveShipTo
```typescript
// OLD:
const shipToAddress = [shipTo?.name,
  shipTo?.address1,
  ...

// NEW:
const shipToAddress = [
  effectiveShipTo?.contactName || effectiveShipTo?.name,
  effectiveShipTo?.address1,
  effectiveShipTo?.address2,
  effectiveShipTo?.pin ? `Pin: ${effectiveShipTo?.pin}` : '',
  effectiveShipTo?.city,
  effectiveShipTo?.state,
  effectiveShipTo?.country,
  effectiveShipTo?.mobileNumber ? `Ph: ${effectiveShipTo?.mobileNumber}` : '',
  effectiveShipTo?.email ? `Email: ${effectiveShipTo?.email}` : ''
]
```

**Note**: Use `contactName` for Customer Details (ContactsType) and `name` for Shipping Info (ShippingInfoType)

## Expected Result
- ✅ If shipTo has data → display Shipping Address
- ✅ If shipTo is empty → display Customer Details in Shipping Address section
- ✅ Shipping Address section always displays (unless both shipTo and effectiveBillTo are empty)

## Lines to Modify
- Line 306-307: Add effectiveShipTo variable and change condition
- Lines 318-327: Replace all `shipTo?.` references with `effectiveShipTo?.`
- Line 318: Use `effectiveShipTo?.contactName || effectiveShipTo?.name` for name field

## Total Changes
- ~2 lines added
- ~10 references changed from shipTo to effectiveShipTo
