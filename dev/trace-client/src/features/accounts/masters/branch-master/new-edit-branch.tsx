import { useDispatch } from "react-redux"
import { AppDispatchType } from "../../../../app/store/store"
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix"
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { useValidators } from "../../../../utils/validators-hook"
import { useForm } from "react-hook-form"
import { Utils } from "../../../../utils/utils"
import { Messages } from "../../../../utils/messages"
import { changeAccSettings } from "../../accounts-slice"
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width"
import _ from "lodash"
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map"
import { closeSlidingPane } from "../../../../controls/redux-components/comp-slice"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"

export function NewEditBranch({ props }: any) {
    const { id, branchCode, branchName, remarks } = props
    const instance: string = DataInstancesMap.branchMaster
    const dispatch: AppDispatchType = useDispatch()
    const { buCode, context } = useUtilsInfo()

    const {
        checkNoSpaceOrSpecialChar
        , checkNoSpecialChar
    } = useValidators()

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<EditNewBranchType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            id: id,
            branchCode: branchCode,
            branchName: branchName,
            remarks: remarks
        },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-auto mt-2 mr-6 mb-2"
        >
            {/* Branch Name */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Branch Name <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. Downtown Branch"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                    {...register('branchName', {
                        required: Messages.errRequired,
                        validate: checkNoSpecialChar
                    })}
                />
                {errors.branchName && <WidgetFormErrorMessage errorMessage={errors.branchName.message} />}
            </label>

            {/* Branch Code */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Branch Code <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. BR123"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                    {...register('branchCode', {
                        required: Messages.errRequired,
                        validate: checkNoSpaceOrSpecialChar
                    })}
                />
                {errors.branchCode && <WidgetFormErrorMessage errorMessage={errors.branchCode.message} />}
            </label>

            {/* Remarks */}
            <label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
                <span className="font-bold">Remarks</span>
                <textarea
                    placeholder="Add any remarks here..."
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                    {...register('remarks')}
                />
            </label>

            {/* Submit Button */}
            <div className="sm:col-span-2 mt-4">
                <WidgetButtonSubmitFullWidth label="Submit" className="" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
            </div>
        </form>
    )

    async function onSubmit(data: EditNewBranchType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo)
            return
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: DatabaseTablesMap.BranchM,
                xData: {
                    id: data.id,
                    branchCode: data.branchCode,
                    branchName: data.branchName,
                    remarks: data.remarks
                }
            })
            Utils.showSaveMessage()
            dispatch(changeAccSettings())
            dispatch(closeSlidingPane())
            const loadData = context.CompSyncFusionGrid[instance].loadData
            if (loadData) {
                await loadData()
            }
        } catch (e: any) {
            console.log(e)
        }
    }
}

export type EditNewBranchType = {
    id?: number
    branchCode: string
    branchName: string
    remarks?: string
}