# All Vouchers PDF - Address Display Logic Plan

## Overview
This document outlines the implementation plan for displaying branch-specific addresses in the voucher PDF based on whether it's a head office or branch office.

## Business Logic Requirements

### Address Display Rules
1. **PDF is associated with a branch** - Each voucher PDF is linked to a specific branch
2. **Branch Type Identification**:
   - Head Office: `branchId === 1`
   - Other Branches: `branchId !== 1`

### Display Logic by Branch Type

#### Head Office (branchId === 1)
- **Address**: Display unit's address (from `unitInfo`)
- **GSTIN**: Display unit's GSTIN
- **Format**:
  ```
  [Unit Name]
  Branch: [Branch Name]  GSTIN: [Unit GSTIN]  Address: [Unit Address1] [Unit Address2]  Pin: [Unit Pin]  Email: [Email]  Web: [Website]  State: [State]
  ```

#### Other Branches (branchId !== 1)
- **First Line After Unit Name**: Display branch name prominently
- **Address**: Display branch address (from `branchAddress`)
- **GSTIN Priority**:
  1. If branch has its own GSTIN → use branch GSTIN
  2. Otherwise → use unit's GSTIN as fallback
- **Format**:
  ```
  [Unit Name]
  [Branch Name]
  GSTIN: [Branch GSTIN or Unit GSTIN]  Address: [Branch Address1] [Branch Address2]  Pin: [Branch Pin]  Email: [Email]  Web: [Website]  State: [State]
  ```

## Implementation Plan

### Step 1: Update Type Definitions
**File**: `all-vouchers-pdf.tsx:8-13`

Update `VoucherPdfProps` type to include:
```typescript
export type VoucherPdfProps = {
  branchId: number | undefined;        // NEW: To identify head office vs branch
  branchName: string;
  branchAddress: BranchAddressType | undefined;  // NEW: Branch-specific address
  branchGstin: string | undefined;     // NEW: Branch-specific GSTIN
  currentDateFormat: string;
  tranH: TranHeaderType;
  tranD: VoucherTranDetailsType[];
};
```

Add import for `BranchAddressType`:
```typescript
import { BranchAddressType } from "../../../../features/login/login-slice";
```

### Step 2: Implement Address Logic in Component
**File**: `all-vouchers-pdf.tsx:18-26`

Add logic after getting `unitInfo` and `dateRange`:

```typescript
// Determine if this is head office (branchId === 1)
const isHeadOffice = branchId === 1;

// Determine which address to display
const displayAddress = isHeadOffice
  ? {
      address1: unitInfo.address1,
      address2: unitInfo.address2,
      pin: unitInfo.pin,
    }
  : {
      address1: branchAddress?.address1,
      address2: branchAddress?.address2,
      pin: branchAddress?.pin,
    };

// For GSTIN: Branch GSTIN has priority if available, otherwise use unit GSTIN
const displayGstin = isHeadOffice
  ? unitInfo.gstin
  : branchGstin || unitInfo.gstin;
```

### Step 3: Update Header Rendering
**File**: `all-vouchers-pdf.tsx:38-55`

Modify the company info section in the header:

```typescript
<View style={styles.companyInfo}>
  <Text style={styles.companyName}>{unitInfo.unitName}</Text>
  {/* Show branch name prominently for non-head-office branches */}
  {!isHeadOffice && (
    <Text style={{ marginTop: 2, fontWeight: "bold" }}>{branchName}</Text>
  )}
  <Text style={{ marginTop: 4 }}>{
    "".concat(
      // For head office, show "Branch: [name]" inline
      isHeadOffice ? "Branch: " + branchName : "",
      // Display GSTIN (branch or unit)
      displayGstin ? (isHeadOffice ? " GSTIN: " : "GSTIN: ") + displayGstin : "",
      // Display address (branch or unit)
      displayAddress.address1 ? " Address: " + displayAddress.address1 : "",
      " ",
      displayAddress.address2 || "",
      displayAddress.pin ? " Pin: " + displayAddress.pin : "",
      // Email, website, state remain from unit info
      unitInfo.email ? " Email: " + unitInfo.email : "",
      unitInfo.webSite ? " Web: " + unitInfo.webSite : "",
      unitInfo.state ? " State: " + unitInfo.state : ""
    )
  }</Text>
</View>
```

### Step 4: Update Parent Component to Pass Branch Data
**File**: `voucher-controls/voucher-status-bar.tsx:166-171`

Update the `AllVouchersPDF` component call to pass additional props:

```typescript
<AllVouchersPDF
  branchId={branchId}                    // NEW: From useUtilsInfo()
  branchName={branchName || ''}
  branchAddress={branchAddress}          // NEW: From useUtilsInfo()
  branchGstin={branchGstin}              // NEW: From useUtilsInfo()
  currentDateFormat={currentDateFormat}
  tranH={previewData?.tranH || {}}
  tranD={previewData?.tranD || []}
/>
```

Add the required values from `useUtilsInfo()` hook (already available at line 31-37):
```typescript
const {
    currentDateFormat,
    buCode,
    branchId,           // Already available
    branchName,         // Already available
    branchAddress,      // Already available
    branchGstin,        // Already available
    dbName,
    decodedDbParamsObject,
} = useUtilsInfo();
```

## Data Sources

### Available from `useUtilsInfo()` Hook
Located in: `src/utils/utils-info-hook.tsx:34-53`

Returns:
- `branchId: number | undefined` - Branch identifier
- `branchName: string` - Branch name
- `branchAddress: BranchAddressType | undefined` - Full address object with `address1`, `address2`, `pin`, `phones`
- `branchGstin: string | undefined` - Branch-specific GSTIN

### Branch Type Definitions
Located in: `src/features/login/login-slice.ts:184-201`

```typescript
export type BranchAddressType = {
  address1: string;
  address2?: string;
  pin: string;
  phones?: string;
}

export type BranchJDataType = {
  address?: BranchAddressType;
  gstin?: string;
}

export type BranchType = {
  branchId: number;
  branchName: string;
  branchCode: string;
  jData?: BranchJDataType | null;
}
```

## Testing Scenarios

### Test Case 1: Head Office (branchId === 1)
**Expected Output:**
```
[Unit Name]
Branch: Head Office  GSTIN: [Unit GSTIN]  Address: [Unit Address1] [Unit Address2]  Pin: [Unit Pin]  ...
```

### Test Case 2: Branch with Own GSTIN
**Expected Output:**
```
[Unit Name]
[Branch Name]
GSTIN: [Branch GSTIN]  Address: [Branch Address1] [Branch Address2]  Pin: [Branch Pin]  ...
```

### Test Case 3: Branch without GSTIN
**Expected Output:**
```
[Unit Name]
[Branch Name]
GSTIN: [Unit GSTIN]  Address: [Branch Address1] [Branch Address2]  Pin: [Branch Pin]  ...
```

## Files to Modify

1. **src/features/accounts/vouchers/all-vouchers/all-vouchers-pdf.tsx**
   - Update `VoucherPdfProps` type
   - Add import for `BranchAddressType`
   - Implement address logic
   - Update header rendering

2. **src/features/accounts/vouchers/voucher-controls/voucher-status-bar.tsx**
   - Extract additional fields from `useUtilsInfo()`
   - Pass new props to `AllVouchersPDF` component

## Notes

- The `useUtilsInfo()` hook already provides all necessary branch information
- No additional API calls or data fetching required
- The logic is purely presentational based on existing data
- Maintains backward compatibility by using optional chaining for branch data
