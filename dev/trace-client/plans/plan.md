# Plan: Customer Details GSTIN priority in edit mode — ExtGstTranD → Contacts → BusinessContacts

## Context
When editing a sale invoice, the "GSTIN No" field in Customer Details must be populated using
this priority:
1. **ExtGstTranD** (`extGstTranD.gstin`)
2. **Contacts** (`billTo.gstin`)
3. **BusinessContacts** (`businessContacts.gstin` / `ExtBusinessContactsAccM`)
…falling back to `null` only if all three are empty.

Current behavior gap: `populateFormOverId` seeds `gstin` from `extGstTranD || contactDisplay`,
but the `contactsData` effect in `customer-details.tsx` then overrides it — using `billTo.gstin`
if present, else **nulling** the field. This both ignores the intended ExtGstTranD-first order
and drops the BusinessContacts fallback. Both the seed and the effect must honor the full
3-level chain on edit-load, while keeping the existing "take the selected contact's GSTIN"
behavior when the user actively changes the customer.

## Save flow (NO change)
Save always writes the form `gstin` to **`ExtGstTranD.gstin`** (`all-sales-submit-hook.ts:88`),
updating the existing `extGstTranD.id` row. Contacts table is untouched. Same as today.

## Step 1 — `customer-details.tsx` (the `contactsData` effect)
Distinguish edit-load of the saved contact from a live customer change, then apply the chain:
- `const editData = getValues('salesEditData')`
- `const isEditLoadContact = Boolean(editData?.billTo) && contactsData.id === editData?.billTo?.id`
- if `isEditLoadContact`: `editData?.extGstTranD?.gstin || contactsData.gstin || editData?.businessContacts?.gstin || null`
- else (live selection / new sale): `contactsData.gstin || null` (unchanged)
- `setValue('gstin', value)` + `setValue('hasCustomerGstin', Boolean(value))`

## Step 2 — `all-sales.tsx` `populateFormOverId`
- `gstin: extGsTranD?.gstin || billTo?.gstin || businessContacts?.gstin || null`
- `hasCustomerGstin: Boolean(extGsTranD?.gstin || billTo?.gstin || businessContacts?.gstin)`

## Verification
- ExtGstTranD has GSTIN → shows ExtGstTranD GSTIN (even if Contacts differ).
- ExtGstTranD blank, Contacts has GSTIN → shows Contacts GSTIN.
- ExtGstTranD & Contacts blank, BusinessContacts has GSTIN → shows BusinessContacts.
- All three blank → field blank, toggle off.
- New sale: selecting a customer shows that customer's GSTIN (unchanged).
- Save → `ExtGstTranD.gstin` persists the displayed value; Contacts row unchanged.
