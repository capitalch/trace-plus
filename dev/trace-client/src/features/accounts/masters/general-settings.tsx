import { useForm } from "react-hook-form";
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container";
import { useUtilsInfo } from "../../../utils/utils-info-hook";
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map";
import { AppDispatchType } from "../../../app/store/store";
import { useDispatch } from "react-redux";
import { CompReactSelect } from "../../../controls/components/comp-react-select";
import { WidgetAstrix } from "../../../controls/widgets/widget-astrix";
import { Messages } from "../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../controls/widgets/widget-button-submit-full-width";
import _ from "lodash";
import { GeneralSettingsType, Utils } from "../../../utils/utils";
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map";
import { changeAccSettings } from "../accounts-slice";

export function GeneralSettings() {
    const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.generalSettings
    const { buCode, dbName, decodedDbParamsObject, } = useUtilsInfo()
    const generalSettings: GeneralSettingsType = Utils.getGeneralSettings()

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<GeneralSettingsType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            dateFormat: generalSettings.dateFormat,
            autoLogoutTimeInMins: generalSettings.autoLogoutTimeInMins,
            auditLockDate: generalSettings.auditLockDate
        },
    });

    return (<CompAccountsContainer className="h-[calc(100vh-80px)] overflow-y-scroll">
        <form onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-y-4 w-96 mt-2 mb-2">

            {/* Date format */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Date format</span>
                <CompReactSelect
                    className="mt-1.5"
                    staticOptions={dateFormatOptions}
                    optionLabelName="dateFormatName"
                    optionValueName="dateFormatValue"
                    {...register('dateFormat')}
                    onChange={handleOnChangeDateFormat}
                    ref={null} // required for react-hook-form to work with
                    selectedValue='DD/MM/YYYY'
                />
            </label>

            {/* Auto log off time in mins */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Auto log off time in mins <WidgetAstrix /></span>
                <input
                    type="number"
                    placeholder="e.g. 30"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300
                        [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield]" // classname from perplexity ai
                    {...register('autoLogoutTimeInMins', {
                        required: Messages.errRequired,
                    })}
                />
                {errors.autoLogoutTimeInMins && <WidgetFormErrorMessage errorMessage={errors.autoLogoutTimeInMins.message} />}
            </label>

            {/* Audit Lock Date */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Audit Lock Date</span>
                <input
                    type="date"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300 w-full"
                    {...register('auditLockDate')}
                />
            </label>
            <WidgetButtonSubmitFullWidth label="Submit" className="max-w-96 mt-4" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
        </form>
    </CompAccountsContainer>)

    function handleOnChangeDateFormat(selectedObject: { dateFormatValue: string, dateFormatName: string }) {
        setValue('dateFormat', selectedObject.dateFormatValue, { shouldDirty: true })
    }

    async function onSubmit(data: GeneralSettingsType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo)
            return
        }
        try {
            await Utils.doGenericUpdateQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                sqlId: SqlIdsMap.upsertGeneralSettings,
                dbParams: decodedDbParamsObject,
                instance: instance,
                sqlArgs: {
                    jData: JSON.stringify(data)
                }
            })
            Utils.showSaveMessage()
            dispatch(changeAccSettings())
        } catch (e: any) {
            console.log(e)
        }
    }
}

const dateFormatOptions: { dateFormatValue: string, dateFormatName: string }[] = [
    { dateFormatValue: 'DD/MM/YYYY', dateFormatName: 'DD/MM/YYYY' },
    { dateFormatValue: 'MM/DD/YYYY', dateFormatName: 'MM/DD/YYYY' },
    { dateFormatValue: 'YYYY-MM-DD', dateFormatName: 'YYYY-MM-DD' },
]