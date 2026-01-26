# I want to use custom methods in child form using FormProvider of react-hook-form
- In all-vouchers.tsx
    - I defined a method resetAll()
    - I write this code for extendedMethods to accommodate resetAll() in extendedMethods
    - I wrap the return form of AllVouchers in FormProvider as:
        <FormProvider {...extendedMethods}>
    - The intention is to provide the resetAll() method to all children of AllVouchers
    - onDebug Is see that resetAll() method exists in extendedMethods
- In voucher-status-bar.tsx
    - This is a child component of AllVouchers
    - I want to use resetAll() method over here, already provided in parent form
    - When I do const { resetAll } = useFormContext() as any; I get resetAll as undefined always
    - Find out where I am wrong
    - This code was working earlier
    - Stopped working when I used new libs in package.json
    - I restored old libs in package.json but no benefit