# Implementation Plan: Context for Sales & Sales Return (Similar to Vouchers)

## Overview
Remove `extendedMethods` from `FormProvider` in both sales and sales-return, and implement separate context providers similar to `vouchers-context.tsx`.

---

## Step 1: Create `sales-context.tsx`
**File:** `src/features/accounts/purchase-sales/sales/sales-context.tsx`

Create a new context file with:
- `SalesContext` - the React context
- `useSalesContext` - custom hook to consume the context
- `useSalesContextOptional` - optional hook for shared components
- `SalesProvider` - provider component
- `SalesContextMethodsType` - type definition for methods

Methods to expose:
- `resetAll: () => void`
- `getDefaultSalesLineItem: () => SalesLineItemType`
- `getDefaultDebitAccount: () => TranDType`
- `getDebitCreditDifference: () => number`
- `populateFormOverId: (id: number) => Promise<void>`
- `getSalesEditDataOnId: (id: number | undefined) => Promise<SalePurchaseEditDataType | null>`

---

## Step 2: Create `sales-return-context.tsx`
**File:** `src/features/accounts/purchase-sales/sales-return/sales-return-context.tsx`

Create a new context file with:
- `SalesReturnContext` - the React context
- `useSalesReturnContext` - custom hook to consume the context
- `useSalesReturnContextOptional` - optional hook for shared components
- `SalesReturnProvider` - provider component
- `SalesReturnContextMethodsType` - type definition for methods

Methods to expose:
- `resetAll: () => void`
- `getDefaultSalesReturnLineItem: () => SalesReturnLineItemType`
- `getDefaultCreditAccount: () => TranDType`
- `populateFormOverId: (id: number) => Promise<void>`
- `getSalesReturnEditDataOnId: (id: number | undefined) => Promise<SalePurchaseEditDataType | null>`

---

## Step 3: Update `all-sales.tsx`
**File:** `src/features/accounts/purchase-sales/sales/all-sales.tsx`

Changes:
1. Import `SalesProvider` from the new context file
2. Remove `extendedMethods` variable (line 51)
3. Change `<FormProvider {...extendedMethods}>` to `<FormProvider {...methods}>`
4. Wrap with `<SalesProvider>` passing the methods object
5. Structure becomes:
   ```tsx
   <SalesProvider methods={{ resetAll, getDefaultSalesLineItem, getDefaultDebitAccount, getDebitCreditDifference, populateFormOverId, getSalesEditDataOnId }}>
       <FormProvider {...methods}>
           ...
       </FormProvider>
   </SalesProvider>
   ```

---

## Step 4: Update `all-sales-return.tsx`
**File:** `src/features/accounts/purchase-sales/sales-return/all-sales-return.tsx`

Changes:
1. Import `SalesReturnProvider` from the new context file
2. Remove `extendedMethods` variable (line 45)
3. Change `<FormProvider {...extendedMethods}>` to `<FormProvider {...methods}>`
4. Wrap with `<SalesReturnProvider>` passing the methods object
5. Structure becomes:
   ```tsx
   <SalesReturnProvider methods={{ resetAll, getDefaultSalesReturnLineItem, getDefaultCreditAccount, populateFormOverId, getSalesReturnEditDataOnId }}>
       <FormProvider {...methods}>
           ...
       </FormProvider>
   </SalesReturnProvider>
   ```

---

## Step 5: Update `items-and-services.tsx`
**File:** `src/features/accounts/purchase-sales/sales/items-and-services/items-and-services.tsx`

Changes:
1. Import `useSalesContext` from the context file
2. Replace line 41:
   - FROM: `const { getDefaultSalesLineItem }: any = useFormContext<SalesFormDataType>()`
   - TO: `const { getDefaultSalesLineItem } = useSalesContext()`

---

## Step 6: Update `status-bar.tsx`
**File:** `src/features/accounts/purchase-sales/sales/status-bar/status-bar.tsx`

Changes:
1. Import `useSalesContext` from the context file
2. Replace line 23:
   - FROM: `const { getDebitCreditDifference, populateFormOverId, resetAll }: any = useFormContext<SalesFormDataType>();`
   - TO: `const { getDebitCreditDifference, populateFormOverId, resetAll } = useSalesContext();`

---

## Step 7: Update `all-sales-view.tsx`
**File:** `src/features/accounts/purchase-sales/sales/sales-view/all-sales-view.tsx`

Changes:
1. Import `useSalesContext` from the context file
2. Replace line 46:
   - FROM: `const { populateFormOverId, getSalesEditDataOnId }:any = useFormContext<SalesFormDataType>();`
   - TO: `const { populateFormOverId, getSalesEditDataOnId } = useSalesContext();`

---

## Step 8: Update `payment-details.tsx`
**File:** `src/features/accounts/purchase-sales/sales/payment-details/payment-details.tsx`

Changes:
1. Import `useSalesContext` from the context file
2. Replace lines 32-33:
   - FROM:
     ```tsx
     const { getDefaultDebitAccount }: any = useFormContext<SalesFormDataType>();
     const { getDebitCreditDifference }: any = useFormContext<SalesFormDataType>();
     ```
   - TO:
     ```tsx
     const { getDefaultDebitAccount, getDebitCreditDifference } = useSalesContext();
     ```

---

## Step 9: Update `sales-return-items-and-services.tsx`
**File:** `src/features/accounts/purchase-sales/sales-return/sales-return-controls/sales-return-items-and-services.tsx`

Changes:
1. Import `useSalesReturnContext` from the context file
2. Replace line 41:
   - FROM: `const { getDefaultSalesReturnLineItem }: any = useFormContext<SalesReturnFormDataType>()`
   - TO: `const { getDefaultSalesReturnLineItem } = useSalesReturnContext()`

---

## Step 10: Update `sales-return-accounting-details.tsx`
**File:** `src/features/accounts/purchase-sales/sales-return/sales-return-controls/sales-return-accounting-details.tsx`

Changes:
1. Import `useSalesReturnContext` from the context file
2. Replace line 24:
   - FROM: `const { getDefaultCreditAccount }: any = useFormContext<SalesReturnFormDataType>();`
   - TO: `const { getDefaultCreditAccount } = useSalesReturnContext();`

---

## Step 11: Update `sales-return-header-section.tsx`
**File:** `src/features/accounts/purchase-sales/sales-return/sales-return-controls/sales-return-header-section.tsx`

Changes:
1. Import `useSalesReturnContext` from the context file
2. Replace line 33:
   - FROM: `const { getDefaultCreditAccount, resetAll } = useFormContext<SalesReturnFormDataType>() as any;`
   - TO: `const { getDefaultCreditAccount, resetAll } = useSalesReturnContext();`

---

## Step 12: Update `sales-return-status-bar.tsx`
**File:** `src/features/accounts/purchase-sales/sales-return/sales-return-controls/sales-return-status-bar.tsx`

Changes:
1. Import `useSalesReturnContext` from the context file
2. Replace line 22:
   - FROM: `const { populateFormOverId, resetAll }: any = useFormContext<SalesReturnFormDataType>();`
   - TO: `const { populateFormOverId, resetAll } = useSalesReturnContext();`

---

## Step 13: Update `all-sales-return-view.tsx`
**File:** `src/features/accounts/purchase-sales/sales-return/all-sales-return-view.tsx`

Changes:
1. Import `useSalesReturnContext` from the context file
2. Replace line 43:
   - FROM: `const { populateFormOverId, getSalesReturnEditDataOnId }:any = useFormContext<SalesReturnFormDataType>();`
   - TO: `const { populateFormOverId, getSalesReturnEditDataOnId } = useSalesReturnContext();`

---

## Files to Create
1. `src/features/accounts/purchase-sales/sales/sales-context.tsx`
2. `src/features/accounts/purchase-sales/sales-return/sales-return-context.tsx`

## Files to Modify
1. `src/features/accounts/purchase-sales/sales/all-sales.tsx`
2. `src/features/accounts/purchase-sales/sales/items-and-services/items-and-services.tsx`
3. `src/features/accounts/purchase-sales/sales/status-bar/status-bar.tsx`
4. `src/features/accounts/purchase-sales/sales/sales-view/all-sales-view.tsx`
5. `src/features/accounts/purchase-sales/sales/payment-details/payment-details.tsx`
6. `src/features/accounts/purchase-sales/sales-return/all-sales-return.tsx`
7. `src/features/accounts/purchase-sales/sales-return/sales-return-controls/sales-return-items-and-services.tsx`
8. `src/features/accounts/purchase-sales/sales-return/sales-return-controls/sales-return-accounting-details.tsx`
9. `src/features/accounts/purchase-sales/sales-return/sales-return-controls/sales-return-header-section.tsx`
10. `src/features/accounts/purchase-sales/sales-return/sales-return-controls/sales-return-status-bar.tsx`
11. `src/features/accounts/purchase-sales/sales-return/all-sales-return-view.tsx`

---

## Summary Table

| Step | File | Action |
|------|------|--------|
| 1 | `sales-context.tsx` | CREATE |
| 2 | `sales-return-context.tsx` | CREATE |
| 3 | `all-sales.tsx` | UPDATE - Remove extendedMethods, wrap with SalesProvider |
| 4 | `all-sales-return.tsx` | UPDATE - Remove extendedMethods, wrap with SalesReturnProvider |
| 5 | `items-and-services.tsx` | UPDATE - Use useSalesContext |
| 6 | `status-bar.tsx` | UPDATE - Use useSalesContext |
| 7 | `all-sales-view.tsx` | UPDATE - Use useSalesContext |
| 8 | `payment-details.tsx` | UPDATE - Use useSalesContext |
| 9 | `sales-return-items-and-services.tsx` | UPDATE - Use useSalesReturnContext |
| 10 | `sales-return-accounting-details.tsx` | UPDATE - Use useSalesReturnContext |
| 11 | `sales-return-header-section.tsx` | UPDATE - Use useSalesReturnContext |
| 12 | `sales-return-status-bar.tsx` | UPDATE - Use useSalesReturnContext |
| 13 | `all-sales-return-view.tsx` | UPDATE - Use useSalesReturnContext |
