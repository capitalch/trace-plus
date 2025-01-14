// import { useEffect } from "react";
import { useForm } from "react-hook-form";
// import { ibukiDdebounceEmit, ibukiDebounceFilterOn } from "../../../../utils/ibuki";
// import { IbukiMessages } from "../../../../utils/ibukiMessages";
import { useValidators } from "../../../../utils/validators-hook";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
// import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text";
import { Utils } from "../../../../utils/utils";
// import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { Messages } from "../../../../utils/messages";
import { XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import _ from "lodash";

export function AccountsEditSelfModal({
    accCode,
    accId,
    accLeaf,
    accName,
    hasChildRecords,
    parentAccLeaf,
    parentAccType,
    parentClassId,
    parentId, }: AccountsEditSelfModalType) {

    const { checkNoSpaceOrSpecialChar, checkNoSpecialChar } = useValidators()
    const { buCode, context, } = useUtilsInfo()
    const {
        register,
        // clearErrors,
        handleSubmit,
        // setError,
        // trigger,
        formState: { errors, isSubmitting },
    } = useForm<FormValuesType>({
        mode: 'onTouched',
        criteriaMode: 'all',
        defaultValues: {
            accountCode: accCode,
            accountName: accName,
            parentAccount: parentId
        }
    });


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

        {/* Submit Button */}
        <div className="mt-4 flex justify-start">
            <WidgetButtonSubmitFullWidth label="Save" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
        </div>

    </form>)

    async function onSubmit(data: FormValuesType) {
        const xData: XDataObjectType = {
            accCode: data.accountCode,
            accName: data.accountName,
            // parentId: accId,
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: DatabaseTablesMap.AccM,
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
}
type AccountsEditSelfModalType = {
    accCode: string
    accId: number
    accLeaf: 'L' | 'N' | 'Y' | 'S'
    accName: string
    hasChildRecords: boolean
    parentAccLeaf: 'L' | 'N'
    parentAccType: 'A' | 'L' | 'E' | 'I'
    parentClassId: number
    parentId: number
}

type FormValuesType = {
    accountCode: string;
    accountName: string;
    parentAccount: number;
};