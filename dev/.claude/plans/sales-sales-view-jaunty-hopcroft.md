# Plan: Customer Details GSTIN priority in edit mode — Contacts → BusinessContacts → ExtGstTranD

## Context
When editing a sale invoice, the "GSTIN No" field in Customer Details must be populated using
this priority:
1. **Contacts** (`billTo.gstin`)
2. **BusinessContacts** (`businessContacts.gstin`, i.e. `ExtBusinessContactsAccM`)
3. **ExtGstTranD** (`extGstTranD.gstin`)
…falling back to `null` only if all three are empty.

Current behavior gap: `populateFormOverId` seeds `gstin` from `extGstTranD || contactDisplay`
(wrong priority), and the `contactsData` effect in `customer-details.tsx` then overrides it —
using `billTo.gstin` if present, else **nulling** the field (dropping BusinessContacts and
ExtGstTranD). We need the effect to honor the full 3-level chain on edit-load, while keeping
the existing "take the selected contact's GSTIN" behavior when the user actively changes the
customer.

## Save flow (already confirmed — NO change)
- On save, form `gstin` is written to **`ExtGstTranD.gstin`** (`all-sales-submit-hook.ts:88`),
  updating the existing `extGstTranD.id` row. Contacts table is not touched.
- User confirmed: overwrite is intended — the displayed (priority-resolved) GSTIN is persisted
  to `ExtGstTranD` on save. No submit-hook change.

## Changes

### Step 1 — `customer-details.tsx` (the `contactsData` effect, ~lines 48-66)
Distinguish edit-load population of the saved contact from a live customer change, then apply
the priority chain. `getValues` is already destructured from `useFormContext`.

- Compute: `const editData = getValues('salesEditData')`
- `const isEditLoadContact = Boolean(editData?.billTo) && contactsData.id === editData?.billTo?.id`
- GSTIN value:
  - if `isEditLoadContact`:
    `contactsData.gstin || editData?.businessContacts?.gstin || editData?.extGstTranD?.gstin || null`
    (Contacts → BusinessContacts → ExtGstTranD)
  - else (live selection / new sale): `contactsData.gstin || null` (unchanged behavior)
- `setValue('gstin', gstinValue, { shouldDirty: true })` and
  `setValue('hasCustomerGstin', Boolean(gstinValue), { shouldDirty: true })`
- Keep the `contactDisplayData` set + `trigger` calls as-is.

Notes: for a new sale `salesEditData` is empty → `isEditLoadContact` false → behavior unchanged.
The stale-fallback only applies to the originally-loaded contact (same id), which is acceptable.

### Step 2 — `all-sales.tsx` `populateFormOverId` (~lines 396-397)
Seed the field with the same priority so the no-`billTo` path (where the effect does not run,
because `contactsData` is null) is also correct. `billTo` and `businessContacts` are already in
scope (lines 351-352).
- `gstin: billTo?.gstin || businessContacts?.gstin || extGsTranD?.gstin || null`
- `hasCustomerGstin: Boolean(billTo?.gstin || businessContacts?.gstin || extGsTranD?.gstin)`

## Verification
- Edit invoice, contact (Contacts) has GSTIN → shows Contacts GSTIN.
- Edit invoice, Contacts blank but BusinessContacts has GSTIN → shows BusinessContacts GSTIN.
- Edit invoice, Contacts & BusinessContacts blank but ExtGstTranD has GSTIN → shows ExtGstTranD.
- Edit invoice, all blank → field blank, toggle off.
- New sale: select a customer → field shows that customer's GSTIN (unchanged behavior).
- Save in edit cases → `ExtGstTranD.gstin` persists the displayed value; Contacts row unchanged.
