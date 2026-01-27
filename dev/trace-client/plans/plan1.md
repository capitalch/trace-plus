# Implementation Plan: Context for Stock Journal & Branch Transfer (Similar to Vouchers)

## Overview
Remove `extendedMethods` from `FormProvider` in both stock-journal and branch-transfer, and implement separate context providers similar to `vouchers-context.tsx`.

---

## Step 1: Create `stock-journal-context.tsx`
**File:** `src/features/accounts/inventory/stock-journal/stock-journal-context.tsx`

Create a new context file with:
- `StockJournalContext` - the React context
- `useStockJournalContext` - custom hook to consume the context
- `useStockJournalContextOptional` - optional hook for shared components
- `StockJournalProvider` - provider component
- `StockJournalContextMethodsType` - type definition for methods

Methods to expose:
- `xReset: () => void`

---

## Step 2: Create `branch-transfer-context.tsx`
**File:** `src/features/accounts/inventory/branch-transfer/branch-transfer-context.tsx`

Create a new context file with:
- `BranchTransferContext` - the React context
- `useBranchTransferContext` - custom hook to consume the context
- `useBranchTransferContextOptional` - optional hook for shared components
- `BranchTransferProvider` - provider component
- `BranchTransferContextMethodsType` - type definition for methods

Methods to expose:
- `xReset: () => void`

---

## Step 3: Update `stock-journal-main.tsx`
**File:** `src/features/accounts/inventory/stock-journal/stock-journal-main/stock-journal-main.tsx`

Changes:
1. Import `StockJournalProvider` from the new context file
2. Remove `extendedMethods` variable (line 35)
3. Change `<FormProvider {...extendedMethods}>` to `<FormProvider {...methods}>`
4. Wrap with `<StockJournalProvider>` passing the methods object
5. Structure becomes:
   ```tsx
   <StockJournalProvider methods={{ xReset }}>
       <FormProvider {...methods}>
           ...
       </FormProvider>
   </StockJournalProvider>
   ```

---

## Step 4: Update `products-branch-transfer-main.tsx`
**File:** `src/features/accounts/inventory/branch-transfer/products-branch-transfer-main/products-branch-transfer-main.tsx`

Changes:
1. Import `BranchTransferProvider` from the new context file
2. Remove `extendedMethods` variable (line 57)
3. Change `<FormProvider {...extendedMethods}>` to `<FormProvider {...methods}>`
4. Wrap with `<BranchTransferProvider>` passing the methods object
5. Structure becomes:
   ```tsx
   <BranchTransferProvider methods={{ xReset }}>
       <FormProvider {...methods}>
           ...
       </FormProvider>
   </BranchTransferProvider>
   ```

---

## Step 5: Update `stock-journal-header.tsx`
**File:** `src/features/accounts/inventory/stock-journal/stock-journal-main/stock-journal-header.tsx`

Changes:
1. Import `useStockJournalContext` from the context file
2. Replace line 24:
   - FROM: `const { xReset }: any = useFormContext();`
   - TO: `const { xReset } = useStockJournalContext();`

---

## Step 6: Update `products-branch-transfer-header.tsx`
**File:** `src/features/accounts/inventory/branch-transfer/products-branch-transfer-main/products-branch-transfer-header.tsx`

Changes:
1. Import `useBranchTransferContext` from the context file
2. Replace line 38:
   - FROM: `const { xReset }: any = useFormContext();`
   - TO: `const { xReset } = useBranchTransferContext();`

---

## Files to Create
1. `src/features/accounts/inventory/stock-journal/stock-journal-context.tsx`
2. `src/features/accounts/inventory/branch-transfer/branch-transfer-context.tsx`

## Files to Modify
1. `src/features/accounts/inventory/stock-journal/stock-journal-main/stock-journal-main.tsx`
2. `src/features/accounts/inventory/stock-journal/stock-journal-main/stock-journal-header.tsx`
3. `src/features/accounts/inventory/branch-transfer/products-branch-transfer-main/products-branch-transfer-main.tsx`
4. `src/features/accounts/inventory/branch-transfer/products-branch-transfer-main/products-branch-transfer-header.tsx`

---

## Summary Table

| Step | File | Action |
|------|------|--------|
| 1 | `stock-journal-context.tsx` | CREATE |
| 2 | `branch-transfer-context.tsx` | CREATE |
| 3 | `stock-journal-main.tsx` | UPDATE - Remove extendedMethods, wrap with StockJournalProvider |
| 4 | `products-branch-transfer-main.tsx` | UPDATE - Remove extendedMethods, wrap with BranchTransferProvider |
| 5 | `stock-journal-header.tsx` | UPDATE - Use useStockJournalContext |
| 6 | `products-branch-transfer-header.tsx` | UPDATE - Use useBranchTransferContext |
