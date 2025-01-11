import { useForm } from "react-hook-form";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { Messages } from "../../../../utils/messages";
import { useValidators } from "../../../../utils/validators-hook";
import { ReactElement } from "react";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";

export function AccountsNewGroupModal() {
    const { checkNoSpaceOrSpecialChar, checkNoSpecialChar } = useValidators()
    const { context, buCode } = useUtilsInfo()

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
        // setValue,
    } = useForm<FormValues>({ mode: 'onTouched', criteriaMode: 'all' });

    const accountType = watch('accountType');

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-auto min-w-72">

            {/* Account Code */}
            <label className="flex flex-col font-medium text-primary-400">
                <span className="font-bold">Account Code <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. cashAccount"
                    autoComplete="off"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:italic"
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
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:italic"
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
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                    {...register('accountType', { required: Messages.errRequired })}>
                    <option value="">--- select ---</option>
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
                    {...register('accountClass', { required: Messages.errRequired })}
                    disabled={!accountType}>
                    {getAccountClassOptions()}
                </select>
                {errors.accountClass && <WidgetFormErrorMessage errorMessage={errors.accountClass.message} />}
            </label>

            {/* Submit Button */}
            <div className="mt-4 flex justify-start">
                <WidgetButtonSubmitFullWidth label="Save" disabled={isSubmitting} />
            </div>
        </form>
    );

    function getAccountClassOptions(): ReactElement[] {
        if (!accountType) {
            return ([])
        }
        const classMapping: ClassMappingType[] = classMappings[accountType]
        const classMappingOptions = classMapping.map((item: ClassMappingType) => (
            <option key={item.id} value={item.id}>{item.accClass}</option>
        ))
        return (classMappingOptions)
    }

    async function onSubmit(data: FormValues) {
        const xData: any = {}
        xData.accCode = data.accountCode
        xData.accName = data.accountName
        xData.accType = data.accountType
        xData.accLeaf = 'N'
        xData.isPrimary = false
        xData.classId = data.accountClass
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: DatabaseTablesMap.AccM,
                xData: xData
            })
            const loadData = context.CompSyncFusionTreeGrid[DataInstancesMap.accountsMaster].loadData
            if (loadData) {
                await loadData()
            }
            Utils.showSaveMessage();
            Utils.showHideModalDialogA({
                isOpen: false
            })
        } catch (e: any) {
            console.log(e)
        }
    }
}

type FormValues = {
    accountCode: string;
    accountName: string;
    accountType: string;
    accountClass: string;
};

type ClassMappingType = {
    id: number | ''
    accClass: string
}

const classMappings: {
    [key: string]: ClassMappingType[]
} = {
    A: [
        { "id": "", "accClass": "--- select ---" },
        { "id": 13, "accClass": "bank" },
        { "id": 1, "accClass": "branch" },
        { "id": 15, "accClass": "card" },
        { "id": 14, "accClass": "cash" },
        { "id": 11, "accClass": "creditor" },
        { "id": 12, "accClass": "debtor" },
        { "id": 16, "accClass": "ecash" },
        { "id": 4, "accClass": "loan" },
        { "id": 3, "accClass": "other" },
    ],
    E: [
        { "id": "", "accClass": "--- select ---" },
        { "id": 7, "accClass": "dexp" },
        { "id": 5, "accClass": "iexp" },
        { "id": 3, "accClass": "other" },
        { "id": 6, "accClass": "purchase" },
    ],
    I: [
        { "id": "", "accClass": "--- select ---" },
        { "id": 8, "accClass": "dincome" },
        { "id": 9, "accClass": "iincome" },
        { "id": 3, "accClass": "other" },
        { "id": 10, "accClass": "sale" }
    ],
    L: [
        { "id": "", "accClass": "--- select ---" },
        { "id": 13, "accClass": "bank" },
        { "id": 1, "accClass": "branch" },
        { "id": 2, "accClass": "capital" },
        { "id": 15, "accClass": "card" },
        { "id": 11, "accClass": "creditor" },
        { "id": 12, "accClass": "debtor" },
        { "id": 16, "accClass": "ecash" },
        { "id": 4, "accClass": "loan" },
        { "id": 3, "accClass": "other" },
    ],
}