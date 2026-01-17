# Plan: Fix Customer Details Not Visible in General Ledger Drill Down

## Problem Statement
When drilling down from General Ledger to edit a credit sale record, customer name and address are not visible. However, when editing through Sales View, the customer details display correctly.

---

## Root Cause Identified

In `src/features/accounts/purchase-sales/sales/all-sales.tsx` at **line 326**:
```typescript
const billTo: ContactsType | null | any = salesEditData.billTo //|| salesEditData.businessContacts as ExtBusinessContactsAccM || null
```

The fallback to `businessContacts` is **commented out**. When `billTo` is null (which can happen during general ledger drill-down), the code doesn't fall back to `businessContacts` which contains the customer data.

---

## Key Files
| File | Line | Purpose |
|------|------|---------|
| `src/features/accounts/purchase-sales/sales/all-sales.tsx` | 326 | Main fix location |
| `src/features/accounts/purchase-sales/sales/customer-details/customer-details.tsx` | 209-228 | Displays customer info |
| `src/utils/global-types-interfaces-enums.ts` | 116-194 | Type definitions |

---

## Data Structure Difference

**billTo (ContactsType):**
- Has `address1`, `address2`, `city`, `state`, `pin`, `country` as separate fields
- Has `contactName`, `mobileNumber`, `email`, `gstin`

**businessContacts (ExtBusinessContactsAccMType):**
- Has `jAddress` as JSON array containing address objects with: `address1`, `address2`, `city`, `state`, `pin`, `country`
- Has `contactName`, `mobileNumber`, `email`, `gstin`

---

## Implementation Steps

### Step 1: Create helper function to extract address from businessContacts
Location: `src/features/accounts/purchase-sales/sales/all-sales.tsx`

Create a function to convert `businessContacts.jAddress` (JSON array) to a single address string:
```typescript
function getAddressFromBusinessContacts(businessContacts: ExtBusinessContactsAccMType): string {
    if (!businessContacts?.jAddress) return ''
    const addresses = businessContacts.jAddress
    if (Array.isArray(addresses) && addresses.length > 0) {
        const addr = addresses[0]
        return [addr.address1, addr.address2, addr.city, addr.state, addr.pin, addr.country]
            .filter(Boolean).join(', ')
    }
    return ''
}
```

### Step 2: Modify populateFormOverId to handle businessContacts fallback
Location: `src/features/accounts/purchase-sales/sales/all-sales.tsx` (around line 326)

Update the logic to:
1. Check if `billTo` exists and use it
2. If `billTo` is null, check for `businessContacts` and convert to display format

```typescript
const billTo: ContactsType | null = salesEditData.billTo
let contactDisplayData = null

if (billTo) {
    // Use existing billTo logic
    contactDisplayData = {
        name: billTo.contactName,
        mobile: billTo.mobileNumber,
        email: billTo.email,
        address: [billTo.address1, billTo.address2, billTo.city, billTo.state, billTo.pin, billTo.country].filter(Boolean).join(', '),
        gstin: billTo.gstin
    }
} else if (salesEditData.businessContacts) {
    // Fallback to businessContacts
    const bc = salesEditData.businessContacts
    contactDisplayData = {
        name: bc.contactName,
        mobile: bc.mobileNumber,
        email: bc.email,
        address: getAddressFromBusinessContacts(bc),
        gstin: bc.gstin
    }
}
```

### Step 3: Update contactsData population in reset() call
Location: `src/features/accounts/purchase-sales/sales/all-sales.tsx` (around line 382)

Ensure `contactsData` uses the fallback:
```typescript
contactsData: billTo || salesEditData.businessContacts || null
```

### Step 4: Test both scenarios
1. Test editing from Sales View - should continue to work as before
2. Test drill-down from General Ledger - should now show customer details

---

## Testing Checklist
- [ ] Drill-down from General Ledger shows customer name
- [ ] Drill-down from General Ledger shows customer mobile
- [ ] Drill-down from General Ledger shows customer email
- [ ] Drill-down from General Ledger shows customer address
- [ ] Drill-down from General Ledger shows customer GSTIN
- [ ] Edit from Sales View still works correctly
- [ ] No console errors
- [ ] Handle case where both billTo and businessContacts are null

---

## Success Criteria
1. Customer details visible when drilling down from General Ledger
2. Same customer details visible when editing from Sales View
3. No regression in existing functionality
