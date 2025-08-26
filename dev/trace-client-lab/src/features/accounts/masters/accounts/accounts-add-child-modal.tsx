import { useForm } from "react-hook-form";
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { useValidators } from "../../../../utils/validators-hook"
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { Messages } from "../../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { ReactElement, useEffect } from "react";
import { XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../utils/utils";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki";
import { IbukiMessages } from "../../../../utils/ibukiMessages";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text";
import _ from "lodash";

export function AccountsAddChildModal({ accId, accLeaf, accType, classId }: AccountsAddChildModalType) {
    const { checkNoSpaceOrSpecialChar, checkNoSpecialChar } = useValidators()
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo()
    const {
        register,
        clearErrors,
        handleSubmit,
        setError,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<FormValuesType>({ mode: 'onTouched', criteriaMode: 'all' });

    useEffect(() => {
        const subs1 = ibukiDebounceFilterOn(IbukiMessages['DEBOUNCE-ACC-CODE'], 1200).subscribe(async (d: any) => {
            const isValid = await trigger('accountCode')
            if (isValid) {
                validateAccCodeAtServer(d.data)
            }
        })
        const subs2 = ibukiDebounceFilterOn(IbukiMessages["DEBOUNCE-ACC-NAME"], 1600).subscribe(async (d: any) => {
            const isValid = await trigger('accountName')
            if (isValid) {
                validateAccNameAtServer(d.data)
            }
        })

        return (() => {
            subs1.unsubscribe()
            subs2.unsubscribe()
        })
    }, [])

    return (<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-auto min-w-72">

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
                    },
                    onChange: (e: any) => {
                        ibukiDdebounceEmit(IbukiMessages['DEBOUNCE-ACC-CODE'], { accCode: e.target.value })
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
                    },
                    onChange: (e: any) => {
                        ibukiDdebounceEmit(IbukiMessages['DEBOUNCE-ACC-NAME'], { accName: e.target.value })
                    }
                })}
            />
            {errors.accountName && <WidgetFormErrorMessage errorMessage={errors.accountName.message} />}
        </label>

        {/* Account level */}
        <label className="flex flex-col font-medium text-primary-400">
            <span className="font-bold">Account Level <WidgetAstrix /></span>
            <select
                className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                {...register('accountLevel', { required: Messages.errRequired })}>
                <option value="">--- select ---</option>
                {getAccountLevelOptions()}
            </select>
            {errors.accountLevel && <WidgetFormErrorMessage errorMessage={errors.accountLevel.message} />}
        </label>

        {/* Submit Button */}
        <div className="mt-4 flex justify-start">
            <WidgetButtonSubmitFullWidth label="Save" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
        </div>

        <span>
            {showServerValidationError()}
        </span>
    </form>)

    function getAccountLevelOptions(): ReactElement[] {
        const levelMappings: AccountlevelMappingsType[] = AccountlevelMappings[accLeaf as 'N' | 'L']
        const levelMappingOptions = levelMappings.map((level: AccountlevelMappingsType) => (
            <option key={level.value} value={level.value}>{level.level}</option>
        ))
        return (levelMappingOptions)
    }

    async function onSubmit(data: FormValuesType) {
        const xData: XDataObjectType = {
            accCode: data.accountCode,
            accName: data.accountName,
            accType: accType,
            parentId: accId,
            accLeaf: data.accountLevel,
            isPrimary: false,
            classId: classId
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: AllTables.AccM.name,
                xData: xData
            })
            Utils.loadDataInTreeGridWithSavedScrollPos(context, DataInstancesMap.accountsMaster)
            Utils.showSaveMessage();
            Utils.showHideModalDialogA({
                isOpen: false
            })
        } catch (e: any) {
            console.log(e)
        }
    }

    function showServerValidationError() {
        let Ret = <></>
        if (errors?.root?.accCode) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.accCode.message} />
        } else if (errors?.root?.accName) {
            Ret = <WidgetFormErrorMessage errorMessage={errors?.root?.accName.message} />
        } else {
            Ret = <WidgetFormHelperText helperText='&nbsp;' />
        }
        return (Ret)
    }

    async function validateAccCodeAtServer(value: { accCode: string }) {
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.doesAccCodeExist,
            sqlArgs: {
                accCode: value?.accCode
            }
        })
        if (res?.[0]?.exists) {
            setError('root.accCode', {
                type: 'serverError',
                message: Messages.errAccCodeExists
            })
        } else {
            clearErrors('root.accCode')
        }
    }

    async function validateAccNameAtServer(value: { accName: string }) {
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.doesAccNameExist,
            sqlArgs: {
                accName: value?.accName
            }
        })
        if (res?.[0]?.exists) {
            setError('root.accName', {
                type: 'serverError',
                message: Messages.errAccNameExists
            })
        } else {
            clearErrors('root.accName')
        }
    }
}

type AccountsAddChildModalType = {
    accId: number
    accLeaf: string
    accType: 'A' | 'E' | 'I' | 'L'
    classId: number
}

type FormValuesType = {
    accountCode: string;
    accountName: string;
    accountLevel: 'S' | 'L' | 'Y' | 'N'
};

type AccountlevelMappingsType = {
    value: string
    level: string
}

const AccountlevelMappings = { //If current ac is group: allow group, ledger, leaf as accLeaf in drop down. if current ac is ledger only allow subledger
    N: [
        { value: 'N', level: 'Group' },
        { value: 'Y', level: 'Leaf' },
        { value: 'L', level: 'ledger' },
    ],
    L: [
        { value: 'S', level: 'Subledger' }
    ]
}
