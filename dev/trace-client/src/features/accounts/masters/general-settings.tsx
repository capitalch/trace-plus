import { useForm } from "react-hook-form";
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container";
import { useUtilsInfo } from "../../../utils/utils-info-hook";
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map";
import { AppDispatchType } from "../../../app/store";
import { useDispatch } from "react-redux";
import { WidgetAstrix } from "../../../controls/widgets/widget-astrix";
import { Messages } from "../../../utils/messages";
import { WidgetFormErrorMessage } from "../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../controls/widgets/widget-button-submit-full-width";
import _ from "lodash";
import { GeneralSettingsType, Utils } from "../../../utils/utils";
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map";
import { changeAccSettings } from "../accounts-slice";
import Select from "react-select";
import { NumericFormat } from 'react-number-format';
import useDeepCompareEffect from "use-deep-compare-effect";

export function GeneralSettings() {
    const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.generalSettings
    const { buCode, dbName, decodedDbParamsObject, } = useUtilsInfo()
    const generalSettings: GeneralSettingsType = Utils.getGeneralSettings() || {}

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isDirty, isSubmitting },
        watch
    } = useForm<GeneralSettingsType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            dateFormat: generalSettings?.dateFormat,
            autoLogoutTimeInMins: generalSettings?.autoLogoutTimeInMins || null,
            auditLockDate: generalSettings?.auditLockDate || null,
            defaultGstRate: generalSettings?.defaultGstRate || null,
        },
    });

    useDeepCompareEffect(() => {
        if (buCode && dbName) {
            setValue('dateFormat', generalSettings?.dateFormat || 'DD/MM/YYYY', { shouldDirty: true })
            setValue('autoLogoutTimeInMins', generalSettings?.autoLogoutTimeInMins || null, { shouldDirty: true })
            setValue('auditLockDate', generalSettings?.auditLockDate || null, { shouldDirty: true })
            setValue('defaultGstRate', generalSettings?.defaultGstRate || null, { shouldDirty: true });
        }
    }, [generalSettings])

    return (<CompAccountsContainer className="h-[calc(100vh-80px)] overflow-y-scroll">
        <form onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-y-4 w-96 mt-2 mb-2">

            {/* Date format */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Date format</span>
                <Select
                    className="mt-1.5"
                    options={dateFormatOptions}
                    getOptionLabel={(option) => option.dateFormatName}
                    getOptionValue={(option) => option.dateFormatValue}
                    onChange={handleOnChangeDateFormat}
                    styles={Utils.getReactSelectStyles()}
                    value={dateFormatOptions.find(option => option.dateFormatValue === watch('dateFormat'))}
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
                    value={watch('autoLogoutTimeInMins') || ''}
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
                    value={watch('auditLockDate') || ''}
                />
            </label>

            {/* Default GST Rate */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Default GST Rate (%)</span>
                <NumericFormat
                    allowNegative={false}
                    allowLeadingZeros={false}
                    decimalScale={2}
                    fixedDecimalScale
                    thousandSeparator
                    placeholder="e.g. 18.00"
                    defaultValue={0}
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                    {...register('defaultGstRate')}
                    value={watch('defaultGstRate') ?? 0}
                    onValueChange={(values) => {
                        setValue('defaultGstRate', values.floatValue ?? 0, { shouldDirty: true });
                    }}
                    onFocus={(e) => e.target.select()}
                />
            </label>

            <WidgetButtonSubmitFullWidth label="Submit" className="max-w-96 mt-4" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
        </form>
    </CompAccountsContainer>)

    function handleOnChangeDateFormat(selectedObject: { dateFormatValue: string, dateFormatName: string } | null) {
        if (!selectedObject) {
            return
        }
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