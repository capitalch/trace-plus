import { useDispatch } from "react-redux";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { useValidators } from "../../../../utils/validators-hook";
import { useForm } from "react-hook-form";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { Messages } from "../../../../utils/messages";
import indiaStatesJson from './india-states-gst-codes.json'
import { CompReactSelect } from "../../../../controls/components/comp-react-select";
import { useEffect, useState } from "react";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import _ from "lodash";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { AppDispatchType } from "../../../../app/store/store";
import { toggleAccountsInfo } from "../../accounts-slice";
// import { useNavigate } from "react-router-dom";

export function CompanyInfo() {
    // const navigate = useNavigate()
    const dispatch: AppDispatchType = useDispatch()
    const [indiaStates, setIndiaStates] = useState({})
    const instance: string = DataInstancesMap.companyInfo
    const { buCode, dbName, decodedDbParamsObject, } = useUtilsInfo()
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
        getValues,
        handleSubmit,
        setValue,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<UnitInfoType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            address1: '',
            address2: undefined,
            email: '',
            gstin: undefined,
            landPhone: undefined,
            mobileNumber: '',
            pin: undefined,
            shortName: '',
            state: '',
            unitName: '',
            webSite: undefined
        },
    });

    useEffect(() => {
        loadIndiaStates()
        populateData()
    }, [])

    return (
        <CompAccountsContainer>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-auto mt-2 mr-6 mb-2">
                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Unit Name <WidgetAstrix /></span>
                    <input
                        type="text"
                        placeholder="e.g. Main Office"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('unitName', {
                            required: Messages.errRequired,
                            validate: checkNoSpecialChar
                        })}
                    />
                    {errors.unitName && <WidgetFormErrorMessage errorMessage={errors.unitName.message} />}
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Short Name <WidgetAstrix /></span>
                    <input
                        type="text"
                        placeholder="e.g. MO"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('shortName', {
                            required: Messages.errRequired,
                            validate: checkNoSpaceOrSpecialChar
                        })}
                    />
                    {errors.shortName && <WidgetFormErrorMessage errorMessage={errors.shortName.message} />}
                </label>

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

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">State</span>
                    <CompReactSelect
                        className="mt-1.5"
                        // menuPlacement='top'
                        staticOptions={indiaStates}
                        optionLabelName="stateName"
                        optionValueName="stateValue"
                        {...register('state')}
                        onChange={handleOnChangeState}
                        ref={null} // required for react-hook-form to work with
                        selectedValue={getValues('state') || ''}
                    />
                </label>

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

                <div className="mt-7 flex justify-center">
                    <WidgetButtonSubmitFullWidth label="Submit" className="max-w-96" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
                </div>
                {/* <button type="button" className="p-2 bg-gray-200" onClick={()=>{
                    navigate('/')
                }}>Navigate</button> */}
            </form>
        </CompAccountsContainer>
    )

    function handleOnChangeState(selectedObject: { stateValue: string, stateName: string }) {
        setValue('state', selectedObject.stateValue, { shouldDirty: true })
    }

    function loadIndiaStates() {
        const indiaStates: { stateValue: string, stateName: string }[]
            = Object.entries(indiaStatesJson)
                .map(([stateValue, stateName]) => ({ stateValue, stateName }))
        indiaStates.unshift({ stateValue: '', stateName: '--- select ---' })
        setIndiaStates(indiaStates)
    }

    function populateData() {
        const unitInfo: UnitInfoType = Utils.getUnitInfo() || {}
        setValue('address1', unitInfo.address1 || '')
        setValue('address2', unitInfo.address2)
        setValue('email', unitInfo.email || '')
        setValue('gstin', unitInfo.gstin)
        setValue('landPhone', unitInfo.landPhone)
        setValue('mobileNumber', unitInfo.mobileNumber || '')
        setValue('pin', unitInfo.pin || '')
        setValue('shortName', unitInfo.shortName || '')
        setValue('state', unitInfo.state)
        setValue('unitName', unitInfo.unitName || '')
        setValue('webSite', unitInfo.webSite)
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
            dispatch(toggleAccountsInfo())
        } catch (e: any) {
            console.log(e)
        }
    }
}

// type CompanyInfoType = {
//     address1: string
//     address2?: string
//     email: string
//     gstin?: string
//     landPhone?: string
//     mobileNumber: string
//     pin: string
//     shortName: string
//     state?: string
//     unitName: string
//     webSite?: string
// }