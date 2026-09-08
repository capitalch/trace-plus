# Findings: Sales → Payment Details → Payment Methods → "Payment Account" dropdown

Scope of exploration: the `Payment Account` picker in the Payment Methods rows of the Sales form,
with focus on the **Auto Subledger (Bill Sale)** radio option.

## Key files

| Layer | File |
|---|---|
| UI section | `src/features/accounts/purchase-sales/sales/payment-details/payment-details.tsx` |
| Picker control | `src/controls/redux-components/account-picker-flat/account-picker-flat.tsx` |
| sqlId constants | `src/app/maps/sql-ids-map.ts` |
| Form defaults / edit load | `src/features/accounts/purchase-sales/sales/all-sales.tsx` |
| Server SQL | `dev/trace-server/app/graphql/db/sql_accounts.py` |
| Auto-subledger flag UI | `src/features/accounts/masters/accounts/accounts-master.tsx` |

---

## 1. Logic that populates the Payment Account dropdown (row 0 vs. rows 1..n)

Every row renders the same control:

```tsx
// payment-details.tsx:354-371
<AccountPickerFlat
    accClassNames={getAccClassNames(salesType, index)}
    sqlId={getSqlId(index)}
    ... />
```

So the option list is decided by exactly **two** inputs: `accClassNames` and `sqlId`.

### 1a. `getAccClassNames(salesType, index)` — payment-details.tsx:170-184

```
index !== 0                      -> ['cash','bank','card','ecash']      (always, regardless of salesType)
index === 0 && salesType 'retail'      -> ['cash','bank','card','ecash']
index === 0 && salesType 'bill'        -> [null]
index === 0 && salesType 'institution' -> ['debtor','creditor']
```

`[null]` is important: in `account-picker-flat.tsx:187` the value is sent as
`accClassNames?.join(',') || null`, and `[null].join(',')` is `""` (falsy) → **`null` is sent**,
which in every SQL means "no class filter at all" (`(TABLE "accClassNames") IS NULL OR ...`).
So for **Bill Sale row 0 the account class is NOT filtered** — only the auto-subledger flag filters.

### 1b. `getSqlId(index)` — payment-details.tsx:186-202

```
salesType 'bill'  && index === 0 && debitAccounts.0.id EXISTS (edit mode)
      -> getAutoSubledgerAccountsWithLedgersAndSubledgers
salesType 'bill'  && index === 0 && no id (new entry)
      -> getAutoSubledgerAccountsOnClass
salesType 'institution' (ANY index, incl. rows > 0)
      -> getLeafAccountsOnClassWithoutAutoSubledgers
everything else (retail any row; bill rows > 0)
      -> null  ==> picker falls back to its default: SqlIdsMap.getLeafSubledgerAccountsOnClass
                   (account-picker-flat.tsx:185)
```

Note: for `institution`, rows > 0 keep the institution sqlId but with the
cash/bank/card/ecash class list — the two functions are independent of each other.

### 1c. Re-fetch trigger

`account-picker-flat.tsx:50-56` (`useDeepCompareEffect` on `[accountOptions, accClassNames, sqlId]`)
re-runs `loadLocalData()` whenever the class list or sqlId changes — i.e. changing the radio button
re-queries row 0 only (rows > 0 keep their cash/bank/card/ecash list).

### 1d. Radio switch side-effects — payment-details.tsx:154-168

`handleSalesTypeChange` clears **row 0 only** (`isParentAutoSubledger`, `accClass`, `accName`,
`accId` → null) and, when leaving `institution`, clears `contactsData` / `contactDisplayData` / `gstin`.
Rows 1..n are untouched.

### 1e. Row lifecycle

- `getDefaultDebitAccount()` (`all-sales.tsx:243-257`) creates a blank row (`accId: null`, `dc: 'D'`).
- A row is auto-appended when `fields.length === 0` (payment-details.tsx:56-60), by **Add**
  (`handleAddPaymentMethod`) and after **Clear** (`handleClearPaymentMethods`).
- Row 0 has no remove button (payment-details.tsx:432-444).
- Single-row case: amount is auto-set to `totalInvoiceAmount` (payment-details.tsx:83-98).

### 1f. Edit (existing voucher) path

`get_sale_purchase_details_on_id` (`sql_accounts.py:2760+`, cte2) returns each `TranD` debit row with
`accClass`, `accName`, `accCode` and `x."isAutoSubledger" AS "isParentAutoSubledger"`
(joined on `m."parentId" = x."accId"` — i.e. "is my **parent** an auto-subledger ledger").
`all-sales.tsx:375-381` and `payment-details.tsx:62-71` then derive `salesType`:
`isParentAutoSubledger` → `bill`; else `accClass` debtor/creditor → `institution`; else `retail`.

---

## 2. What accounts are actually visible in the dropdown

### A. Bill Sale, row 0, NEW entry → `get_auto_subledger_accounts_on_class` (sql_accounts.py:2272)
- `AccM.accLeaf = 'L'` (ledger accounts having subledgers) **AND**
- `ExtMiscAccM.isAutoSubledger = TRUE` **AND**
- class filter skipped (accClassNames is null, see 1a).
- Returns `id, accName, accParent, isDisabled(false)`, ordered by `accName`.
- ⚠ Does **not** filter `isHidden` — hidden ledgers still appear here.
- ⚠ Returns no `isSubledger` / `accLeaf` fields, so the 🔹 subledger marker in `CustomOption` never shows.
- In practice this is a **debtor-only list**, because the auto-subledger switch in Accounts master is
  only rendered for `accLeaf === 'L' && accClass === 'debtor'` (`accounts-master.tsx:298`).

### B. Bill Sale, row 0, EDIT mode → `get_auto_subledger_accounts_with_ledgers_and_subledgers` (:2212)
- Same auto-subledger ledgers (`accLeaf='L'`, `isAutoSubledger`), plus **their child subledgers**.
- Ordered ledger-first then its children (`root_id, child_rank, accName`).
- Ledger rows come back with `isDisabled = true` (header-only, not selectable); children selectable.
- Filters `NOT isHidden`.

### C. Bill Sale, rows 1..n (and Retail, any row) → default `get_leaf_subledger_accounts_on_class` (:2308)
- `accClassNames = 'cash,bank,card,ecash'`.
- `AccM.accLeaf IN ('S','L','Y')`, joined to its parent.
- `isSubledger = (accLeaf = 'S')`, `isDisabled = (accLeaf = 'L')` — ledger headers shown but greyed.
- ⚠ No `isHidden` filter here either.

### D. Institution (any row) → `get_leaf_accounts_on_class_without_auto_subledgers` (:2166)
- classes `debtor,creditor` on row 0, `cash,bank,card,ecash` on rows > 0.
- `accLeaf IN ('Y','S','L')` then final `WHERE accLeaf IN ('Y','S')`.
- Excludes any account that **is** an auto-subledger ledger or whose **parent** is one.
- Filters `NOT isHidden`.

### E. Sale Account picker (separate control, payment-details.tsx:283)
- `accClassNames={['sale']}`, default sqlId, `toSelectFirstOption`.

---

## 3. How to add extra accounts (e.g. the `other` class) to the dropdown

The `other` class already exists (`AccClassM` id 3, seeded in `accounts.sql:1422`) and
`AccClassName` in `account-picker-flat.tsx:298-314` already includes `'other'` — no type change needed.

Effort depends on **which** rows need it.

### Case 1 — Retail row 0 and/or all rows > 0 (easiest, client-only)

Only `getAccClassNames` needs editing.

- **Step 1:** In `payment-details.tsx:170-184`, add `'other'` to the relevant arrays, e.g.
  `['cash','bank','card','ecash','other']` for `index !== 0`, and/or for `case 'retail'`,
  and/or the `default` branch.
- **Step 2:** Nothing else. `get_leaf_subledger_accounts_on_class` (the default sqlId) already accepts
  any class list, so no server change and no sqlId change.
- **Files changed:** `payment-details.tsx` only.

### Case 2 — Institution rows

- **Step 1:** Add `'other'` in the `case 'institution'` branch of `getAccClassNames`.
- **Step 2:** No server change — `get_leaf_accounts_on_class_without_auto_subledgers` is class-driven.
  Be aware it still excludes auto-subledger ledgers and their children.
- **Files changed:** `payment-details.tsx` only.

### Case 3 — Bill Sale row 0 (the auto-subledger dropdown) — needs a SERVER change

This is the non-trivial one: `get_auto_subledger_accounts_on_class` hard-filters
`x."isAutoSubledger"`, so passing `['other']` as the class list would return **nothing** (there are no
auto-subledger `other` ledgers). Class filtering alone cannot widen this list.

Two viable approaches:

**Approach 3A — new/extended server SQL (recommended, keeps one query)**

- **Step 1:** `dev/trace-server/app/graphql/db/sql_accounts.py` — add a new attribute, e.g.
  `get_auto_subledger_accounts_with_extra_classes`, that `UNION ALL`s:
  (a) the existing auto-subledger ledger set, and
  (b) leaf/subledger accounts (`accLeaf IN ('Y','S')`) whose `accClass = ANY(extraClassNames)`,
  with matching output columns (`id, accName, accParent, isDisabled`) and `NOT "isHidden"`.
  Add the same for the edit-mode variant (`..._with_ledgers_and_subledgers`) if row 0 in edit mode
  must show them too. (The attribute name **is** the sqlId — `graphql_helper.py` resolves it via
  `getattr(SqlAccounts, sqlId)`.)
- **Step 2:** `src/app/maps/sql-ids-map.ts` — register the new key(s) near lines 69-70.
- **Step 3:** `src/controls/redux-components/account-picker-flat/account-picker-flat.tsx` —
  `loadLocalData()` (line 178-195) currently sends only `{ accClassNames }`. Add an optional
  `extraSqlArgs?: Record<string, any>` prop merged into `sqlArgs`, and add it to
  `AccountPickerFlatType` (line 273-287) and to the `useDeepCompareEffect` dep array (line 56) so a
  change re-fetches. Optional prop ⇒ all existing callers (purchases, credit/debit notes,
  sales-return, vouchers) are unaffected.
- **Step 4:** `payment-details.tsx` — in `getSqlId(index)` return the new sqlId for
  `salesType === 'bill' && index === 0`, and pass `extraSqlArgs={{ extraClassNames: 'other' }}`.
- **Files changed:** `sql_accounts.py`, `sql-ids-map.ts`, `account-picker-flat.tsx`, `payment-details.tsx`.

**Approach 3B — client-side merge (no server change)**

- **Step 1:** In `payment-details.tsx`, fetch the `other`-class accounts separately with
  `Utils.doGenericQuery` + `SqlIdsMap.getLeafSubledgerAccountsOnClass` and `accClassNames: 'other'`
  (same pattern as `fetchAndPopulateContact`, payment-details.tsx:456).
- **Step 2:** Merge that result with the auto-subledger list and pass the combined array to
  `AccountPickerFlat` via the existing **`accountOptions`** prop — when `accountOptions !== undefined`
  the picker uses it directly and skips its own query (`account-picker-flat.tsx:50-56`).
  Note this makes row 0 fully parent-owned: `accClassNames`/`sqlId` are then ignored for that row.
- **Files changed:** `payment-details.tsx` only, but the query/merge/caching logic moves into the form.

### Ancillary change to consider

If `other` accounts should be flagged as auto-subledger from the master screen, the visibility guard
in `accounts-master.tsx:298` (`accLeaf === 'L' && accClass === 'debtor'`) must be widened —
otherwise no non-debtor ledger can ever get `isAutoSubledger = true`.

---

## Observations worth flagging (not implemented)

1. `get_auto_subledger_accounts_on_class` and `get_leaf_subledger_accounts_on_class` lack the
   `NOT "isHidden"` filter that the other two queries have — hidden accounts can still be picked.
2. `get_auto_subledger_accounts_on_class` returns no `isSubledger`, so the 🔹 badge in `CustomOption`
   (`account-picker-flat.tsx:247`) is dead for the Bill Sale new-entry list.
3. `console.log(res)` is left in `loadLocalData` (`account-picker-flat.tsx:190`).
4. `getSqlId` applies the institution sqlId to rows > 0 as well, while `getAccClassNames` switches those
   rows to cash/bank/card/ecash — intentional-looking but easy to misread.
