# Plan: Optimize Voucher Performance

## Context
With ~1500 accounts, VoucherLineItemEntry becomes very slow. Adding new rows sometimes triggers
multiple DB queries. Root causes span both client (cascading re-renders, unvirtualized dropdown,
unmemoized callbacks) and server (no search-side filtering on accounts, potential missing indexes).

---

## Step 1 — Fix critical cascade re-render from unmemoized `onChangeAmount`

**File:** `src/features/accounts/vouchers/voucher-types/receipt-voucher.tsx`

`onChangeCreditAmount` is a plain function re-created every render. `VoucherLineItemEntry` has:
```tsx
// voucher-line-item-entry.tsx line 57-59
useEffect(() => {
    onChangeAmount?.(0, 0);
}, [onChangeAmount])
```
Every parent re-render → new `onChangeCreditAmount` reference → this effect fires → recalculates
total → `setCreditTotal` → parent re-renders → infinite cascade.

**Fix:**
- Wrap `onChangeCreditAmount` in `useCallback(fn, [watch])` in `receipt-voucher.tsx`
- Wrap `onChangeDebitAmount` similarly in `payment-voucher.tsx` and `journal-voucher.tsx`
- Also wrap `loadCreditAccountOptions` / `loadDebitAccountOptions` in `useCallback` (they are
  passed as `loadData` prop, but also prevent stale-closure issues)
- Change the `useEffect([onChangeAmount])` in `voucher-line-item-entry.tsx` to use a ref so it
  fires only on mount, not when the prop reference changes:
  ```tsx
  const onChangeAmountRef = useRef(onChangeAmount);
  useEffect(() => { onChangeAmountRef.current = onChangeAmount; });
  useEffect(() => { onChangeAmountRef.current?.(0, 0); }, []); // fires only on mount
  ```

**Impact:** Eliminates the render cascade — the single biggest cause of slowness.

---

## Step 2 — Restore `useDeepCompareEffect` for `accountOptions` in AccountPickerFlat

**File:** `src/controls/redux-components/account-picker-flat/account-picker-flat.tsx`

Lines 49-55 have `useDeepCompareEffect` commented out and replaced with a plain `useEffect`.
The `accClassNames` array prop is created inline in JSX (`['cash', 'bank', ...]`) so its reference
changes on every parent render. This makes the `useEffect` fire repeatedly, causing unnecessary
`setOptions` calls and, when `accountOptions` is empty, unnecessary `loadLocalData()` DB queries.

**Fix:**
- Re-enable `useDeepCompareEffect` (package `use-deep-compare-effect` is already imported at line 11)
- Remove the plain `useEffect` block (lines 57-63) and uncomment lines 49-55

```tsx
// Restore this:
useDeepCompareEffect(() => {
    if (accountOptions && accountOptions.length > 0) {
        setOptions(accountOptions)
    } else {
        loadLocalData()
    }
}, [accountOptions, accClassNames, sqlId])
```

**Impact:** Eliminates spurious `setOptions` calls and duplicate `loadLocalData()` DB queries on
every render where `accClassNames` is an inline array literal.

---

## Step 3 — Extract each line-item row into a memoized component

**File:** `src/features/accounts/vouchers/voucher-controls/voucher-line-item-entry.tsx`

Currently the `fields.map()` (lines 147-360) renders all rows as inline JSX. Any form field
change anywhere re-renders **every** row because `watch()` calls at the top of the parent
subscribe the whole component to all field changes.

**Fix:**
- Extract the `motion.div` block for each row into a new `VoucherLineItemRow` component
- Wrap it in `React.memo`
- Move `watch(`${lineItemEntryName}.${index}.accId`)`, `watch(... .amount)`, and
  `watch(... .isGstApplicableForEntry`)` calls **inside** the row component (they will then only
  subscribe and re-render that specific row)
- Pass `register`, `setValue`, `clearErrors` as props; pass callbacks wrapped in `useCallback` in
  the parent

Key `useCallback` wrappers to add in `VoucherLineItemEntry`:
```tsx
const handleInsert = useCallback((index) => insert(index + 1, newRowDefaults), [insert])
const handleRemove = useCallback((index, field) => { ... remove(index) }, [remove, getValues, setValue])
const handleClear  = useCallback((index) => { ... multiple setValue calls ... }, [setValue, amount])
const handleGstToggle = useCallback((index) => { ... }, [watch, setValue, lineItemEntryName])
```

**Impact:** Only the changed row re-renders on field update. With 10 rows this is a 10× reduction
in render work; with 20 rows it is 20×.

---

## Step 4 — Virtualize the AccountPickerFlat dropdown for large lists

**File:** `src/controls/redux-components/account-picker-flat/account-picker-flat.tsx`

The custom `MenuList` renders all 1500 account `<div>` nodes into the DOM on every dropdown open.
This causes layout/paint jank. `react-window` is not yet in the project.

**Fix:**
- Install `react-window` and `@types/react-window`:
  ```bash
  npm install react-window @types/react-window
  ```
- Replace the custom `MenuList` with a `FixedSizeList` from `react-window` rendering only the
  visible slice (typically ~10 items):
  ```tsx
  import { FixedSizeList } from 'react-window';

  MenuList: ({ children, maxHeight }) => {
      const items = Array.isArray(children) ? children : [children];
      const itemHeight = 52; // matches current option padding
      return (
          <FixedSizeList
              height={Math.min(maxHeight, items.length * itemHeight)}
              itemCount={items.length}
              itemSize={itemHeight}
              width="100%"
          >
              {({ index, style }) => <div style={style}>{items[index]}</div>}
          </FixedSizeList>
      );
  }
  ```
- Keep the item-count header div above the list

**Impact:** Dropdown open/scroll with 1500 accounts becomes instant — only ~7 DOM nodes instead of
1500. This is the dominant rendering cost for large account lists.

---

## Step 5 — Fix total-amount calculation in VoucherLineItemEntry

**File:** `src/features/accounts/vouchers/voucher-controls/voucher-line-item-entry.tsx`  
Lines 369-374 call `watch()` inside a `.reduce()` inside JSX render, re-running on every render:
```tsx
fields.reduce((sum, _, i) => {
    const val = watch(`${lineItemEntryName}.${i}.amount`);
    ...
}, new Decimal(0))
```

**Fix:**
- Use `useWatch({ control, name: lineItemEntryName })` at the top of the component which returns
  the full array. This replaces the per-field `watch` calls in the summary footer:
  ```tsx
  const allEntries = useWatch({ control, name: lineItemEntryName });
  // Then in JSX:
  const total = allEntries.reduce((sum, e) => sum.plus(new Decimal(e?.amount ?? 0)), new Decimal(0))
  ```
- `useWatch` subscribes only this component to amount changes, and since we already extracted rows
  into `VoucherLineItemRow` (Step 3), the row components don't re-render for this.

**Impact:** Eliminates N `watch()` subscriptions for the footer; a single `useWatch` handles it.

---

## Step 6 — Fix `gstApplicableStates` useMemo dependency on `watch`

**File:** `src/features/accounts/vouchers/voucher-controls/voucher-line-item-entry.tsx` lines 53-55

```tsx
const gstApplicableStates = useMemo(() => {
    return fields.map((_, i) => watch(`${lineItemEntryName}.${i}.isGstApplicableForEntry`)).join(',');
}, [fields, lineItemEntryName, watch]);
```

`watch` from `useFormContext` has a stable reference — this is fine. But after Step 3 (row
extraction), the GST toggle effect that uses `gstApplicableStates` (lines 68-88) should move
**inside** the row component since it only needs to clear GST for its own row. This removes the
need for this cross-row memoization entirely.

**Fix:**
- Move the GST-clearing `useEffect` into `VoucherLineItemRow` and use `useWatch` on the single
  field `${lineItemEntryName}.${index}.isGstApplicableForEntry` as the dependency.

---

## Step 7 — Add search-side debounce to AccountPickerFlat

**File:** `src/controls/redux-components/account-picker-flat/account-picker-flat.tsx`

When the user types in the react-select search box, the built-in `filterOption` runs synchronously
on all 1500 options per keystroke. This blocks the main thread.

**Fix:**
- Pass a custom `filterOption` to `<Select>` that debounces or batches filtering, or use
  `react-select`'s `onInputChange` with a debounced local state to control which options are
  displayed:
  ```tsx
  const [inputValue, setInputValue] = useState('');
  const debouncedInput = useDebounce(inputValue, 150); // simple custom hook or lodash
  const filteredOptions = useMemo(
      () => options.filter(o => o.accName.toLowerCase().includes(debouncedInput.toLowerCase())),
      [options, debouncedInput]
  );
  // Pass filteredOptions to <Select options={filteredOptions} ... />
  // and filterOption={() => true} to disable built-in filtering
  ```

**Impact:** Typing in the search box no longer blocks the thread for 1500 accounts.

---

## Step 8 — Server: Ensure critical database indexes exist

**File:** `trace-server/app/graphql/db/sql_accounts.py`

The `get_account_balance` query (line 153) scans `TranH` + `TranD` filtered by `accId`,
`finYearId`, and `branchId`. The `get_voucher_details_on_id` query has a correlated subquery on
`ExtGstTranD.tranDetailsId` per detail row.

**Add migration / verify indexes:**
```sql
-- For account balance (accId + finYearId + branchId scan on TranD)
CREATE INDEX IF NOT EXISTS idx_trand_accid_finyear 
    ON "TranD"("accId", "finYearId");

-- For GST detail lookup (correlated subquery in get_voucher_details_on_id)
CREATE INDEX IF NOT EXISTS idx_extgsttrand_trandetailsid 
    ON "ExtGstTranD"("tranDetailsId");

-- Composite for all-vouchers main query
CREATE INDEX IF NOT EXISTS idx_tranh_finyear_branch_type_date 
    ON "TranH"("finYearId", "branchId", "tranTypeId", "tranDate" DESC);
```

Check whether these indexes already exist with:
```sql
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename IN ('TranD', 'TranH', 'ExtGstTranD');
```

---

## Step 9 — Server: Add optional LIMIT/server-side filter to account query

**File:** `trace-server/app/graphql/db/sql_accounts.py` (line 2290)

With 1500 accounts the whole list is fetched to the client on every voucher mount. Consider adding
an optional search prefix so the dropdown can fetch on-demand when the user types:

```sql
-- Add optional parameter: %(searchTerm)s (NULL = fetch all for initial load)
AND (%(searchTerm)s IS NULL OR a."accName" ILIKE %(searchTerm)s || '%')
ORDER BY ... 
LIMIT COALESCE(%(limit)s, 2000)
```

This is an optional improvement. The Step 4 virtualization fix handles the UI side. If initial
load latency is still unacceptable, implement lazy/search-driven fetch on the client with a
`loadOptions` async select (react-select's async variant).

---

## Step 10 — Remove `console.log(res)` from production code

**File:** `src/controls/redux-components/account-picker-flat/account-picker-flat.tsx` line 207

```tsx
console.log(res)  // remove this
```

With 1500 accounts this logs a large array on every mount — this is minor but contributes to dev
tools overhead.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/features/accounts/vouchers/voucher-types/receipt-voucher.tsx` | `useCallback` on `onChangeCreditAmount` and `loadCreditAccountOptions` |
| `src/features/accounts/vouchers/voucher-types/payment-voucher.tsx` | `useCallback` on amount handler and load function |
| `src/features/accounts/vouchers/voucher-types/journal-voucher.tsx` | `useCallback` on both handlers and load functions |
| `src/features/accounts/vouchers/voucher-controls/voucher-line-item-entry.tsx` | Extract row to memoized component; fix `onChangeAmount` ref pattern; use `useWatch` for total |
| `src/controls/redux-components/account-picker-flat/account-picker-flat.tsx` | Restore `useDeepCompareEffect`; add `react-window` virtualization; add debounced search; remove console.log |
| `trace-server/app/graphql/db/sql_accounts.py` | Verify/add DB indexes (Steps 8–9) |

---

## Verification

1. Open a Receipt/Payment voucher with ~1500 accounts.
2. Open the account dropdown — should open instantly, scroll smoothly (Step 4).
3. Type a few characters in the search box — no UI freeze (Step 7).
4. Add 5+ line item rows — each row appends without triggering DB queries (Steps 2, 3).
5. Change an amount in one row — only that row re-renders (verify with React DevTools Profiler).
6. Toggle GST checkbox on one row — only that row's panel updates (Step 6).
7. Confirm total updates correctly without render cascade (Steps 1, 5).
8. Check browser Network tab — account list loads once on mount; subsequent row additions make no
   additional account-list requests.
9. Run `EXPLAIN ANALYZE` on `get_account_balance` with a busy account to confirm index usage
   (Step 8).
