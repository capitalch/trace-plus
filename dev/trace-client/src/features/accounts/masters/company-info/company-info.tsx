import { useDispatch } from "react-redux";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { AppDispatchType } from "../../../../app/store/store";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { useValidators } from "../../../../utils/validators-hook";
import { useForm } from "react-hook-form";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";

export function CompanyInfo() {
    const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.companyInfo
    const { buCode, context, dbName, decodedDbParamsObject, } = useUtilsInfo()
    const {
        checkEmail
        , checkGstin
        , checkGstStateCode
        , checkMobileNo
        , checkNoSpaceOrSpecialChar
        , checkNoSpecialChar
        , checkPinCode
    } = useValidators()

    const {
        register,
        control,
        getValues,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CompanyInfoType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            address1: '',
            address2: undefined,
            email: '',
            gstin: undefined,
            id: undefined,
            landPhone: undefined,
            mobileNumber: '',
            pin: undefined,
            shortName: '',
            state: undefined,
            unitName: '',
            webSite: undefined
        },
    });

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
                        {...register('unitName', { required: 'Unit Name is required' })}
                    />
                    {errors.unitName && <WidgetFormErrorMessage errorMessage={errors.unitName.message} />}
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Short Name <WidgetAstrix /></span>
                    <input
                        type="text"
                        placeholder="e.g. MO"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('shortName', { required: 'Short Name is required' })}
                    />
                    {errors.shortName && <WidgetFormErrorMessage errorMessage={errors.shortName.message} />}
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Address 1 <WidgetAstrix /></span>
                    <input
                        type="text"
                        placeholder="e.g. 123 Main Street"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('address1', { required: 'Address 1 is required' })}
                    />
                    {errors.address1 && <WidgetFormErrorMessage errorMessage={errors.address1.message} />}
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Address 2</span>
                    <input
                        type="text"
                        placeholder="e.g. Apartment 4B"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('address2')}
                    />
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">PIN <WidgetAstrix /></span>
                    <input
                        type="number"
                        placeholder="e.g. 123456"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('pin', { required: 'PIN is required' })}
                    />
                    {errors.pin && <WidgetFormErrorMessage errorMessage={errors.pin.message} />}
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">State</span>
                    <input
                        type="text"
                        placeholder="e.g. California"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('state')}
                    />
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Email <WidgetAstrix /></span>
                    <input
                        type="email"
                        placeholder="e.g. email@example.com"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email address',
                            },
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
                        {...register('gstin')}
                    />
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Land Phone</span>
                    <input
                        type="tel"
                        placeholder="e.g. 01122334455"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('landPhone')}
                    />
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Mobile Number <WidgetAstrix /></span>
                    <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('mobileNumber', { required: 'Mobile Number is required' })}
                    />
                    {errors.mobileNumber && <WidgetFormErrorMessage errorMessage={errors.mobileNumber.message} />}
                </label>

                <label className="flex flex-col font-medium text-primary-800">
                    <span className="font-bold">Website</span>
                    <input
                        type="url"
                        placeholder="e.g. https://example.com"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder:text-gray-300"
                        {...register('webSite')}
                    />
                </label>

                <div className="mt-7 flex justify-center">
                    <WidgetButtonSubmitFullWidth label="Submit" className="max-w-96" />
                </div>
            </form>
        </CompAccountsContainer>
    )

    async function onSubmit(data: CompanyInfoType) {

    }
}

type CompanyInfoType = {
    address1: string
    address2?: string
    email: string
    gstin?: string
    id: number | null
    landPhone?: string
    mobileNumber: string
    pin: number | undefined
    shortName: string
    state?: string
    unitName: string
    webSite?: string
}