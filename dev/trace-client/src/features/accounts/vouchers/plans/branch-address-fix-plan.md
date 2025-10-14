# Branch Address Display Fix Plan

## Problem Statement
Branch address fields (address1, address2, phones, pin) are not displaying for branches other than head office in the voucher PDF.

## Root Cause Analysis

### Current Implementation Issue
Looking at `all-vouchers-pdf.tsx:73-84`, the address rendering logic has a problem:

```typescript
<Text style={{ marginTop: 4 }}>{
  "".concat(
    isHeadOffice ? "Branch: " + branchName : "",  // ← Line 75: For non-head office, this is empty string
    displayGstin ? (isHeadOffice ? " GSTIN: " : "GSTIN: ") + displayGstin : "",
    displayAddress.address1 ? " Address: " + displayAddress.address1 : "",  // ← Line 77: Starts with SPACE
    " ",
    displayAddress.address2 || "",
    displayAddress.pin ? " Pin: " + displayAddress.pin : "",
    unitInfo.email ? " Email: " + unitInfo.email : "",
    unitInfo.webSite ? " Web: " + unitInfo.webSite : "",
    unitInfo.state ? " State: " + unitInfo.state : ""
  )
}</Text>
```

**The Issue:**
- For non-head office branches, line 75 returns an empty string `""`
- Line 77 for address1 starts with `" Address: "` which includes a leading space
- When concatenated, this results in the address line starting with a space: `" Address: ..."`
- **In PDF rendering with @react-pdf/renderer, text starting with a space may not render properly or the leading space causes the entire text to be hidden**

### Additional Missing Field
The `phones` field from `BranchAddressType` is not being included in the display at all.

## Solution Plan

### Fix 1: Remove Leading Space for Non-Head Office Branches
**File:** `all-vouchers-pdf.tsx:73-84`

Change the concatenation logic to ensure no leading spaces for non-head office branches:

```typescript
<Text style={{ marginTop: 4 }}>{
  "".concat(
    isHeadOffice ? "Branch: " + branchName : "",
    displayGstin ? (isHeadOffice ? " GSTIN: " : "GSTIN: ") + displayGstin : "",
    displayAddress.address1 ? (isHeadOffice ? " Address: " : " Address: ") + displayAddress.address1 : "",
    displayAddress.address2 ? " " + displayAddress.address2 : "",
    displayAddress.pin ? " Pin: " + displayAddress.pin : "",
    unitInfo.email ? " Email: " + unitInfo.email : "",
    unitInfo.webSite ? " Web: " + unitInfo.webSite : "",
    unitInfo.state ? " State: " + unitInfo.state : ""
  )
}</Text>
```

**Problem:** This still has the leading space issue for non-head office.

### Better Solution: Conditional First Element

Change the logic to ensure the first element never starts with a space:

```typescript
<Text style={{ marginTop: 4 }}>{
  "".concat(
    // First element - no leading space
    isHeadOffice
      ? "Branch: " + branchName
      : displayGstin
        ? "GSTIN: " + displayGstin
        : displayAddress.address1
          ? "Address: " + displayAddress.address1
          : "",

    // Subsequent elements - all have leading space
    isHeadOffice && displayGstin ? " GSTIN: " + displayGstin : "",
    !isHeadOffice && displayGstin && displayAddress.address1 ? " Address: " + displayAddress.address1 : "",
    displayAddress.address2 ? " " + displayAddress.address2 : "",
    displayAddress.pin ? " Pin: " + displayAddress.pin : "",
    unitInfo.email ? " Email: " + unitInfo.email : "",
    unitInfo.webSite ? " Web: " + unitInfo.webSite : "",
    unitInfo.state ? " State: " + unitInfo.state : ""
  )
}</Text>
```

**Problem:** This is getting too complex and hard to maintain.

### Best Solution: Build Address String with Array Filter

Create a clean, maintainable solution using array filtering:

**Location:** `all-vouchers-pdf.tsx:34-53` (after calculating `displayGstin`)

```typescript
// Build address parts array and filter out empty strings
const addressParts: string[] = [];

if (isHeadOffice) {
  addressParts.push("Branch: " + branchName);
  if (displayGstin) addressParts.push("GSTIN: " + displayGstin);
} else {
  // For non-head office, GSTIN comes first
  if (displayGstin) addressParts.push("GSTIN: " + displayGstin);
}

if (displayAddress.address1) addressParts.push("Address: " + displayAddress.address1);
if (displayAddress.address2) addressParts.push(displayAddress.address2);
if (displayAddress.pin) addressParts.push("Pin: " + displayAddress.pin);
if (branchAddress?.phones) addressParts.push("Phones: " + branchAddress.phones);
if (unitInfo.email) addressParts.push("Email: " + unitInfo.email);
if (unitInfo.webSite) addressParts.push("Web: " + unitInfo.webSite);
if (unitInfo.state) addressParts.push("State: " + unitInfo.state);

const addressString = addressParts.join(" ");
```

Then update the rendering to simply use the string:

```typescript
<Text style={{ marginTop: 4 }}>{addressString}</Text>
```

### Fix 2: Add Phones Field to Display
Include the `phones` field from branch address in the display (already included in the array-based solution above).

## Implementation Steps

### Step 1: Add Address String Builder
**File:** `all-vouchers-pdf.tsx`
**Location:** After line 53 (after `displayGstin` calculation)

Add the array-based address builder logic.

### Step 2: Update Rendering
**File:** `all-vouchers-pdf.tsx:73-84`

Replace the complex `.concat()` logic with the simple `addressString` variable.

## Expected Output After Fix

### For Head Office (branchId === 1):
```
[Unit Name]
Branch: Head Office GSTIN: 27XXXXX1234X1Z5 Address: 123 Main St Suite 100 Pin: 400001 Phones: +91-22-12345678 Email: contact@company.com Web: www.company.com State: Maharashtra
```

### For Branch Office with GSTIN:
```
[Unit Name]
Mumbai Branch
GSTIN: 27XXXXX1234X1Z6 Address: 456 Branch Rd Floor 2 Pin: 400002 Phones: +91-22-87654321 Email: contact@company.com Web: www.company.com State: Maharashtra
```

### For Branch Office without GSTIN:
```
[Unit Name]
Delhi Branch
GSTIN: 27XXXXX1234X1Z5 Address: 789 Delhi St Building A Pin: 110001 Phones: +91-11-11112222 Email: contact@company.com Web: www.company.com State: Maharashtra
```

## Testing Checklist

- [ ] Test with head office (branchId === 1)
- [ ] Test with branch having its own GSTIN
- [ ] Test with branch without GSTIN (should fall back to unit GSTIN)
- [ ] Test with branch having all address fields populated
- [ ] Test with branch having partial address fields (some missing)
- [ ] Test with branch having phones field populated
- [ ] Verify no leading/trailing spaces in rendered text
- [ ] Verify all fields are visible and properly spaced

## Files to Modify

1. **src/features/accounts/vouchers/all-vouchers/all-vouchers-pdf.tsx**
   - Add address string builder after line 53
   - Simplify rendering logic at lines 73-84
