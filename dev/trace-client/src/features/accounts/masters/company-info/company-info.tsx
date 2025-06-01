import { useDispatch } from "react-redux";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { useValidators } from "../../../../utils/validators-hook";
import { useForm } from "react-hook-form";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { Messages } from "../../../../utils/messages";
import indiaStatesJson from './india-states-gst-codes.json'
import { useEffect, useState } from "react";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import _ from "lodash";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { AppDispatchType } from "../../../../app/store/store";
import { changeAccSettings } from "../../accounts-slice";
import Select from "react-select";
import useDeepCompareEffect from "use-deep-compare-effect";

export function CompanyInfo() {
    const dispatch: AppDispatchType = useDispatch()
    const [indiaStates, setIndiaStates] = useState<IndiaStateType[]>([])
    const instance: string = DataInstancesMap.companyInfo
    const { buCode, dbName, decodedDbParamsObject, } = useUtilsInfo()
    const unitInfo: UnitInfoType = Utils.getUnitInfo() || {}

    const {
        checkAddress
        , checkEmail
        , checkGstin
        , checkLandPhones
        , checkMobileNos
        , checkNoSpaceOrSpecialChar
        , checkNoSpecialChar
        , checkPinCode
        , checkUrl
    } = useValidators()

    const {
        register,
        handleSubmit,
        setValue, clearErrors, reset,
        formState: { errors, isDirty, isSubmitting },
        watch
    } = useForm<UnitInfoType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            address1: unitInfo.address1,
            address2: unitInfo.address2,
            email: unitInfo.email,
            gstin: unitInfo.gstin,
            landPhone: unitInfo.landPhone,
            mobileNumber: unitInfo.mobileNumber,
            pin: unitInfo.pin,
            shortName: unitInfo.shortName,
            state: unitInfo.state,
            unitName: unitInfo.unitName,
            webSite: unitInfo.webSite
        },
    });

    useEffect(() => {
        loadIndiaStates()
    }, [])

    useDeepCompareEffect(() => {
        if (buCode && dbName) {
            reset()
            clearErrors() // Clear errors when unitInfo changes
            setValue('address1', unitInfo.address1 || '', { shouldDirty: true })
            setValue('address2', unitInfo.address2 || '', { shouldDirty: true })
            setValue('email', unitInfo.email || '', { shouldDirty: true })
            setValue('gstin', unitInfo.gstin || '', { shouldDirty: true })
            setValue('landPhone', unitInfo.landPhone || '', { shouldDirty: true })
            setValue('mobileNumber', unitInfo.mobileNumber || '', { shouldDirty: true })
            setValue('pin', unitInfo.pin || '', { shouldDirty: true })
            setValue('shortName', unitInfo.shortName || '', { shouldDirty: true })
            setValue('state', unitInfo.state || '', { shouldDirty: true })
            setValue('unitName', unitInfo.unitName || '', { shouldDirty: true })
            setValue('webSite', unitInfo.webSite || '', { shouldDirty: true })
        }
    }, [unitInfo])

    return (
        <CompAccountsContainer className="h-[calc(100vh-80px)] overflow-y-scroll">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-auto mt-2 mr-6 mb-2">

                {/* Unit name */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Unit Name <WidgetAstrix /></span>
                    <input
                        type="text"
                        placeholder="e.g. ABC Pvt Ltd."
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('unitName', {
                            required: Messages.errRequired,
                            validate: checkNoSpecialChar
                        })}
                        value={watch('unitName') || undefined} // Ensure controlled input
                    />
                    {errors.unitName && <WidgetFormErrorMessage errorMessage={errors.unitName.message} />}
                </label>

                {/* Short name */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Short Name <WidgetAstrix /></span>
                    <input
                        type="text"
                        placeholder="e.g. ABCPvtLtd"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('shortName', {
                            required: Messages.errRequired,
                            validate: checkNoSpaceOrSpecialChar
                        })}
                        value={watch('shortName') || undefined} // Ensure controlled input
                    />
                    {errors.shortName && <WidgetFormErrorMessage errorMessage={errors.shortName.message} />}
                </label>

                {/* Address 1 */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Address 1 <WidgetAstrix /></span>
                    <input
                        type="text"
                        placeholder="e.g. 123 Main Street"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('address1', {
                            required: Messages.errRequired,
                            validate: checkAddress
                        })}
                    />
                    {errors.address1 && <WidgetFormErrorMessage errorMessage={errors.address1.message} />}
                </label>

                {/* Address 2 */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Address 2</span>
                    <input
                        type="text"
                        placeholder="e.g. Apartment 4B"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('address2', {
                            validate: checkAddress
                        })}
                    />
                    {errors.address2 && <WidgetFormErrorMessage errorMessage={errors.address2.message} />}
                </label>

                {/* Pin */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">PIN <WidgetAstrix /></span>
                    <input
                        type="number"
                        placeholder="e.g. 123456"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300
                        [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield]" // classname from perplexity ai
                        {...register('pin', {
                            required: Messages.errRequired,
                            validate: checkPinCode
                        })}
                    />
                    {errors.pin && <WidgetFormErrorMessage errorMessage={errors.pin.message} />}
                </label>

                {/* State */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">State</span>
                    <Select
                        className="mt-1.5"
                        options={indiaStates}
                        getOptionLabel={(option: IndiaStateType) => option.stateName}
                        getOptionValue={(option: IndiaStateType) => option.stateValue}
                        menuPlacement="auto"
                        placeholder="--- select  state---"
                        {...register('state')}
                        onChange={handleOnChangeState}
                        styles={Utils.getReactSelectStyles()}
                        value={indiaStates.find((st: IndiaStateType) => st.stateValue === watch('state')) || null}
                    />

                </label>

                {/* Email */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Email <WidgetAstrix /></span>
                    <input
                        type="email"
                        placeholder="e.g. email@example.com"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('email', {
                            required: Messages.errRequired,
                            validate: checkEmail
                        })}
                    />
                    {errors.email && <WidgetFormErrorMessage errorMessage={errors.email.message} />}
                </label>

                {/* gstin */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">GSTIN</span>
                    <input
                        type="text"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('gstin', {
                            validate: checkGstin
                        })}
                    />
                    {errors.gstin && <WidgetFormErrorMessage errorMessage={errors.gstin.message} />}
                </label>

                {/* Land phones */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Land Phones</span>
                    <input
                        type="tel"
                        placeholder="e.g. 01122334455, 03322280608"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('landPhone', {
                            validate: checkLandPhones
                        })}
                    />
                    {errors.landPhone && <WidgetFormErrorMessage errorMessage={errors.landPhone.message} />}
                </label>

                {/* Mobile numbers */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Mobile Numbers <WidgetAstrix /></span>
                    <input
                        type="tel"
                        placeholder="e.g. 9876543210, 9832077665"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('mobileNumber', {
                            required: Messages.errRequired,
                            validate: checkMobileNos
                        })}
                    />
                    {errors.mobileNumber && <WidgetFormErrorMessage errorMessage={errors.mobileNumber.message} />}
                </label>

                {/* web site  */}
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Website</span>
                    <input
                        type="text"
                        placeholder="e.g. https://example.com"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('webSite', { validate: checkUrl })}
                    />
                    {errors.webSite && <WidgetFormErrorMessage errorMessage={errors.webSite.message} />}
                </label>

                {/* Submit */}
                <div className="mt-7 flex justify-center">
                    <WidgetButtonSubmitFullWidth label="Submit" className="max-w-96" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
                </div>
            </form>
        </CompAccountsContainer>
    )

    function handleOnChangeState(
        selectedObject: IndiaStateType | null,
    ) {
        if (!selectedObject || selectedObject.stateValue === '') {
            return;
        }
        setValue('state', selectedObject.stateValue, { shouldDirty: true });
    }

    function loadIndiaStates() {
        const indiaStates: IndiaStateType[]
            = Object.entries(indiaStatesJson)
                .map(([stateValue, stateName]) => ({ stateValue, stateName }))
        indiaStates.unshift({ stateValue: '', stateName: '--- select ---' })
        setIndiaStates(indiaStates)
    }

    async function onSubmit(data: UnitInfoType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo)
            return
        }
        try {
            await Utils.doGenericUpdateQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                sqlId: SqlIdsMap.upsertUnitInfo,
                dbParams: decodedDbParamsObject,
                instance: instance,
                sqlArgs: {
                    jData: JSON.stringify(data)
                }
            })
            dispatch(changeAccSettings())
        } catch (e: any) {
            console.log(e)
        }
    }
}

type IndiaStateType = {
    stateValue: string;
    stateName: string;
}