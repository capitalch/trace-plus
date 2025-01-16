import { useForm } from "react-hook-form";
import { useValidators } from "../../../../utils/validators-hook";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { Utils } from "../../../../utils/utils";
import { Messages } from "../../../../utils/messages";
import { XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
// import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import _ from "lodash";
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store/store";
import { useState } from "react";

export function AccountsEditModal({
    accCode,
    accId,
    accLeaf,
    accName,
    accType,
    hasChildRecords,
    parentId, }: AccountsEditModalType) {

    const instance = DataInstancesMap.accountsEditModal
    const { checkNoSpaceOrSpecialChar, checkNoSpecialChar } = useValidators()
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo()
    const parentOptions: ParentOptionsType[] = useSelector((state: RootStateType) => state.queryHelper[instance]?.data)
    const [selectedParent, setSelectedParent] = useState<AccountsEditModalType | null>(null)
    const {
        register,
        // clearErrors,
        handleSubmit,
        setValue,
        // setError,
        // trigger,
        // watch,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<FormValuesType>({
        mode: 'onTouched',
        criteriaMode: 'all',
        defaultValues: {
            accountCode: accCode,
            accountName: accName,
            parentAccount: parentId
        }
    });

    const { loading } = useQueryHelper({
        instance: DataInstancesMap.accountsEditModal,
        dbName: dbName,
        isExecQueryOnLoad: true,
        getQueryArgs: () => ({
            buCode: buCode,
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getAccountParentOptions,
            sqlArgs: {
                accType: accType
            }
        })
    })

    // const selectedParent = watch('parentAccount')

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 min-w-72 w-96">

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
                })}
            />
            {errors.accountName && <WidgetFormErrorMessage errorMessage={errors.accountName.message} />}
        </label>

        {/* Account parent */}
        <label className="flex flex-col font-medium text-primary-400">
            <span className="font-bold">Account Parent <WidgetAstrix /></span>
            <CompReactSelect
                menuPlacement='top'
                staticOptions={parentOptions}
                optionLabelName="fullName"
                optionValueName="accId"
                {...register('parentAccount', {
                    required: Messages.errRequired
                })}
                onChange={handleOnChangeParentId}
                ref={null}
                selectedValue={parentId}
            />
            {errors.parentAccount && <WidgetFormErrorMessage errorMessage={errors.parentAccount.message} />}
        </label>

        {/* Submit Button */}
        <div className="mt-4 flex justify-start">
            <WidgetButtonSubmitFullWidth label="Save" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
        </div>

    </form>)

    function handleOnChangeParentId(selectedObject: AccountsEditModalType) {
        setValue('parentAccount', selectedObject.accId, { shouldDirty: true })
        setSelectedParent(selectedObject)
    }

    async function onSubmit(data: FormValuesType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo)
            return
        }
        if (hasChildRecords && (selectedParent?.accLeaf === 'L')) {
            Utils.showAlertMessage('Warning', Messages.errExistingAccountHasChildren)
            return
        }
        console.log(selectedParent)
        const xData: XDataObjectType = {
            accCode: data.accountCode,
            accName: data.accountName,
            parentId: selectedParent?.accId,
            accId: accId,
            accLeaf: accLeaf
        }
        if ((selectedParent?.accLeaf === 'N') && (accLeaf === 'S')) {
            xData.accLeaf = 'Y'
        }
        if (selectedParent?.accLeaf === 'L') {
            xData.accLeaf = 'S'
        }
        try {
            // await Utils.doGenericUpdate({
            //     buCode: buCode || '',
            //     tableName: DatabaseTablesMap.AccM,
            //     xData: xData
            // })
            Utils.loadDataInTreeGridWithSavedScrollPos(context, DataInstancesMap.accountsMaster)
            Utils.showSaveMessage();
            Utils.showHideModalDialogA({
                isOpen: false
            })
        } catch (e: any) {
            console.log(e)
        }
    }
}
type AccountsEditModalType = {
    accCode: string
    accId: number
    accLeaf: 'L' | 'N' | 'Y' | 'S'
    accName: string
    accType: 'A' | 'L' | 'E' | 'I'
    hasChildRecords: boolean
    // parentAccLeaf: 'L' | 'N'
    // parentAccType: 'A' | 'L' | 'E' | 'I'
    // parentClassId: number
    parentId: number
}

type FormValuesType = {
    accountCode: string;
    accountName: string;
    parentAccount: number;
};

type ParentOptionsType = {
    accClass: string
    accId: number
    accLeaf: 'L' | 'N'
    accName: string
    accType: 'A' | 'L' | 'E' | 'I'
    fullName: string
}