# I want to use custom methods in child form using FormProvider of react-hook-form
- Consider plan.md. Option A worked fine
- There is a mechanism in react-hook-form:
    const methods = useForm<VoucherFormDataType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: savedFormData ?? getDefaultVoucherFormValues(),
        context: { resetAll: resetAll}
    });
    <FormProvider {...methods}>
- By using context can I pass custom methods to children. Otherwise what is the use of context in rect hook form?

    