# Plan: Why `extendedMethods` Stopped Working in Newer react-hook-form Versions

## The Problem

The pattern of spreading custom methods into `FormProvider` works in **v7.66.0** but breaks in **v7.71.x+**:

```tsx
// This worked in v7.66.0, breaks in v7.71.x+
const extendedMethods = { ...methods, resetAll, getVoucherDetailsOnId };
<FormProvider {...extendedMethods}>
```

---

## Step 1: Why It Broke

**Root Cause:** React Hook Form v7.71.x introduced stricter TypeScript typing and internal changes to `FormProvider`.

In newer versions, `FormProvider` likely does one of these:
1. **Filters props** - Only passes known `UseFormReturn` properties to context
2. **Uses explicit property list** - Destructures only standard form methods
3. **TypeScript strict mode** - Rejects extra properties at compile time

**Before (v7.66.0):**
```tsx
// FormProvider simply spread all props to context
<FormProviderContext.Provider value={props}>
```

**After (v7.71.x):**
```tsx
// FormProvider only passes known form methods
<FormProviderContext.Provider value={{
    register, handleSubmit, watch, reset, // ... only standard methods
}}>
```

This is technically a **breaking change** but the maintainers consider spreading custom methods an "undocumented hack" rather than supported behavior.

---

## Step 2: Workaround Options

### Option A: Pin to v7.66.0 (Current Solution)
```json
"react-hook-form": "7.66.0"
```
**Pros:** Quick, no code changes needed
**Cons:** Miss security updates and new features

---

### Option B: Create Separate React Context (Recommended)

**Step 1:** Create `src/features/accounts/vouchers/voucher-extended-methods-context.tsx`

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
import { VoucherExtendedMethodsProvider } from '../voucher-extended-methods-context';

// Change from:
<FormProvider {...extendedMethods}>

// To:
<VoucherExtendedMethodsProvider methods={{ resetAll, getVoucherDetailsOnId, populateFormFromId }}>
    <FormProvider {...methods}>
        {/* children */}
    </FormProvider>
</VoucherExtendedMethodsProvider>
```

**Step 3:** Update child components

```tsx
// Change from:
const { resetAll } = useFormContext() as any;

// To:
import { useVoucherExtendedMethods } from '../voucher-extended-methods-context';
const { resetAll } = useVoucherExtendedMethods();
```

**Pros:** Future-proof, proper React pattern, full TypeScript support
**Cons:** Requires code changes in multiple files

---

### Option C: Wrap FormProvider with Custom Provider

Create a wrapper that combines both contexts:

```tsx
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { createContext, useContext, ReactNode } from 'react';

type ExtendedMethods = {
    resetAll: () => void;
    getVoucherDetailsOnId: (id: number | undefined) => Promise<any>;
    populateFormFromId: (id: number) => Promise<void>;
};

const ExtendedMethodsContext = createContext<ExtendedMethods | null>(null);

export function ExtendedFormProvider({
    children,
    methods,
    extendedMethods
}: {
    children: ReactNode;
    methods: UseFormReturn<any>;
    extendedMethods: ExtendedMethods;
}) {
    return (
        <ExtendedMethodsContext.Provider value={extendedMethods}>
            <FormProvider {...methods}>
                {children}
            </FormProvider>
        </ExtendedMethodsContext.Provider>
    );
}

export function useExtendedMethods() {
    const ctx = useContext(ExtendedMethodsContext);
    if (!ctx) throw new Error('Must be used within ExtendedFormProvider');
    return ctx;
}
```

---

## Step 3: Recommended Approach

| Option | Effort | Future-Proof | Recommendation |
|--------|--------|--------------|----------------|
| A: Pin version | Low | No | Short-term only |
| B: Separate context | Medium | Yes | **Recommended** |
| C: Wrapper provider | Medium | Yes | Also good |

**Recommendation:** Use **Option B** for long-term maintainability. It's the proper React pattern and won't break with future updates.

---

## Files to Modify (Option B)

| File | Action |
|------|--------|
| `src/features/accounts/vouchers/voucher-extended-methods-context.tsx` | CREATE |
| `src/features/accounts/vouchers/all-vouchers/all-vouchers.tsx` | UPDATE |
| `src/features/accounts/vouchers/voucher-controls/voucher-status-bar.tsx` | UPDATE |
| `src/features/accounts/vouchers/voucher-controls/form-action-buttons.tsx` | UPDATE |
| Any other file using `resetAll` from `useFormContext` | UPDATE |
