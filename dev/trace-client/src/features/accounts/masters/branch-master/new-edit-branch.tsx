import { useDispatch } from "react-redux"
import { AppDispatchType } from "../../../../app/store"
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
import { AllTables } from "../../../../app/maps/database-tables-map"
import { closeSlidingPane } from "../../../../controls/redux-components/comp-slice"
import { DataInstancesMap } from "../../../../app/maps/data-instances-map"

export function NewEditBranch({ props }: any) {
    const {
        id,
        branchCode,
        branchName,
        remarks,
        address1,
        address2,
        pin,
        phones,  // Comma-separated phone numbers
        gstin
    } = props
    const instance: string = DataInstancesMap.branchMaster
    const dispatch: AppDispatchType = useDispatch()
    const { buCode, context } = useUtilsInfo()

    const {
        checkNoSpaceOrSpecialChar,
        checkNoSpecialChar,
        checkMobileNos,   // For multiple mobile numbers
        checkLandPhones,  // For multiple landline numbers
        checkGstin        // For GSTIN validation
    } = useValidators()

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<NewEditBranchType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            id: id,
            branchCode: branchCode,
            branchName: branchName,
            remarks: remarks,
            address1: address1 || '',
            address2: address2 || '',
            pin: pin || '',
            phones: phones || '',  // Comma-separated phone numbers
            gstin: gstin || ''
        },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid mt-2 mr-6 mb-2 w-auto gap-x-6 gap-y-2 grid-cols-1 sm:grid-cols-2"
        >
            {/* Branch Name */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Branch Name <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. Downtown Branch"
                    className="mt-0.5 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
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
                    className="mt-0.5 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register('branchCode', {
                        required: Messages.errRequired,
                        validate: checkNoSpaceOrSpecialChar
                    })}
                />
                {errors.branchCode && <WidgetFormErrorMessage errorMessage={errors.branchCode.message} />}
            </label>

            {/* Address Line 1 */}
            <label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
                <span className="font-bold">Address Line 1 <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. 123 Main Street"
                    className="mt-0.5 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register('address1', {
                        required: Messages.errRequired,
                        maxLength: 200
                    })}
                />
                {errors.address1 && <WidgetFormErrorMessage errorMessage={errors.address1.message} />}
            </label>

            {/* Address Line 2 */}
            <label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
                <span className="font-bold">Address Line 2</span>
                <input
                    type="text"
                    placeholder="e.g. Suite 100, Building B"
                    className="mt-0.5 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register('address2')}
                />
            </label>

            {/* Pin Code */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Pin Code <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. 123456"
                    maxLength={6}
                    className="mt-0.5 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register('pin', {
                        required: Messages.errRequired,
                        pattern: {
                            value: /^\d{6}$/,
                            message: 'Pin code must be 6 digits'
                        }
                    })}
                />
                {errors.pin && <WidgetFormErrorMessage errorMessage={errors.pin.message} />}
            </label>

            {/* Phones */}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Phone Numbers</span>
                <input
                    type="text"
                    placeholder="e.g. 9876543210, 022-12345678"
                    className="mt-0.5 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register('phones', {
                        validate: (value) => {
                            if (!value) return true;
                            const mobileError = checkMobileNos(value);
                            if (!mobileError) return true;
                            const landPhoneError = checkLandPhones(value);
                            if (!landPhoneError) return true;
                            return 'Please enter valid mobile or landline numbers, separated by commas';
                        }
                    })}
                />
                {errors.phones && <WidgetFormErrorMessage errorMessage={errors.phones.message} />}
            </label>

            {/* GSTIN */}
            <label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
                <span className="font-bold">GSTIN</span>
                <input
                    type="text"
                    placeholder="e.g. 27AABCU9603R1ZM"
                    maxLength={15}
                    className="mt-0.5 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300 uppercase"
                    {...register('gstin', {
                        validate: checkGstin
                    })}
                />
                {errors.gstin && <WidgetFormErrorMessage errorMessage={errors.gstin.message} />}
            </label>

            {/* Remarks */}
            <label className="flex flex-col font-medium text-primary-800 sm:col-span-2">
                <span className="font-bold">Remarks</span>
                <textarea
                    placeholder="Add any remarks here..."
                    rows={2}
                    className="mt-0.5 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register('remarks')}
                />
            </label>

            {/* Submit Button */}
            <div className="mt-2 sm:col-span-2">
                <WidgetButtonSubmitFullWidth label="Submit" className="" disabled={(isSubmitting) || (!_.isEmpty(errors))} />
            </div>
        </form>
    )

    async function onSubmit(data: NewEditBranchType) {
        if (!isDirty) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo)
            return
        }
        try {
            // Construct jData with address and gstin as separate fields
            const jData: any = {}

            // Add address object if at least address1 and pin are provided
            if (data.address1 && data.pin) {
                jData.address = {
                    address1: data.address1,
                    address2: data.address2 || null,
                    pin: data.pin,
                    phones: data.phones || null  // Comma-separated phone numbers
                }
            }

            // Add gstin as separate field in jData (not inside address)
            if (data.gstin) {
                jData.gstin = data.gstin
            }

            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: AllTables.BranchM.name,
                xData: {
                    id: data.id,
                    branchCode: data.branchCode,
                    branchName: data.branchName,
                    remarks: data.remarks,
                    jData: Object.keys(jData).length > 0 ? JSON.stringify(jData) : null
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

export type NewEditBranchType = {
    id?: number
    branchCode: string
    branchName: string
    remarks?: string
    address1?: string
    address2?: string
    pin?: string
    phones?: string  // Comma-separated phone numbers
    gstin?: string
}