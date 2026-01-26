# Plan: Fix useFormContext not returning custom methods (resetAll)

## Root Cause Found

**Version Mismatch:**
- `package.json` declares: `"react-hook-form": "^7.66.1"`
- Actually installed: `7.71.1`

The `^` prefix allows npm to install newer minor versions. Even when you restored the old `package.json`, the `package-lock.json` still had the newer version cached.

**Breaking Change:** `react-hook-form` version 7.71.x likely changed how `FormProvider` handles spread properties, no longer passing custom methods through the context.

---

## Solution Options

### Option A: Downgrade to exact working version (Quick Fix)

**Step 1:** Pin the exact version in `package.json`
```json
"react-hook-form": "7.66.0"
```
(Remove the `^` to prevent auto-updates)

**Step 2:** Clean install
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

**Step 3:** Test if resetAll works again

---

### Option B: Create separate context for custom methods (Proper Fix)

This is the recommended long-term solution that won't break with future updates.

**Step 1:** Create `src/features/accounts/vouchers/voucher-context.tsx`

```tsx
import { createContext, useContext, ReactNode } from 'react';

export type VoucherExtendedMethodsType = {
    resetAll: () => void;
    getVoucherDetailsOnId: (id: number | undefined) => Promise<any>;
    populateFormFromId: (id: number) => Promise<void>;
};

const VoucherExtendedMethodsContext = createContext<VoucherExtendedMethodsType | null>(null);

export function VoucherExtendedMethodsProvider({
    children,
    methods
}: {
    children: ReactNode;
    methods: VoucherExtendedMethodsType;
}) {
    return (
        <VoucherExtendedMethodsContext.Provider value={methods}>
            {children}
        </VoucherExtendedMethodsContext.Provider>
    );
}

export function useVoucherExtendedMethods(): VoucherExtendedMethodsType {
    const context = useContext(VoucherExtendedMethodsContext);
    if (!context) {
        throw new Error('useVoucherExtendedMethods must be used within VoucherExtendedMethodsProvider');
    }
    return context;
}
```

**Step 2:** Update `all-vouchers.tsx`

```tsx
import { VoucherExtendedMethodsProvider } from '../voucher-context';

// In the return statement:
return (
    <VoucherExtendedMethodsProvider methods={{ resetAll, getVoucherDetailsOnId, populateFormFromId }}>
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmitVoucher)} className="flex flex-col">
                <CompAccountsContainer className="relative">
                    <AllVouchersContent instance={instance} />
                </CompAccountsContainer>
            </form>
        </FormProvider>
    </VoucherExtendedMethodsProvider>
)
```

**Step 3:** Update `voucher-status-bar.tsx`

```tsx
import { useVoucherExtendedMethods } from '../voucher-context';

// Replace:
const { resetAll } = useFormContext() as any;
const frm = useFormContext() as any;

// With:
const { resetAll } = useVoucherExtendedMethods();
```

**Step 4:** Update `form-action-buttons.tsx`

```tsx
import { useVoucherExtendedMethods } from '../voucher-context';

// Replace:
const { resetAll }: any = useFormContext();

// With:
const { resetAll } = useVoucherExtendedMethods();
```

**Step 5:** Update all other components using custom methods from useFormContext
- Search for `resetAll.*useFormContext` pattern
- Replace with `useVoucherExtendedMethods()` hook

---

## Recommended Approach

1. **Try Option A first** - Quick to test if downgrade fixes the issue
2. **If confirmed working, implement Option B** - Future-proof solution

---

## Files to Modify (Option B)

| File | Action |
|------|--------|
| `src/features/accounts/vouchers/voucher-context.tsx` | CREATE - New context file |
| `src/features/accounts/vouchers/all-vouchers/all-vouchers.tsx` | UPDATE - Wrap with new provider |
| `src/features/accounts/vouchers/voucher-controls/voucher-status-bar.tsx` | UPDATE - Use new hook |
| `src/features/accounts/vouchers/voucher-controls/form-action-buttons.tsx` | UPDATE - Use new hook |

---

## Testing

- [ ] Click voucher type buttons (Payment/Receipt/Contra/Journal) - form should reset
- [ ] Click Reset button - form should reset
- [ ] No console errors
- [ ] TypeScript compiles without errors
