# Detailed Plan: Fix Missing Customer Details in General Ledger Drill-Down

## Problem Statement
When drilling down on a credit sale record in the general ledger page, the sales data displays correctly but customer details are missing.

---

## Investigation Summary

### Step 1: Understand the Data Flow

**Files Involved:**
1. `src/features/accounts/final-accounts/general-ledger/general-ledger.tsx` (Line 473-504)
   - `handleOnZoomIn()` function handles drill-down
   - Navigates to `/all-sales` with `{ id, tranTypeId, returnPath, ... }` in location state

2. `src/features/accounts/purchase-sales/sales/all-sales.tsx` (Line 103-107)
   - Catches navigation from General Ledger via `useEffect` on `location.state`
   - Calls `populateFormOverId(location.state.id)` to fetch and display data

3. `src/features/accounts/purchase-sales/sales/all-sales.tsx` (Line 316-386)
   - `populateFormOverId()` calls `getSalesEditDataOnId()` which uses SQL `getSalePurchaseDetailsOnId`
   - Sets `contactsData: billTo` at line 382

4. Backend SQL Query: `get_sale_purchase_details_on_id` in `trace-server/app/graphql/db/sql_accounts.py` (Line 2757)
   - Returns JSON object with `billTo` containing customer data from `Contacts` table
   - Customer data is fetched via: `SELECT c.* FROM "Contacts" c JOIN "TranH" h ON c."id" = h."contactsId"`

5. `src/features/accounts/purchase-sales/sales/customer-details/customer-details.tsx`
   - Displays customer information in the form

---

## Step 2: Identify Potential Root Causes

### Scenario A: Customer Data Not Retrieved from Backend
**Cause:** The `TranH.contactsId` is NULL or not linked to a contact record
**Check:** Verify the credit sale record has a valid `contactsId` in the `TranH` table
**Fix Location:** Backend - ensure contactsId is saved during credit sale creation

### Scenario B: Customer Data Retrieved but Not Displayed in Form
**Cause:** The `billTo` data exists but form isn't rendering it
**Check:**
- Verify `populateFormOverId()` correctly sets `contactsData` from `billTo`
- Verify `CustomerDetails` component displays when `contactsData` is present
**Fix Location:** `all-sales.tsx` line 382 and `customer-details.tsx`

### Scenario C: Customer Data Not Visible in View Mode
**Cause:** The `AllSalesView` component shows a grid but doesn't display detailed customer info
**Check:** The `contactDetails` column in `all-sales-view.tsx` line 268-274
**Fix Location:** May need to add customer details section to view mode or ensure column data is populated

---

## Step 3: Implementation Plan

### Phase 1: Verify Data Retrieval (Debug/Investigation)
1. Add console.log in `populateFormOverId()` to verify `billTo` data:
   - Location: `all-sales.tsx` after line 317
   - Log: `console.log('billTo:', salesEditData?.billTo)`

2. Check if `contactsData` is being set:
   - Location: `all-sales.tsx` line 382
   - Verify the `reset()` call includes `contactsData: billTo`

3. Test with a known credit sale that has customer linked

### Phase 2: Fix Based on Root Cause

#### If Scenario A (Backend Issue):
1. Check `TranH` record for `contactsId` value
2. If NULL, investigate why customer isn't saved during credit sale creation
3. Fix in `all-sales-submit-hook.ts` - ensure `contactsId` is included in `TranH` data

#### If Scenario B (Frontend Display Issue):
1. Verify `CustomerDetails` component receives `contactsData`
2. Check if there's a condition hiding customer details in certain modes
3. Fix in `customer-details.tsx` or `all-sales-form.tsx`

#### If Scenario C (View Mode Issue):
1. The `AllSalesView` grid has `contactDetails` column
2. Verify the `getAllSales` SQL returns customer information
3. If missing, update backend SQL to include contact details in the grid data

### Phase 3: Implementation Steps

**Step 3.1:** Debug and identify exact root cause
- Add temporary console.log statements
- Test drill-down flow with actual data
- Check browser console and network tab

**Step 3.2:** If `billTo` is NULL from backend:
- Check `TranH.contactsId` in database
- Trace back to where credit sales are saved
- Ensure `contactsId` is passed in the save operation
- File: `all-sales-submit-hook.ts` - `getTranHData()` function

**Step 3.3:** If `billTo` exists but not displayed:
- Check `customer-details.tsx` for conditional rendering
- Verify `contactDisplayData` is set from `contactsData`
- File: `customer-details.tsx` lines 47-65

**Step 3.4:** Test the fix:
- Create a new credit sale with customer
- Navigate to General Ledger
- Drill-down on the sale record
- Verify customer details appear

### Phase 4: Testing Checklist

1. [ ] Test drill-down on credit sale with linked customer
2. [ ] Test drill-down on credit sale without customer (handle gracefully)
3. [ ] Verify customer name, phone, email, address, GSTIN display correctly
4. [ ] Test edit functionality after drill-down
5. [ ] Test navigation back to General Ledger
6. [ ] Verify no console errors
7. [ ] Test with different sale types (retail, bill, institution)

---

## Step 4: Files to Modify (Estimated)

| File | Purpose | Priority |
|------|---------|----------|
| `all-sales.tsx` | Form population logic | High |
| `all-sales-submit-hook.ts` | Save contact ID with sale | High |
| `customer-details.tsx` | Display customer info | Medium |
| `all-sales-form.tsx` | Form layout with customer section | Medium |
| Backend SQL (if needed) | Ensure contactsId is saved | High |

---

## Step 5: Success Criteria

1. When drilling down from General Ledger on a credit sale:
   - Customer name displays in the customer details section
   - Customer mobile/phone number displays
   - Customer email displays
   - Customer address displays
   - Customer GSTIN displays (if applicable)

2. Data accuracy:
   - Customer details match the actual customer on the credit sale record
   - Same customer appears in invoice preview/print

3. Error handling:
   - No console errors during drill-down
   - Graceful handling if customer data is missing (show empty/placeholder)

4. Consistency:
   - Customer details appear same way whether editing from View mode or drilling from General Ledger

---

## Step 6: Execution Order

1. **Debug First** - Add console logs and identify exact issue
2. **Fix Backend** (if contactsId not saved) - Update save logic
3. **Fix Frontend** (if display issue) - Update form population or rendering
4. **Test Thoroughly** - All scenarios in testing checklist
5. **Remove Debug Code** - Clean up console.log statements
6. **Final Verification** - Complete end-to-end test

---

## Notes

- The SQL query `get_sale_purchase_details_on_id` already includes `billTo` in its response
- The join condition is: `"Contacts" c JOIN "TranH" h ON c."id" = h."contactsId"`
- If `contactsId` is NULL in `TranH`, the `billTo` will be NULL
- Customer details component already exists and works for new sales
- Focus should be on ensuring the data chain is complete from save to retrieval
