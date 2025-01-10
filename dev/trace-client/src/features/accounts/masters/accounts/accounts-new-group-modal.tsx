import { useForm } from "react-hook-form";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { useEffect } from "react";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { Messages } from "../../../../utils/messages";
import { useValidators } from "../../../../utils/validators-hook";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";

export function AccountsNewGroupModal() {
    const { checkNoSpaceOrSpecialChar, checkNoSpecialChar, checkPinCode } = useValidators()
    const { buCode, context, dbName, decodedDbParamsObject, } = useUtilsInfo()
    const accountTypeOptions = [
        { label: 'Asset', value: 'A' },
        { label: 'Liability', value: 'L' },
        { label: 'Expense', value: 'E' },
        { label: 'Income', value: 'I' },
    ];
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm<FormValues>({ mode: 'onTouched', criteriaMode: 'all' });

    const accountType = watch('accountType');

    useEffect(() => {
        setValue('accountClass', ''); // Reset accountClass when accountType changes
    }, [accountType, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-auto min-w-72">

            {/* Account Code */}
            <label className="flex flex-col font-medium text-primary-400">
                <span className="font-bold">Account Code <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="cashAccount"
                    autoComplete="off"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                    {...register('accountCode', {
                        required: Messages.errRequired,
                        validate: {
                            validateAccountCode: checkNoSpaceOrSpecialChar
                        }
                    })}
                />
                {errors.accountCode && <WidgetFormErrorMessage errorMessage={errors.accountCode.message} />}
            </label>

            {/* Account Name */}
            <label className="flex flex-col font-medium text-primary-400">
                <span className="font-bold">Account Name <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. Cash Account"
                    autoComplete="off"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                    {...register('accountName', {
                        required: Messages.errRequired,
                        validate: {
                            validateAccountName: checkNoSpecialChar
                        }
                    })}
                />
                {errors.accountName && <WidgetFormErrorMessage errorMessage={errors.accountName.message} />}
            </label>

            {/* Account Type */}
            <label className="flex flex-col font-medium text-primary-400">
                <span className="font-bold">Account Type <WidgetAstrix /></span>
                <select
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 text-sm"
                    {...register('accountType', { required: Messages.errRequired })}>
                    <option value="" className="text-sm">Select Account Type</option>
                    {accountTypeOptions.map((type) => (
                        <option className="bg-white text-primary-700 hover:bg-primary-100 hover:text-primary-600" key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
                {errors.accountType && <WidgetFormErrorMessage errorMessage={errors.accountType.message} />}
            </label>

            {/* Account Class */}
            <label className="flex flex-col font-medium text-primary-400">
                <span className="font-bold">Account Class <WidgetAstrix /></span>
                <select
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 text-gray-700"
                    {...register('accountClass', { required: 'Account Class is required' })}
                    disabled={!accountType}
                >
                    {/* <option value="">Select Account Class</option>
                    {accountType &&
                        accountClassOptionsMap[accountType]?.map((cls) => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))} */}
                </select>
                {errors.accountClass && <WidgetFormErrorMessage errorMessage={errors.accountClass.message} />}
            </label>

            {/* Submit Button */}
            <div className="mt-4 flex justify-start">
                <WidgetButtonSubmitFullWidth label="Save" disabled={isSubmitting} />
            </div>
        </form>
    );

    function onSubmit(data: FormValues) {
        console.log('Submitted Data:', data);
    }
}

type FormValues = {
    accountCode: string;
    accountName: string;
    accountType: string;
    accountClass: string;
};