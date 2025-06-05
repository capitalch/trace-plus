import { useDispatch } from "react-redux"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { AppDispatchType } from "../../../../app/store/store"
// import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { useForm } from "react-hook-form"
import { Utils } from "../../../../utils/utils"
import { Messages } from "../../../../utils/messages"
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map"
import { changeAccSettings } from "../../accounts-slice"
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix"
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message"
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width"
import _ from "lodash"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"

export function NewEditFinYear({ id, startDate, endDate, isIdInsert }: NewEditFinYearType) {

    const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.finYearsMaster
    const { buCode, context } = useUtilsInfo()

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<NewEditFinYearType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            id: id,
            startDate: startDate,
            endDate: endDate,
            isIdInsert: isIdInsert
        },
    });

    return (<form onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-y-4 w-96 mt-2 mb-2">

        {/* Fin year */}
        <label className="flex flex-col font-medium text-primary-800">
            <span className="font-bold">Financial year <WidgetAstrix /></span>
            <input
                type="number"
                placeholder="e.g. 2026"
                className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300
                [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield]" // classname from perplexity ai
                {...register('id', {
                    required: Messages.errRequired,
                })}
            />
            {errors.id && <WidgetFormErrorMessage errorMessage={errors.id.message} />}
        </label>

        {/* Start date */}
        <label className="flex flex-col font-medium text-primary-800">
            <span className="font-bold">Start date</span>
            <input
                type="date"
                className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300 w-full"
                {...register('startDate', {
                    required: Messages.errRequired
                })}
            />
            {errors.startDate && <WidgetFormErrorMessage errorMessage={errors.startDate.message} />}
        </label>

        {/* End date */}
        <label className="flex flex-col font-medium text-primary-800">
            <span className="font-bold">End date</span>
            <input
                type="date"
                className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300 w-full"
                {...register('endDate', {
                    required: Messages.errRequired
                })}
            />
            {errors.endDate && <WidgetFormErrorMessage errorMessage={errors.endDate.message} />}
        </label>

        {/* Submit */}
        <WidgetButtonSubmitFullWidth label="Submit" className="max-w-96 mt-4" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
    </form>)

    async function onSubmit(data: NewEditFinYearType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo)
            return
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: DatabaseTablesMap.FinYearsM,
                xData: {
                    id: data.id,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    isIdInsert: isIdInsert
                }
            })
            Utils.showSaveMessage()
            dispatch(changeAccSettings())
            Utils.showHideModalDialogA({
                isOpen: false
            })
            const loadData = context.CompSyncFusionGrid[instance].loadData
            if (loadData) {
                await loadData()
            }
        } catch (e: any) {
            console.log(e)
        }
    }

}

export type NewEditFinYearType = {
    id?: number
    startDate: string
    endDate: string
    isIdInsert?: boolean
}