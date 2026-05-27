# Plan: Optimize AccountPickerFlat with Global Accounts Cache

## Analysis Summary

### Current Problem
- **AccountPickerFlat** fetches accounts from DB independently on each new instance mount.
- Adding a new line-item row in a voucher (via `useFieldArray`) creates a new `AccountPickerFlat` instance → another DB call.
- Switching voucher types (Payment → Receipt → Payment) re-mounts the voucher component → re-fetches all account lists.
- **ContraVoucher** passes only `accClassNames` — no `accountOptions` — so each instance queries DB independently.
- **PaymentVoucher** and **ReceiptVoucher** pre-fetch one side (debit / credit) but still re-fetch on every parent mount.
- **JournalVoucher** fetches two lists (debit + credit) on every mount.

### Account Lists Needed (4 distinct groups)
| Key               | Classes                                                                              | Used By                              |
|-------------------|--------------------------------------------------------------------------------------|--------------------------------------|
| `cashBankAccounts`   | `cash, bank, ecash, card`                                                          | Payment-Credit, Receipt-Debit, Contra-both |
| `paymentDebitAccounts` | `debtor, creditor, dexp, iexp, other, purchase, loan, capital`                   | Payment-Debit                        |
| `receiptCreditAccounts` | `debtor, creditor, other, dexp, iexp, loan, capital, iincome, dincome`          | Receipt-Credit                       |
| `journalAccounts`    | `branch, capital, other, loan, iexp, dexp, dincome, iincome, creditor, debtor, sale, purchase` | Journal-Debit, Journal-Credit |

### When to Refresh
- **BU change** (detected by watching `buCode` directly): Clear cache → re-fetch all 4 lists in parallel.
- **Branch or FinYear change**: No refresh needed (accounts are not branch/finYear-filtered in these queries). `businessContextToggle` is NOT used as a trigger — it fires for all three context changes.
- **Manual Refresh button click**: Re-fetch only the one cache key bound to that `VoucherLineItemEntry` section. The `key` parameter to `refreshAccountsCache` is required — there is no "refresh all" path from a button click.

---

## Step 1: Extend `voucher-slice.ts` — Add Accounts Cache State

**File**: `src/features/accounts/vouchers/voucher-slice.ts`

- Add `accountsCache` to `VoucherInitialStateType`:
  ```ts
  accountsCache: {
    cashBankAccounts: AccountOptionType[];
    paymentDebitAccounts: AccountOptionType[];
    receiptCreditAccounts: AccountOptionType[];
    journalAccounts: AccountOptionType[];
    isLoaded: boolean;
  }
  ```
- Add reducer actions:
  - `setAccountsCache(state, action: PayloadAction<AccountsCacheType>)` — sets all 4 lists and `isLoaded: true`.
  - `clearAccountsCache(state)` — resets cache to empty arrays and `isLoaded: false`.
- Add Redux selectors:
  - `selectAccountsCache` — returns the entire cache.
  - `selectAccountsCacheIsLoaded` — returns `isLoaded`.

---

## Step 2: Create `useVoucherAccountsCache` Hook

**New file**: `src/features/accounts/vouchers/use-voucher-accounts-cache.ts`

- This hook encapsulates the parallel-fetch and Redux dispatch logic.
- Exports:
  - `loadAllAccountsCache()` — fires 4 parallel `Utils.doGenericQuery` calls using `Promise.all`, dispatches `setAccountsCache`.
  - `refreshCacheKey(key: AccountsCacheKeyType)` — re-fetches only the specified list, merges into Redux.
- Uses `useUtilsInfo` for `buCode`, `dbName`, `decodedDbParamsObject`.
- Uses `useDispatch` to dispatch to Redux.

---

## Step 3: Update `AllVouchers` — Initialize and Invalidate Cache

**File**: `src/features/accounts/vouchers/all-vouchers/all-vouchers.tsx`

- On component mount (`useEffect([], [])`): call `loadAllAccountsCache()` (from the hook above).
- **Do NOT use `businessContextToggle`** to trigger re-fetch — it fires for BU, Branch, AND FinYear changes. We only need to re-fetch when BU changes.
- Instead, **watch `buCode` directly** from Redux:
  ```ts
  const buCode = useSelector((state: RootStateType) => state.login.currentBusinessUnit?.buCode)
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    dispatch(clearAccountsCache())
    loadAllAccountsCache()
  }, [buCode])
  ```
  - `buCode` only changes on BU switch → cache invalidation is precise.
  - Branch or FinYear changes leave the cache untouched (accounts are not branch/finYear filtered).
- Remove the per-voucher-type fetch logic that currently duplicates this work.
- The `resetAll()` function does **not** clear the accounts cache (accounts don't change on form reset).

---

## Step 4: Extend `VouchersContext` — Expose Cache Refresh

**File**: `src/features/accounts/vouchers/vouchers-context.tsx`

- Add `refreshAccountsCache: (key: AccountsCacheKeyType) => Promise<void>` to `VouchersContextMethodsType`.
  - **`key` is required** — there is no "refresh all" path through this function.
  - This prevents any refresh button click from accidentally re-fetching all 4 lists.
  - "Refresh all" logic lives exclusively inside `loadAllAccountsCache()` in the hook, which is only ever called on mount and BU change — never from a UI button.
- Wire this in `AllVouchers` via `extendedMethods`.

---

## Step 5: Update `PaymentVoucher`

**File**: `src/features/accounts/vouchers/voucher-types/payment-voucher.tsx`

- Remove local state: `debitAccountOptions` / `setDebitAccountOptions`.
- Remove `loadDebitAccountOptions` function and its `useEffect`.
- Read from Redux: `const { cashBankAccounts, paymentDebitAccounts } = useSelector(selectAccountsCache)`.
- Pass `accountOptions={paymentDebitAccounts}` to the debit `VoucherLineItemEntry`.
- Pass `accountOptions={cashBankAccounts}` to the credit `VoucherLineItemEntry`.
- Pass `loadData={() => refreshAccountsCache('paymentDebitAccounts')}` to the debit entry.
- Pass `loadData={() => refreshAccountsCache('cashBankAccounts')}` to the credit entry.
- Use `refreshAccountsCache` from `useVouchersContext()`.

---

## Step 6: Update `ReceiptVoucher`

**File**: `src/features/accounts/vouchers/voucher-types/receipt-voucher.tsx`

- Remove local state: `creditAccountOptions` / `setCreditAccountOptions`.
- Remove `loadCreditAccountOptions` function and its `useEffect`.
- Read from Redux: `const { cashBankAccounts, receiptCreditAccounts } = useSelector(selectAccountsCache)`.
- Pass `accountOptions={cashBankAccounts}` to the debit `VoucherLineItemEntry`.
- Pass `accountOptions={receiptCreditAccounts}` to the credit `VoucherLineItemEntry`.
- Pass appropriate `loadData` callbacks from `refreshAccountsCache`.

---

## Step 7: Update `JournalVoucher`

**File**: `src/features/accounts/vouchers/voucher-types/journal-voucher.tsx`

- Remove local state: `debitAccountOptions`, `creditAccountOptions`.
- Remove `loadDebitAccountOptions`, `loadCreditAccountOptions` functions and `useEffect`.
- Read from Redux: `const { journalAccounts } = useSelector(selectAccountsCache)`.
- Pass `accountOptions={journalAccounts}` to both debit and credit `VoucherLineItemEntry`.
- Pass `loadData={() => refreshAccountsCache('journalAccounts')}` to both entries.

---

## Step 8: Update `ContraVoucher`

**File**: `src/features/accounts/vouchers/voucher-types/contra-voucher.tsx`

- Read from Redux: `const { cashBankAccounts } = useSelector(selectAccountsCache)`.
- Pass `accountOptions={cashBankAccounts}` to both debit and credit `VoucherLineItemEntry`.
- Remove `accClassNames` prop from both entries (it's no longer needed since data comes from cache).
- Pass `loadData={() => refreshAccountsCache('cashBankAccounts')}` to both entries.

---

## Step 9: Update `VoucherLineItemEntry`

**File**: `src/features/accounts/vouchers/voucher-controls/voucher-line-item-entry.tsx`

- No structural changes needed — already accepts `accountOptions` and `loadData` props.
- Pass both through to every `AccountPickerFlat` instance as-is (already done via `fields.map`).
- `loadData` is **section-scoped**: the same callback is shared by all row instances within one `VoucherLineItemEntry` (e.g., all debit rows in Payment). Clicking refresh on any one row re-fetches only that section's cache key. All rows in the section then update together via the Redux selector — which is correct because they all display the same list.
- There is no mechanism to refresh a single row's picker independently of its sibling rows; that is intentional — they all share the same underlying data.

---

## Step 10: Update `AccountPickerFlat`

**File**: `src/controls/redux-components/account-picker-flat/account-picker-flat.tsx`

> **Scope constraint**: `AccountPickerFlat` is used by 6 non-voucher callers (purchases, purchase-returns, sales, sales-returns, debit-notes, credit-notes). Those callers pass `accClassNames`, `instance`, `sqlId`, `toSelectFirstOption` and rely entirely on `loadLocalData()`. None of those props/functions can be removed from the component — only the `businessContextToggle` watcher is removed.

**Remove** the `businessContextToggle` watcher and its supporting state:
  - Delete the `useEffect` on `[businessContextToggle]` (lines 65–73).
  - Delete the `isInitialMount` ref — it was only used inside that watcher.
  - Delete the `businessContextToggle` selector line.
  - Remove the `businessContextToggleSelectorFn` import from `layouts-slice`.
  - BU change is now handled by `AllVouchers` watching `buCode` directly → cache is cleared and re-fetched → `accountOptions` prop updates → `useDeepCompareEffect` syncs local `options`.

**Keep everything else unchanged:**
  - `loadData` — still needed; it is the refresh button's only path to call `refreshAccountsCache(key)`.
  - `loadLocalData` — **must stay**; non-voucher callers (purchases, sales, etc.) pass only `accClassNames`/`sqlId` and rely on `loadLocalData` to fetch their data. Removing it would break those features.
  - `instance` — **must stay**; used both by non-voucher callers and internally by `fetchAccountBalance` via `isAllBranches` → `selectCompSwitchStateFn(state, instance)`.
  - `accClassNames`, `sqlId`, `toSelectFirstOption` — **must stay**; actively used by non-voucher callers.
  - `useDeepCompareEffect` — no change; handles `accountOptions` updates from cache automatically.

---

## Step 11: Dead Code in Voucher Files

### `VoucherLineItemEntry` (`voucher-controls/voucher-line-item-entry.tsx`)

**Remove `accClassNames` prop from `VoucherLineItemEntryType`:**
  - After the redesign, every voucher type passes `accountOptions` from the cache instead.  No voucher type will pass `accClassNames` to `VoucherLineItemEntry` anymore.
  - The prop still exists on `AccountPickerFlat` for non-voucher callers — removing it only from `VoucherLineItemEntry`'s own type and JSX is safe.
  - Remove the `AccClassName` import from `VoucherLineItemEntry` (it was only needed for the `accClassNames?: AccClassName[]` type annotation).

**Remove `tranDetailsId` from `VoucherLineItemEntryType`:**
  - Defined in the type but **never destructured** and never referenced in the component body.
  - Dead type prop — remove it.

### `PaymentVoucher` (`voucher-types/payment-voucher.tsx`)

Remove after redesign (all replaced by Redux cache reads):
  - `useState<AccountOptionType[]>` for `debitAccountOptions`
  - `loadDebitAccountOptions` async function
  - `useEffect(() => loadDebitAccountOptions(), [])` 
  - `useUtilsInfo()` call (was only used for `buCode`/`dbName`/`decodedDbParamsObject` inside the removed function)
  - Imports: `Utils`, `SqlIdsMap`, `AccountOptionType`, `useUtilsInfo`

Add:
  - `useSelector` + `selectAccountsCache` (Redux cache read)
  - `useVouchersContext` (for `refreshAccountsCache`)

### `ReceiptVoucher` (`voucher-types/receipt-voucher.tsx`)

Remove after redesign:
  - `useState<AccountOptionType[]>` for `creditAccountOptions`
  - `loadCreditAccountOptions` async function and its `useEffect`
  - `useUtilsInfo()` call
  - Imports: `Utils`, `SqlIdsMap`, `AccountOptionType`, `useUtilsInfo`

Add: same as `PaymentVoucher`.

### `JournalVoucher` (`voucher-types/journal-voucher.tsx`)

Remove after redesign:
  - Both `useState<AccountOptionType[]>` (debit and credit options)
  - Both fetch functions (`loadDebitAccountOptions`, `loadCreditAccountOptions`) and the `useEffect`
  - `useUtilsInfo()` call
  - Imports: `Utils`, `SqlIdsMap`, `AccountOptionType`, `useUtilsInfo`

Add: same as `PaymentVoucher`.

---

## Step 12: Add TypeScript Types

**File**: `src/features/accounts/vouchers/voucher-slice.ts` (or a shared types file)

```ts
export type AccountsCacheKeyType = 'cashBankAccounts' | 'paymentDebitAccounts' | 'receiptCreditAccounts' | 'journalAccounts';

export type AccountsCacheType = {
  cashBankAccounts: AccountOptionType[];
  paymentDebitAccounts: AccountOptionType[];
  receiptCreditAccounts: AccountOptionType[];
  journalAccounts: AccountOptionType[];
  isLoaded: boolean;
};
```

---

## Summary of Data Flow After Changes

```
AllVouchers mounts
  └─ useEffect → loadAllAccountsCache()
        └─ Promise.all([fetch cashBank, fetch paymentDebit, fetch receiptCredit, fetch journal])
              └─ dispatch(setAccountsCache({...}))  →  Redux store

VoucherType switches to Payment
  └─ PaymentVoucher reads accountOptions from Redux selector
        └─ Passes to VoucherLineItemEntry → AccountPickerFlat (no DB call)

User adds a new line item row
  └─ New AccountPickerFlat instance created
        └─ accountOptions already populated from parent state (no DB call)

BU changes → buCode selector fires in AllVouchers
  └─ dispatch(clearAccountsCache()) → loadAllAccountsCache()   [only on BU change, not branch/finYear]
        └─ All voucher pickers refresh automatically via Redux selector update

Refresh button clicked on any AccountPickerFlat in Payment-Debit section (example)
  └─ handleOnClickRefresh() → loadData()
        └─ refreshAccountsCache('paymentDebitAccounts')         [key is required, never "refresh all"]
              └─ Re-fetches only paymentDebitAccounts → dispatch(setAccountsCache({...merged...}))
                    └─ All rows in that section update; other sections (cashBank, journal, etc.) untouched
```

## Files to Create / Modify

| File | Action | Key changes |
|------|---------|-------------|
| `src/features/accounts/vouchers/voucher-slice.ts` | Modify | Add `accountsCache` state, `setAccountsCache` / `clearAccountsCache` actions, selectors, types |
| `src/features/accounts/vouchers/use-voucher-accounts-cache.ts` | **Create new** | `loadAllAccountsCache()` + `refreshCacheKey(key)` hook |
| `src/features/accounts/vouchers/vouchers-context.tsx` | Modify | Add `refreshAccountsCache(key: AccountsCacheKeyType)` — key is required |
| `src/features/accounts/vouchers/all-vouchers/all-vouchers.tsx` | Modify | Init cache on mount; watch `buCode` (not `businessContextToggle`) for invalidation |
| `src/features/accounts/vouchers/voucher-types/payment-voucher.tsx` | Modify | Remove local state + fetch; read from Redux cache; remove `useUtilsInfo`, `Utils`, `SqlIdsMap`, `AccountOptionType` |
| `src/features/accounts/vouchers/voucher-types/receipt-voucher.tsx` | Modify | Same cleanup as PaymentVoucher |
| `src/features/accounts/vouchers/voucher-types/journal-voucher.tsx` | Modify | Same cleanup as PaymentVoucher |
| `src/features/accounts/vouchers/voucher-types/contra-voucher.tsx` | Modify | Add Redux cache read; pass `accountOptions` instead of `accClassNames` |
| `src/features/accounts/vouchers/voucher-controls/voucher-line-item-entry.tsx` | Modify | Remove `accClassNames` prop + `AccClassName` import + `tranDetailsId` dead type prop |
| `src/controls/redux-components/account-picker-flat/account-picker-flat.tsx` | Modify | Remove only `businessContextToggle` watcher + `isInitialMount` ref + `businessContextToggleSelectorFn` import. All other props/functions stay (non-voucher callers depend on them) |
