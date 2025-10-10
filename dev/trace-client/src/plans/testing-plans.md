# Manual Testing Plan: Account Transactions CRUD Operations
## Vouchers Testing

### 4. Journal Voucher (tranTypeId: 1)

#### 4.1 CREATE - New Journal Voucher

**Test Case J-C-001: Create Simple Journal Entry**
- **Objective:** Verify basic journal entry creation
- **Test Steps:**
  1. Select "Journal" voucher type
  2. Enter transaction date
  3. Debit Entry: "Salary Expense", 50,000.00
  4. Credit Entry: "Salary Payable", 50,000.00
  5. Add remarks: "Salary accrued for January"
  6. Click "Submit"
- **Expected Results:**
  - Journal entry saved successfully
  - Can use any account type (not restricted to bank/cash)
  - Proper double-entry maintained
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case J-C-002: Create Compound Journal Entry**
- **Objective:** Verify journal with multiple debits and credits
- **Test Steps:**
  1. Select "Journal" voucher type
  2. Debit Entries:
     - "Furniture & Fixtures", 30,000.00
     - "Computer Equipment", 20,000.00
  3. Credit Entries:
     - "Capital Account", 40,000.00
     - "Loan Account", 10,000.00
  4. Verify total debits = total credits = 50,000
  5. Click "Submit"
- **Expected Results:**
  - Complex journal entry saved
  - All four line items recorded in TranD
  - Totals balanced correctly
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case J-C-003: Create Journal Entry with GST**
- **Objective:** Verify journal entry can include GST if configured
- **Test Steps:**
  1. Select "Journal" voucher type
  2. Enable GST checkbox
  3. Create entry with GST calculations
  4. Click "Submit"
- **Expected Results:**
  - GST is calculated and saved if showGstInHeader is true
  - ExtGstTranD records created
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 4.2-4.4 READ, UPDATE, DELETE Journal Voucher

*(Follow same test case patterns as Payment Voucher)*

---

## Sales Testing

### 5. Sales Invoice (tranTypeId: 4)

#### 5.1 CREATE - New Sales Invoice

**Test Case S-C-001: Create Simple Sales Invoice (Single Item, No GST)**
- **Objective:** Verify basic sales invoice creation
- **Pre-conditions:**
  - Customer contact exists
  - Product exists
  - Customer does not have GSTIN (for non-GST sale)
- **Test Steps:**
  1. Navigate to Sales screen
  2. Enter transaction date
  3. Enter invoice number: "SI001"
  4. Select customer from dropdown
  5. Verify customer details populate (address, contact)
  6. Add line item:
     - Select product: "Product A"
     - Enter quantity: 10
     - Enter rate: 500.00
     - Verify amount calculates: 5,000.00
  7. Verify totals:
     - Sub Total: 5,000.00
     - Total Invoice Amount: 5,000.00
  8. In Debit/Payment section:
     - Select account: "Cash"
     - Amount should auto-fill: 5,000.00
  9. Verify difference = 0 (invoice amount - payment amount)
  10. Click "Submit"
- **Expected Results:**
  - Sales invoice saved successfully
  - TranH record created with tranTypeId = 4
  - TranD record created for sales line item (credit entry)
  - TranD record created for payment (debit entry)
  - contactsId field populated with customer ID
  - Auto reference number generated
  - Success message displayed
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-C-002: Create Sales Invoice with GST (Intrastate - CGST + SGST)**
- **Objective:** Verify GST calculation for intrastate sale
- **Pre-conditions:**
  - Company GSTIN: 29XXXXX (Karnataka)
  - Customer GSTIN: 29YYYYY (Karnataka - same state)
- **Test Steps:**
  1. Create new sales invoice
  2. Select customer with same state GSTIN
  3. System should detect intrastate transaction
  4. Add line item:
     - Product: "Service B"
     - Quantity: 1
     - Rate: 10,000.00
     - GST Rate: 18% (should calculate as 9% CGST + 9% SGST)
  5. Verify calculations:
     - Base Amount: 10,000.00
     - CGST (9%): 900.00
     - SGST (9%): 900.00
     - IGST: 0.00
     - Total: 11,800.00
  6. Add payment: Cash, 11,800.00
  7. Click "Submit"
- **Expected Results:**
  - CGST and SGST calculated correctly (no IGST)
  - ExtGstTranD record created with:
    - cgst = 900.00
    - sgst = 900.00
    - igst = 0.00
    - isInput = false (output GST for sales)
  - Total invoice amount = 11,800.00
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-C-003: Create Sales Invoice with GST (Interstate - IGST)**
- **Objective:** Verify GST calculation for interstate sale
- **Pre-conditions:**
  - Company GSTIN: 29XXXXX (Karnataka)
  - Customer GSTIN: 27YYYYY (Maharashtra - different state)
- **Test Steps:**
  1. Create new sales invoice
  2. Select customer with different state GSTIN
  3. System should detect interstate transaction
  4. Add line item:
     - Product with 18% GST
     - Amount: 10,000.00
  5. Verify calculations:
     - Base Amount: 10,000.00
     - CGST: 0.00
     - SGST: 0.00
     - IGST (18%): 1,800.00
     - Total: 11,800.00
  6. Add payment
  7. Click "Submit"
- **Expected Results:**
  - IGST calculated correctly (no CGST/SGST)
  - ExtGstTranD record: igst = 1,800.00, cgst = sgst = 0
  - Total matches invoice amount
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-C-004: Create Sales Invoice with Multiple Items (Different GST Rates)**
- **Objective:** Verify handling of multiple items with different GST rates
- **Test Steps:**
  1. Create new sales invoice
  2. Select customer with GSTIN (intrastate)
  3. Add line items:
     - Item 1: GST 5%, Amount 1,000 → GST 50 (25 CGST + 25 SGST)
     - Item 2: GST 12%, Amount 2,000 → GST 240 (120 CGST + 120 SGST)
     - Item 3: GST 18%, Amount 3,000 → GST 540 (270 CGST + 270 SGST)
  4. Verify totals:
     - Sub Total: 6,000.00
     - Total CGST: 415.00
     - Total SGST: 415.00
     - Total Invoice: 6,830.00
  5. Add payment: 6,830.00
  6. Click "Submit"
- **Expected Results:**
  - Each line item has separate ExtGstTranD record
  - GST totals are aggregated correctly
  - All line items saved with proper GST breakup
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-C-005: Create Sales Invoice with Discounts**
- **Objective:** Verify discount handling in sales invoice
- **Test Steps:**
  1. Create new sales invoice
  2. Add line item: Qty 10, Rate 1,000 = 10,000
  3. Apply line-level discount: 10% → 1,000 discount
  4. Verify amount after discount: 9,000
  5. Apply GST 18% on 9,000 → 1,620
  6. Total: 10,620
  7. Apply invoice-level discount (if supported): 620
  8. Final total: 10,000
  9. Add payment
  10. Click "Submit"
- **Expected Results:**
  - Discounts calculated correctly
  - GST calculated on discounted amount
  - Final totals match expected calculations
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-C-006: Create Sales Invoice with Multiple Payment Accounts**
- **Objective:** Verify partial payment with multiple accounts
- **Test Steps:**
  1. Create sales invoice, total: 20,000.00
  2. In Debit/Payment section:
     - Account 1: "Cash", 10,000.00
     - Add another debit account
     - Account 2: "Bank", 10,000.00
  3. Verify difference = 0
  4. Click "Submit"
- **Expected Results:**
  - Multiple debit entries created in TranD
  - Total debits = invoice amount
  - No validation error about amount mismatch
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-C-007: Create Sales Invoice with Partial Payment**
- **Objective:** Verify sales invoice can be created with partial payment
- **Test Steps:**
  1. Create sales invoice, total: 15,000.00
  2. Add payment: Cash, 10,000.00
  3. Check if system allows difference (5,000 unpaid)
  4. Try to submit
- **Expected Results:**
  - If allowed: Invoice saved with outstanding balance
  - If not allowed: Validation error about amount mismatch
  - Document actual system behavior
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-C-008: Validation - Sales Invoice with Zero Quantity**
- **Objective:** Verify system prevents zero quantity items
- **Test Steps:**
  1. Create sales invoice
  2. Add line item with quantity: 0
  3. Try to proceed
- **Expected Results:**
  - Validation error about zero quantity
  - Or system allows (document behavior)
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-C-009: Validation - Sales Invoice Amount Mismatch**
- **Objective:** Verify validation when payment doesn't match invoice total
- **Test Steps:**
  1. Create sales invoice, total: 10,000.00
  2. Add payment: 9,500.00
  3. Difference = 500.00
  4. Click "Submit"
- **Expected Results:**
  - Error message about amount mismatch
  - Invoice NOT saved
  - Message: "Payment amount does not match invoice amount"
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-C-010: Create Sales Invoice with Shipping Information**
- **Objective:** Verify shipping address and details can be added
- **Test Steps:**
  1. Create sales invoice
  2. Expand shipping information section
  3. Enter shipping address (different from billing)
  4. Enter shipping charges (if applicable)
  5. Click "Submit"
- **Expected Results:**
  - Shipping information saved (likely in jData JSON field)
  - Shipping charges added to invoice total
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 5.2 READ - View Sales Invoice

**Test Case S-R-001: View Sales Invoice from View Mode**
- **Objective:** Verify sales invoice can be viewed with all details
- **Test Steps:**
  1. Navigate to Sales → View mode
  2. Locate a saved sales invoice
  3. Click to view details
- **Expected Results:**
  - Customer details displayed correctly
  - All line items shown with quantities, rates, amounts
  - GST breakup displayed correctly
  - Payment details shown
  - Invoice totals match saved data
  - Auto reference number and user reference number visible
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-R-002: Print Sales Invoice**
- **Objective:** Verify sales invoice can be printed
- **Test Steps:**
  1. Open saved sales invoice
  2. Click "Print" or "Download PDF" button
  3. Review PDF output
- **Expected Results:**
  - PDF generated with proper formatting
  - Company header/logo (if configured)
  - Customer details
  - Line items in table format
  - GST summary
  - Payment details
  - Terms & conditions (if configured)
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-R-003: Navigate to Sales Invoice from Sales Report**
- **Objective:** Verify navigation from report preserves context
- **Test Steps:**
  1. Navigate to Sales Report
  2. Apply filters
  3. Click on an invoice
  4. Verify "Back to Report" link appears
  5. Edit invoice if needed
  6. Click "Back to Report"
- **Expected Results:**
  - Invoice loads correctly
  - Back link preserves report filters
  - Returning to report maintains position/selection
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 5.3 UPDATE - Edit Sales Invoice

**Test Case S-U-001: Edit Sales Invoice - Modify Customer**
- **Objective:** Verify customer can be changed on existing invoice
- **Test Steps:**
  1. Open existing sales invoice
  2. Change customer to different contact
  3. Verify customer details update
  4. Click "Submit"
- **Expected Results:**
  - contactsId updated in TranH table
  - Invoice saved with new customer
  - Or validation error if system doesn't allow customer change (document behavior)
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-U-002: Edit Sales Invoice - Modify Line Items**
- **Objective:** Verify line items can be added/removed/modified
- **Test Steps:**
  1. Open existing sales invoice with 2 line items
  2. Modify first item: Change quantity from 10 to 15
  3. Add a new third line item
  4. Delete the second line item
  5. Verify totals recalculate
  6. Update payment amount to match new total
  7. Click "Submit"
- **Expected Results:**
  - First item updated in TranD (same ID)
  - Third item created with new TranD ID
  - Second item removed (ID added to deletedIds)
  - GST recalculated correctly
  - Invoice total updated
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-U-003: Edit Sales Invoice - Change GST Rates**
- **Objective:** Verify GST rates can be modified
- **Test Steps:**
  1. Open existing sales invoice with GST
  2. Change GST rate on a line item from 18% to 12%
  3. Verify GST amounts recalculate
  4. Update payment to match new total
  5. Click "Submit"
- **Expected Results:**
  - ExtGstTranD record updated with new rate
  - CGST, SGST, or IGST recalculated
  - Invoice total adjusted
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case S-U-004: Edit Sales Invoice - Change Payment Accounts**
- **Objective:** Verify payment accounts can be modified
- **Test Steps:**
  1. Open sales invoice paid via "Cash"
  2. Change payment account to "Bank"
  3. Or add multiple payment accounts
  4. Click "Submit"
- **Expected Results:**
  - Debit TranD records updated
  - Account IDs changed correctly
  - Amounts remain balanced
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 5.4 DELETE - Delete Sales Invoice

**Test Case S-D-001: Delete Sales Invoice**
- **Objective:** Verify sales invoice can be deleted
- **Test Steps:**
  1. Navigate to Sales View
  2. Select an invoice
  3. Click "Delete" button
  4. Confirm deletion
- **Expected Results:**
  - Confirmation dialog appears
  - After confirmation, invoice removed from list
  - TranH and all related TranD records deleted
  - ExtGstTranD records deleted
  - Success message displayed
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

## Purchase Testing

### 6. Purchase Invoice (tranTypeId: 5)

#### 6.1 CREATE - New Purchase Invoice

**Test Case PU-C-001: Create Simple Purchase Invoice (Single Item, No GST)**
- **Objective:** Verify basic purchase invoice creation
- **Test Steps:**
  1. Navigate to Purchase screen
  2. Enter transaction date
  3. Enter supplier invoice number: "PI001"
  4. Select supplier from dropdown
  5. Verify supplier details populate
  6. Add line item:
     - Select product: "Raw Material A"
     - Quantity: 100
     - Rate: 50.00
     - Amount: 5,000.00
  7. Verify totals: Sub Total and Invoice Total = 5,000.00
  8. In Credit/Payment section:
     - Select account: "Cash" (payment made)
     - Amount: 5,000.00
  9. Click "Submit"
- **Expected Results:**
  - Purchase invoice saved successfully
  - TranH created with tranTypeId = 5
  - TranD credit entry for purchase line item
  - TranD debit entry for payment (if payment made)
  - contactsId populated with supplier ID
  - Auto reference number generated
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PU-C-002: Create Purchase Invoice with GST (Intrastate)**
- **Objective:** Verify GST calculation for intrastate purchase
- **Pre-conditions:**
  - Company GSTIN: 29XXXXX (Karnataka)
  - Supplier GSTIN: 29YYYYY (Karnataka)
- **Test Steps:**
  1. Create new purchase invoice
  2. Select supplier with same state GSTIN
  3. Add line item with GST 18%:
     - Amount: 10,000.00
     - CGST: 900.00, SGST: 900.00
     - Total: 11,800.00
  4. Add payment: 11,800.00
  5. Click "Submit"
- **Expected Results:**
  - CGST and SGST calculated correctly
  - ExtGstTranD created with isInput = true (input GST for purchase)
  - Total purchase amount = 11,800.00
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PU-C-003: Create Purchase Invoice with GST (Interstate)**
- **Objective:** Verify IGST for interstate purchase
- **Pre-conditions:**
  - Company: Karnataka (29)
  - Supplier: Maharashtra (27)
- **Test Steps:**
  1. Create purchase invoice
  2. Select interstate supplier
  3. Add item: Amount 10,000, GST 18%
  4. Verify IGST = 1,800, CGST = SGST = 0
  5. Total = 11,800
  6. Add payment
  7. Click "Submit"
- **Expected Results:**
  - IGST calculated, no CGST/SGST
  - isInput = true in ExtGstTranD
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PU-C-004: Validation - Duplicate Purchase Invoice**
- **Objective:** Verify system checks for duplicate supplier invoice numbers
- **Test Steps:**
  1. Create purchase invoice: Supplier A, Invoice No "SUP001"
  2. Save successfully
  3. Create another purchase invoice
  4. Select same Supplier A
  5. Enter same Invoice No "SUP001"
  6. Try to submit
- **Expected Results:**
  - Validation error: "Invoice number already exists for this supplier"
  - Invoice NOT saved
  - Or system allows if duplicate check not implemented (document behavior)
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PU-C-005: Create Purchase Invoice with Multiple Items**
- **Objective:** Verify multiple line items in purchase
- **Test Steps:**
  1. Create purchase invoice
  2. Add 3 different items with different quantities and rates
  3. Verify sub-total calculation
  4. Apply GST if applicable
  5. Add payment
  6. Click "Submit"
- **Expected Results:**
  - All line items saved
  - Quantities and amounts correct
  - Total calculated correctly
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PU-C-006: Create Purchase Invoice with Credit (No Payment)**
- **Objective:** Verify purchase on credit (no immediate payment)
- **Test Steps:**
  1. Create purchase invoice, total 20,000
  2. In payment section, select "Accounts Payable" or supplier credit account
  3. Or leave payment section empty if system allows
  4. Click "Submit"
- **Expected Results:**
  - Purchase recorded as credit transaction
  - Payment can be recorded separately later
  - Or validation error if payment is mandatory (document behavior)
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 6.2 READ - View Purchase Invoice

**Test Case PU-R-001: View Purchase Invoice**
- **Objective:** Verify purchase invoice details can be viewed
- **Test Steps:**
  1. Navigate to Purchase → View tab
  2. Locate saved purchase invoice
  3. Click to view
- **Expected Results:**
  - Supplier details displayed
  - All line items with quantities, rates, GST
  - Payment details
  - Invoice totals correct
  - Auto and user reference numbers shown
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PU-R-002: Print Purchase Invoice**
- **Objective:** Verify purchase invoice can be printed
- **Test Steps:**
  1. Open purchase invoice
  2. Click print/download PDF
- **Expected Results:**
  - PDF generated with purchase details
  - Formatted appropriately
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 6.3 UPDATE - Edit Purchase Invoice

**Test Case PU-U-001: Edit Purchase Invoice - Modify Supplier**
- **Objective:** Verify supplier can be changed
- **Test Steps:**
  1. Open existing purchase invoice
  2. Change supplier
  3. Click "Submit"
- **Expected Results:**
  - contactsId updated
  - Or error if supplier change not allowed
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PU-U-002: Edit Purchase Invoice - Modify Line Items**
- **Objective:** Verify line items can be edited
- **Test Steps:**
  1. Open purchase invoice
  2. Change quantities and add/remove items
  3. Update payment to match new total
  4. Click "Submit"
- **Expected Results:**
  - Line items updated correctly
  - deletedIds handled properly
  - Totals recalculated
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PU-U-003: Edit Purchase Invoice - Change Invoice Number**
- **Objective:** Verify supplier invoice number can be changed
- **Test Steps:**
  1. Open purchase invoice with invoice number "PI001"
  2. Change to "PI001-Rev1"
  3. Click "Submit"
- **Expected Results:**
  - userRefNo updated
  - Duplicate check runs (if applicable)
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 6.4 DELETE - Delete Purchase Invoice

**Test Case PU-D-001: Delete Purchase Invoice**
- **Objective:** Verify purchase invoice can be deleted
- **Test Steps:**
  1. Select purchase invoice
  2. Click delete
  3. Confirm
- **Expected Results:**
  - Invoice removed
  - All related records deleted
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

## Sales Return Testing

### 7. Sales Return (tranTypeId: 9)

#### 7.1 CREATE - New Sales Return

**Test Case SR-C-001: Create Sales Return Against Existing Invoice**
- **Objective:** Verify sales return can be created referencing original invoice
- **Pre-conditions:** Sales invoice exists (e.g., Invoice SI001)
- **Test Steps:**
  1. Navigate to Sales Return screen
  2. Enter transaction date
  3. Use "Search Invoice" or similar feature to find original invoice
  4. Select invoice SI001
  5. System should populate:
     - Customer details
     - Original line items
  6. Select items to return:
     - Item 1: Return quantity 5 (out of original 10)
     - Item 2: Return quantity 10 (full return)
  7. Verify return amounts calculate correctly
  8. GST should be reversed proportionally
  9. In Credit/Payment section (money to be refunded):
     - Select "Cash", amount matches return total
  10. Click "Submit"
- **Expected Results:**
  - Sales return saved with tranTypeId = 9
  - TranH created with reference to original invoice (possibly in jData or lineRefNo)
  - TranD debit entries for returned items (reverse of original credit)
  - TranD credit entry for refund account
  - ExtGstTranD records with reversed GST amounts
  - isInput flag set appropriately
  - Original invoice remains intact (not modified)
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case SR-C-002: Create Sales Return with Partial GST Reversal**
- **Objective:** Verify GST reversal for partial returns
- **Pre-conditions:** Sales invoice with GST exists
- **Test Steps:**
  1. Original invoice: 10 units @ 1,000 = 10,000 + GST 1,800 = 11,800
  2. Create sales return
  3. Return 5 units (50% of original)
  4. Verify calculations:
     - Return amount: 5,000
     - GST reversal: 900 (50% of 1,800)
     - Total return: 5,900
  5. Add refund account
  6. Click "Submit"
- **Expected Results:**
  - GST reversed proportionally
  - ExtGstTranD created with half the original GST amounts
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case SR-C-003: Create Sales Return Without Original Invoice**
- **Objective:** Verify standalone sales return (if allowed)
- **Test Steps:**
  1. Create sales return without referencing invoice
  2. Manually enter customer
  3. Add return items and quantities
  4. Enter amounts manually
  5. Click "Submit"
- **Expected Results:**
  - System allows standalone sales return OR
  - Validation error requiring original invoice reference
  - Document actual system behavior
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case SR-C-004: Create Sales Return with Different Payment Method**
- **Objective:** Verify refund can be via different account than original payment
- **Test Steps:**
  1. Original invoice paid via Cash
  2. Create sales return
  3. Select "Bank Transfer" for refund
  4. Click "Submit"
- **Expected Results:**
  - Refund recorded in selected account
  - Not required to match original payment method
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case SR-C-005: Validation - Return Quantity Exceeds Original**
- **Objective:** Verify system prevents over-return
- **Test Steps:**
  1. Original invoice: 10 units
  2. Create return: 15 units
  3. Try to submit
- **Expected Results:**
  - Validation error: "Return quantity cannot exceed original quantity"
  - OR system allows (if no validation exists)
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 7.2 READ - View Sales Return

**Test Case SR-R-001: View Sales Return Details**
- **Objective:** Verify sales return can be viewed
- **Test Steps:**
  1. Navigate to Sales Return → View
  2. Select a sales return record
  3. View details
- **Expected Results:**
  - Customer details shown
  - Original invoice reference (if applicable)
  - Returned items with quantities
  - GST reversal details
  - Refund account and amount
  - All amounts correct
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case SR-R-002: Print Sales Return Invoice**
- **Objective:** Verify sales return can be printed
- **Test Steps:**
  1. Open sales return
  2. Click print/PDF
- **Expected Results:**
  - PDF shows "Sales Return" or "Credit Note"
  - Original invoice reference
  - Returned items
  - Refund details
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 7.3 UPDATE - Edit Sales Return

**Test Case SR-U-001: Edit Sales Return - Modify Return Quantities**
- **Objective:** Verify return quantities can be modified
- **Test Steps:**
  1. Open existing sales return
  2. Change return quantity on an item
  3. Verify amounts recalculate
  4. Update refund amount
  5. Click "Submit"
- **Expected Results:**
  - Quantities updated
  - Amounts and GST recalculated
  - Changes saved to database
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case SR-U-002: Edit Sales Return - Change Refund Account**
- **Objective:** Verify refund account can be changed
- **Test Steps:**
  1. Open sales return with Cash refund
  2. Change to Bank refund
  3. Click "Submit"
- **Expected Results:**
  - TranD credit entry updated with new account
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 7.4 DELETE - Delete Sales Return

**Test Case SR-D-001: Delete Sales Return**
- **Objective:** Verify sales return can be deleted
- **Test Steps:**
  1. Select sales return
  2. Click delete
  3. Confirm
- **Expected Results:**
  - Sales return removed
  - Original invoice NOT affected
  - TranH and TranD records deleted
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

## Purchase Return Testing

### 8. Purchase Return (tranTypeId: 10)

#### 8.1 CREATE - New Purchase Return

**Test Case PR-C-001: Create Purchase Return Against Existing Purchase Invoice**
- **Objective:** Verify purchase return creation
- **Pre-conditions:** Purchase invoice exists
- **Test Steps:**
  1. Navigate to Purchase Return screen
  2. Search and select original purchase invoice
  3. System populates supplier and items
  4. Select items to return with quantities
  5. Verify return amounts calculate
  6. GST reversed proportionally
  7. In Debit/Payment section (money received back):
     - Select account, e.g., "Cash"
     - Amount matches return total
  8. Click "Submit"
- **Expected Results:**
  - Purchase return saved with tranTypeId = 10
  - TranD credit entries for returned items (reverse of original debit)
  - TranD debit entry for received refund
  - ExtGstTranD with reversed GST
  - isInput flag appropriate
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PR-C-002: Create Purchase Return with GST Reversal**
- **Objective:** Verify input GST reversal on purchase return
- **Test Steps:**
  1. Original purchase: 10,000 + GST 1,800 = 11,800
  2. Return 50% (5,000 + 900 = 5,900)
  3. Verify GST reversal calculated correctly
  4. Click "Submit"
- **Expected Results:**
  - Input GST reduced by return amount
  - ExtGstTranD shows reversed GST
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case PR-C-003: Create Purchase Return Without Original Invoice**
- **Objective:** Verify standalone purchase return
- **Test Steps:**
  1. Create purchase return without invoice reference
  2. Enter supplier manually
  3. Add items
  4. Try to submit
- **Expected Results:**
  - Allowed OR validation error
  - Document behavior
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 8.2-8.4 READ, UPDATE, DELETE Purchase Return

*(Follow same patterns as Sales Return, adjusted for purchase context)*

---

## Debit Note Testing

### 9. Debit Note (tranTypeId: 7)

#### 9.1 CREATE - New Debit Note

**Test Case DN-C-001: Create Debit Note Against Supplier**
- **Objective:** Verify debit note creation (increasing supplier liability)
- **Test Steps:**
  1. Navigate to Debit Note screen
  2. Enter transaction date
  3. Select supplier
  4. Enter reason for debit note (e.g., "Quality issues, price adjustment")
  5. Enter amount: 2,000.00
  6. Debit Entry: Supplier account (increasing their payable)
  7. Credit Entry: Purchase adjustment account
  8. Click "Submit"
- **Expected Results:**
  - Debit note saved with tranTypeId = 7
  - TranD entries created correctly
  - Increases amount due from supplier or reduces payable
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case DN-C-002: Create Debit Note with GST**
- **Objective:** Verify GST handling in debit note
- **Test Steps:**
  1. Create debit note with GST
  2. Enter base amount and GST rate
  3. System calculates GST
  4. Click "Submit"
- **Expected Results:**
  - GST calculated and saved in ExtGstTranD
  - Appropriate isInput flag set
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 9.2-9.4 READ, UPDATE, DELETE Debit Note

*(Similar test patterns as other transactions)*

---

## Credit Note Testing

### 10. Credit Note (tranTypeId: 8)

#### 10.1 CREATE - New Credit Note

**Test Case CN-C-001: Create Credit Note Against Customer**
- **Objective:** Verify credit note creation (reducing customer receivable)
- **Test Steps:**
  1. Navigate to Credit Note screen
  2. Select customer
  3. Enter reason (e.g., "Discount allowed, defective goods")
  4. Enter amount: 1,500.00
  5. Debit Entry: Sales adjustment account
  6. Credit Entry: Customer account (reducing their receivable)
  7. Click "Submit"
- **Expected Results:**
  - Credit note saved with tranTypeId = 8
  - Reduces customer receivable balance
  - TranD entries correct
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case CN-C-002: Create Credit Note with GST**
- **Objective:** Verify GST reversal in credit note
- **Test Steps:**
  1. Create credit note
  2. Include GST reversal
  3. System calculates output GST reversal
  4. Click "Submit"
- **Expected Results:**
  - ExtGstTranD created with reversed GST
  - Output GST reduced
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

#### 10.2-10.4 READ, UPDATE, DELETE Credit Note

*(Similar test patterns)*

---

## Cross-Module Integration Testing

### 11. Integration Test Cases

**Test Case INT-001: Create Sales Invoice, Then Sales Return**
- **Objective:** Verify end-to-end flow from sale to return
- **Test Steps:**
  1. Create sales invoice: 10 items @ 1,000 = 10,000 + GST
  2. Save and note invoice ID
  3. Create sales return for 5 items
  4. Reference original invoice
  5. Verify return calculations
  6. Save sales return
  7. Check accounting entries:
     - Original sale created debit (cash) and credit (sales)
     - Return created debit (sales return) and credit (cash)
- **Expected Results:**
  - Both transactions saved correctly
  - GST handled properly in both
  - Net effect: 5 items sold with net GST on 5 items
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case INT-002: Create Purchase Invoice, Then Purchase Return**
- **Objective:** Verify purchase to return flow
- **Test Steps:**
  1. Create purchase invoice
  2. Save
  3. Create purchase return
  4. Reference original
  5. Verify accounting entries
- **Expected Results:**
  - Both saved correctly
  - Input GST reversed properly on return
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case INT-003: Payment Voucher Linked to Sales Invoice**
- **Objective:** Verify payment can be recorded separately from sale
- **Test Steps:**
  1. Create sales invoice on credit (no payment)
  2. Save
  3. Later, create payment voucher:
     - Debit: Bank
     - Credit: Customer account
     - Reference invoice number in remarks
  4. Save
- **Expected Results:**
  - Invoice shows as unpaid initially
  - Payment voucher records receipt
  - Customer balance updated
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case INT-004: Receipt Voucher Linked to Purchase Invoice**
- **Objective:** Verify payment to supplier can be recorded separately
- **Test Steps:**
  1. Create purchase on credit
  2. Later, create payment voucher to supplier
  3. Reference purchase invoice
- **Expected Results:**
  - Purchase on credit recorded
  - Payment updates supplier balance
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case INT-005: Journal Entry to Correct Previous Transaction**
- **Objective:** Verify journal entry can adjust errors
- **Test Steps:**
  1. Identify an error in previous transaction (e.g., wrong account used)
  2. Create journal entry to reverse and correct
  3. Save
- **Expected Results:**
  - Journal entry creates adjusting entries
  - Net effect corrects the error
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case INT-006: GST Reports Reflect All Transactions**
- **Objective:** Verify all GST transactions appear in GST reports
- **Test Steps:**
  1. Create sales invoice with GST (output)
  2. Create purchase invoice with GST (input)
  3. Create sales return (output reversal)
  4. Create purchase return (input reversal)
  5. Navigate to GST reports (GSTR-1, GSTR-3B equivalent)
  6. Verify all transactions appear
  7. Verify net GST liability calculated correctly
- **Expected Results:**
  - All GST transactions captured
  - Output GST = Sales GST - Sales Return GST
  - Input GST = Purchase GST - Purchase Return GST
  - Net GST payable calculated correctly
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case INT-007: Financial Year Transition**
- **Objective:** Verify transactions in different financial years
- **Test Steps:**
  1. Set financial year to FY 2023-24
  2. Create sales invoice
  3. Save
  4. Switch financial year to FY 2024-25
  5. Create another sales invoice
  6. Verify both invoices in respective years
  7. Verify reports filter by financial year
- **Expected Results:**
  - Transactions segregated by finYearId
  - Reports show data for selected year only
  - No cross-year data contamination
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case INT-008: Multi-Branch Transactions**
- **Objective:** Verify branch-wise transaction segregation
- **Test Steps:**
  1. Set branch to "Branch A"
  2. Create sales invoice
  3. Switch to "Branch B"
  4. Create sales invoice
  5. Verify transactions are branch-specific
  6. Check reports filter by branch
- **Expected Results:**
  - Transactions tagged with branchId
  - Reports show branch-specific data
  - No cross-branch data leakage
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

## Edge Cases & Validation Testing

### 12. Edge Case Test Scenarios

**Test Case EDGE-001: Maximum Decimal Precision**
- **Objective:** Verify system handles high decimal precision
- **Test Steps:**
  1. Create sales invoice
  2. Enter quantity: 10.12345
  3. Enter rate: 123.456789
  4. Verify amount calculation
  5. Apply GST
  6. Verify all calculations maintain precision
- **Expected Results:**
  - System handles precision correctly (typically 2 decimal places for currency)
  - Rounding is consistent
  - No precision loss in calculations
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-002: Very Large Amount Transaction**
- **Objective:** Verify handling of large amounts
- **Test Steps:**
  1. Create transaction with amount: 99,999,999.99
  2. Save
- **Expected Results:**
  - System accepts large amounts
  - No overflow errors
  - Database field size adequate
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-003: Very Small Amount Transaction**
- **Objective:** Verify handling of small amounts
- **Test Steps:**
  1. Create transaction with amount: 0.01
  2. Save
- **Expected Results:**
  - System accepts small amounts
  - No validation error (unless minimum amount enforced)
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-004: Maximum Line Items**
- **Objective:** Verify system handles many line items
- **Test Steps:**
  1. Create sales invoice
  2. Add 50-100 line items
  3. Save
- **Expected Results:**
  - System handles large number of line items
  - Performance remains acceptable
  - All items saved correctly
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-005: Special Characters in Remarks**
- **Objective:** Verify special character handling
- **Test Steps:**
  1. Create transaction
  2. Enter remarks with special characters: `@#$%^&*()[]{}|;:",.<>?`
  3. Save
- **Expected Results:**
  - Special characters saved correctly
  - No SQL injection or XSS issues
  - Characters display correctly in view mode
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-006: Unicode Characters in Fields**
- **Objective:** Verify Unicode support
- **Test Steps:**
  1. Create transaction
  2. Enter remarks in Hindi/Tamil/other languages: "यह एक परीक्षण है"
  3. Enter customer name with Unicode
  4. Save and retrieve
- **Expected Results:**
  - Unicode characters saved and displayed correctly
  - Database supports UTF-8 encoding
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-007: Backdated Transaction**
- **Objective:** Verify backdated transactions are allowed
- **Test Steps:**
  1. Create transaction with date 6 months ago
  2. Save
- **Expected Results:**
  - System allows backdated transactions OR
  - Validation error if backdating not allowed
  - Document behavior
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-008: Future Dated Transaction**
- **Objective:** Verify future date handling
- **Test Steps:**
  1. Create transaction with date 1 month in future
  2. Save
- **Expected Results:**
  - System allows future dates OR
  - Validation error
  - Document behavior
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-009: Transaction on Financial Year End Date**
- **Objective:** Verify transactions on year boundary
- **Test Steps:**
  1. Create transaction on last day of financial year (e.g., March 31)
  2. Create transaction on first day of next year (e.g., April 1)
  3. Verify both saved in correct years
- **Expected Results:**
  - Financial year transition handled correctly
  - Reports show transactions in correct years
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-010: Concurrent Edit Detection**
- **Objective:** Verify handling of concurrent edits
- **Test Steps:**
  1. User A opens voucher for editing
  2. User B opens same voucher
  3. User A saves changes
  4. User B tries to save changes
- **Expected Results:**
  - System detects concurrent edit OR
  - Last save wins (document behavior)
  - Ideally, user B sees warning about conflict
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-011: Network Interruption During Save**
- **Objective:** Verify graceful handling of network issues
- **Test Steps:**
  1. Create transaction
  2. Simulate network disconnection
  3. Click save
- **Expected Results:**
  - Error message about network failure
  - Data NOT saved (or saved locally for retry)
  - No partial/corrupt data in database
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-012: Session Timeout During Transaction Entry**
- **Objective:** Verify session handling
- **Test Steps:**
  1. Start creating transaction
  2. Wait for session timeout (if applicable)
  3. Try to save
- **Expected Results:**
  - Session expiration detected
  - User redirected to login OR
  - Data preserved and saved after re-authentication
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-013: Browser Refresh During Entry**
- **Objective:** Verify data preservation on refresh
- **Test Steps:**
  1. Start creating transaction, enter half the data
  2. Refresh browser
  3. Check if data is preserved
- **Expected Results:**
  - Redux state preserves form data OR
  - Data lost (document behavior)
  - If preserved, verify data loads correctly
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-014: Delete Line Item Then Re-add**
- **Objective:** Verify deletedIds handling
- **Test Steps:**
  1. Edit transaction with 3 line items
  2. Delete line item #2 (ID 100)
  3. Add a new line item
  4. Save
  5. Verify deletedIds includes 100
  6. Verify new item gets new ID
- **Expected Results:**
  - Deleted item ID tracked in deletedIds array
  - New item not reusing deleted ID
  - Database properly deletes and inserts
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-015: GST State Detection Edge Cases**
- **Objective:** Verify GSTIN state code extraction
- **Test Steps:**
  1. Create transaction with GSTIN: "29ABCDE1234F1Z5" (Karnataka)
  2. Verify system extracts state code "29"
  3. Test with GSTIN: "27XYZAB5678G2W9" (Maharashtra)
  4. Verify system extracts "27"
  5. Verify intrastate vs interstate detection
- **Expected Results:**
  - State code extracted correctly from GSTIN
  - Intrastate/interstate logic works correctly
  - CGST+SGST for same state, IGST for different state
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-016: Zero GST Rate Items**
- **Objective:** Verify handling of 0% GST rate
- **Test Steps:**
  1. Create sales invoice
  2. Add item with GST rate = 0%
  3. Verify no GST calculated
  4. Save
- **Expected Results:**
  - GST = 0 calculated and saved
  - ExtGstTranD record may or may not be created (document behavior)
  - No validation errors
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-017: Negative Amount Handling**
- **Objective:** Verify system prevents negative amounts
- **Test Steps:**
  1. Try to enter negative quantity: -10
  2. Try to enter negative rate: -100
  3. Try to save
- **Expected Results:**
  - Validation error prevents negative values OR
  - System allows (for adjustments/returns)
  - Document behavior
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-018: Duplicate Auto Reference Number**
- **Objective:** Verify uniqueness of auto reference numbers
- **Test Steps:**
  1. Create transaction, note auto reference number (e.g., "VOU/2024/0001")
  2. Create another transaction
  3. Verify auto reference increments (e.g., "VOU/2024/0002")
  4. Verify no duplicates in database
- **Expected Results:**
  - Auto reference numbers are unique
  - Sequential numbering maintained
  - No collisions even with concurrent transactions
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-019: Missing Required Fields**
- **Objective:** Verify validation of required fields
- **Test Steps:**
  1. Try to create transaction without customer/supplier
  2. Try to submit without line items
  3. Try to submit without payment account
- **Expected Results:**
  - Validation errors for each missing required field
  - Error messages are clear and user-friendly
  - Form highlights missing fields
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

**Test Case EDGE-020: Form Reset After Save**
- **Objective:** Verify form behavior after successful save
- **Test Steps:**
  1. Create and save transaction
  2. Verify form state after save
  3. Check if form is reset or retains data
- **Expected Results:**
  - Form resets to default values OR
  - Switches to view mode OR
  - Retains data for next entry (document behavior)
  - Redux state cleared appropriately
- **Status:** [ ] Pass [ ] Fail [ ] Blocked
- **Notes:**

---

## Test Results Template

### Test Execution Summary

**Test Cycle:** [Test Cycle Name]
**Test Date:** [Date Range]
**Tester Name:** [Name]
**Environment:** [Dev/Staging/Production]
**Database:** [Database Name]
**Application Version:** [Version Number]

| Module | Total Cases | Passed | Failed | Blocked | Pass % |
|--------|-------------|--------|--------|---------|--------|
| Payment Voucher | 12 | - | - | - | - |
| Receipt Voucher | 8 | - | - | - | - |
| Contra Voucher | 5 | - | - | - | - |
| Journal Voucher | 5 | - | - | - | - |
| Sales Invoice | 16 | - | - | - | - |
| Purchase Invoice | 12 | - | - | - | - |
| Sales Return | 10 | - | - | - | - |
| Purchase Return | 6 | - | - | - | - |
| Debit Note | 4 | - | - | - | - |
| Credit Note | 4 | - | - | - | - |
| Integration Tests | 8 | - | - | - | - |
| Edge Cases | 20 | - | - | - | - |
| **TOTAL** | **110** | **-** | **-** | **-** | **-** |

---

### Failed Test Cases Log

| Test Case ID | Module | Issue Description | Steps to Reproduce | Severity | Status | Assigned To |
|--------------|--------|-------------------|-------------------|----------|--------|-------------|
| P-C-004 | Payment | Debit/Credit validation not working | Step 1-4 in test case | High | Open | - |
| | | | | | | |
| | | | | | | |

---

### Blocked Test Cases Log

| Test Case ID | Module | Blocking Reason | Expected Resolution Date |
|--------------|--------|----------------|--------------------------|
| | | | |
| | | | |

---

### Defects Found

| Defect ID | Test Case | Severity | Description | Status |
|-----------|-----------|----------|-------------|--------|
| DEF-001 | S-C-009 | High | Amount mismatch validation allows save | Open |
| | | | | |

---

### Test Environment Issues

| Issue | Impact | Resolution |
|-------|--------|------------|
| | | |
| | | |

---

## Testing Notes and Observations

### General Observations
- [Document any patterns, trends, or recurring issues]
- [Note any areas requiring additional test coverage]
- [Performance observations]

### Positive Findings
- [Features working particularly well]
- [Good UX/UI elements]

### Areas for Improvement
- [Features needing refinement]
- [User experience issues]
- [Performance bottlenecks]

### Recommendations
- [Suggestions for enhancement]
- [Additional testing needed]
- [Automation opportunities]

---

## Approval Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Test Lead | | | |
| QA Manager | | | |
| Product Owner | | | |
| Development Lead | | | |

---

**Document Version:** 1.0
**Last Updated:** [Date]
**Next Review Date:** [Date]

---

## Appendix A: Test Data Reference

### Test Accounts
| Account Name | Account Type | Account ID | Notes |
|--------------|--------------|------------|-------|
| Cash | Asset | 1001 | For cash transactions |
| State Bank | Asset | 1002 | For bank transactions |
| Sales Income | Income | 2001 | Revenue account |
| Salary Expense | Expense | 3001 | Expense account |

### Test Contacts
| Contact Name | Contact Type | GSTIN | State | Notes |
|--------------|--------------|-------|-------|-------|
| Customer A | Customer | 29AAAA1111A1Z1 | Karnataka | Intrastate |
| Customer B | Customer | 27BBBB2222B2Y2 | Maharashtra | Interstate |
| Supplier C | Supplier | 29CCCC3333C3X3 | Karnataka | Intrastate |

### Test Products
| Product Name | HSN Code | GST Rate | Unit | Notes |
|--------------|----------|----------|------|-------|
| Product A | 1234 | 18% | Pcs | Standard product |
| Service B | 9987 | 18% | Service | Service item |
| Product C | 5678 | 12% | Kg | Lower GST rate |

---

## Appendix B: Database Schema Reference

### Key Tables
- **TranH**: Transaction header table (id, tranDate, tranTypeId, contactsId, autoRefNo, userRefNo, etc.)
- **TranD**: Transaction details/line items (id, tranHeaderId, accId, dc, amount, etc.)
- **ExtGstTranD**: GST details (id, tranDetailsId, rate, cgst, sgst, igst, isInput, etc.)
- **Contacts**: Customer/Supplier master data

---

## Appendix C: Glossary

| Term | Description |
|------|-------------|
| **TranH** | Transaction Header - master record for each transaction |
| **TranD** | Transaction Details - line items for each transaction |
| **ExtGstTranD** | Extended GST Transaction Details - GST breakup for each line |
| **dc** | Debit/Credit indicator ('D' or 'C') |
| **isInput** | Flag indicating input GST (true for purchases) or output GST (false for sales) |
| **contactsId** | Foreign key reference to Contacts table |
| **finYearId** | Financial year identifier |
| **branchId** | Branch identifier for multi-branch setup |
| **autoRefNo** | System-generated reference number |
| **userRefNo** | User-entered reference/invoice number |
| **CGST** | Central Goods and Services Tax (intrastate) |
| **SGST** | State Goods and Services Tax (intrastate) |
| **IGST** | Integrated Goods and Services Tax (interstate) |
| **GSTIN** | Goods and Services Tax Identification Number |

---

**END OF TESTING PLAN**
