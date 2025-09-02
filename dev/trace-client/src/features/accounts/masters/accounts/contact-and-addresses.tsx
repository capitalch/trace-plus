import { useFieldArray, useForm } from "react-hook-form";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { Messages } from "../../../../utils/messages";
import { useValidators } from "../../../../utils/validators-hook";
import { useEffect } from "react";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import _ from "lodash";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { closeSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { AppDispatchType } from "../../../../app/store";
import { useDispatch } from "react-redux";

export function ContactAndAddresses({ props }: ContactAndAddressesPropsType) {
    const dispatch: AppDispatchType = useDispatch()
    const { accId, isAddressExists } = props
    const instance: string = DataInstancesMap.contactsAndAddresses

    useEffect(() => {
        if (accId) {
            loadData()
        }
    }, [])

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
    } = useForm<ContactAndAddressesType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            id: undefined,
            contactName: "",
            contactCode: "",
            mobileNumber: "",
            otherMobileNumber: "",
            landPhone: "",
            email: "",
            otherEmail: "",
            descr: "",
            gstin: "",
            stateCode: "",
            addresses: [{ address1: "", address2: "", pin: "", city: "", state: "", country: "" }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'addresses'
    })

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid w-auto gap-4 grid-cols-1 sm:grid-cols-2">
            {isAddressExists && <button
                type="button"
                onClick={deleteContact}
                className="text-amber-500 text-left text-sm col-span-2">
                Permanently delete this contact along with address
            </button>}
            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Contact Name <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. John Doe"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("contactName", {
                        required: Messages.errRequired,
                        validate: {
                            valdateContactName: checkNoSpecialChar
                        }
                    })}
                />
                {errors.contactName && <WidgetFormErrorMessage errorMessage={errors.contactName.message} />}
            </label>

            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Contact Code <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. johnDoe"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("contactCode", {
                        required: Messages.errRequired,
                        validate: {
                            validateContactCode: checkNoSpaceOrSpecialChar
                        }
                    })}
                />
                {errors.contactCode && <WidgetFormErrorMessage errorMessage={errors.contactCode.message} />}
            </label>

            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Mobile Number</span>
                <input
                    type="text"
                    placeholder="e.g. 1234567890"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("mobileNumber", {
                        validate: {
                            validateMobileNo: (value: string) => ((value === '') || checkMobileNo(value)) // allows empty value
                        }
                    })}
                />
                {errors.mobileNumber && <WidgetFormErrorMessage errorMessage={errors.mobileNumber.message} />}
            </label>

            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Other Mobile Number</span>
                <input
                    type="text"
                    placeholder="e.g. 1234567890"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("otherMobileNumber", {
                        validate: {
                            validateOtherMobileNo: (value: string) => ((value === '') || checkMobileNo(value))
                        }
                    })}
                />
                {errors.otherMobileNumber && <WidgetFormErrorMessage errorMessage={errors.otherMobileNumber.message} />}
            </label>

            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Land Phone</span>
                <input
                    type="text"
                    placeholder="e.g. 1234567890"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("landPhone",)}
                />
            </label>

            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Email</span>
                <input
                    type="text"
                    placeholder="e.g. a@c.com"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("email", {
                        validate: {
                            validateEmail: (value: string) => ((value === '') || checkEmail(value)) // allows empty value
                        }
                    })}
                />
                {errors.email && <WidgetFormErrorMessage errorMessage={errors.email.message} />}
            </label>

            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Other Email</span>
                <input
                    type="text"
                    placeholder="e.g. a@c.com"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("otherEmail", {
                        validate: {
                            validateOtherEmail: (value: string) => ((value === '') || checkEmail(value)) // allows empty value
                        }
                    })}
                />
                {errors.otherEmail && <WidgetFormErrorMessage errorMessage={errors.otherEmail.message} />}
            </label>

            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">Description</span>
                <input
                    type="text"
                    placeholder="Description"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("descr",)}
                />
            </label>

            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">GSTIN Number</span>
                <input
                    type="text"
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("gstin", {
                        validate: {
                            validateGstin: (value: string) => ((value === '') || checkGstin(value)) // allows empty value
                        }
                    })}
                />
                {errors.gstin && <WidgetFormErrorMessage errorMessage={errors.gstin.message} />}
            </label>

            <label className="flex flex-col font-medium text-primary-800">
                <span className="font-bold">State Code</span>
                <input
                    type="text"
                    placeholder="e.g. 19"
                    autoComplete="off"
                    className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                    {...register("stateCode", {
                        validate: {
                            validateGstStateCode: (value: string) => ((value === '') || checkGstStateCode(value)) // allows empty value
                        }
                    })}
                />
                {errors.stateCode && <WidgetFormErrorMessage errorMessage={errors.stateCode.message} />}
            </label>

            {/* Addresses */}
            <div className="col-span-2">
                <span className="font-bold text-primary-800">Addresses <span className="font-medium text-xs">[Count: {fields.length}]</span></span>
                {fields.map((field, index) => (
                    <div key={field.id} className="grid p-4 border-2 border-primary-200 rounded-md gap-4 grid-cols-2">
                        <label className="flex flex-col font-medium text-primary-800">
                            <span>Address Line 1 <WidgetAstrix /></span>
                            <input
                                type="text"
                                placeholder="e.g. 123 Main St"
                                autoComplete="off"
                                className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                                {...register(`addresses.${index}.address1`, {
                                    required: Messages.errRequired,
                                    validate: {
                                        validateAddress1: checkNoSpecialChar
                                    }
                                })}
                            />
                            {errors.addresses?.[index]?.address1 && (
                                <WidgetFormErrorMessage errorMessage={errors.addresses[index].address1.message} />
                            )}
                        </label>

                        <label className="flex flex-col font-medium text-primary-800">
                            <span>Address Line 2</span>
                            <input
                                type="text"
                                placeholder="e.g. Suite 100"
                                autoComplete="off"
                                className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                                {...register(`addresses.${index}.address2`, {
                                    validate: {
                                        validateAddress2: checkNoSpecialChar
                                    }
                                })}
                            />
                            {errors.addresses?.[index]?.address2 && (
                                <WidgetFormErrorMessage errorMessage={errors.addresses[index].address2.message} />
                            )}
                        </label>

                        <label className="flex flex-col font-medium text-primary-800">
                            <span>Pin <WidgetAstrix /></span>
                            <input
                                type="text"
                                placeholder="e.g. 700043"
                                autoComplete="off"
                                className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                                {...register(`addresses.${index}.pin`, {
                                    required: Messages.errRequired,
                                    validate: {
                                        validatePinCode: checkPinCode
                                    }
                                })}
                            />
                            {errors.addresses?.[index]?.pin && (
                                <WidgetFormErrorMessage errorMessage={errors.addresses[index].pin.message} />
                            )}
                        </label>

                        <label className="flex flex-col font-medium text-primary-800">
                            <span>City <WidgetAstrix /></span>
                            <input
                                type="text"
                                placeholder="e.g. Kolkata"
                                autoComplete="off"
                                className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                                {...register(`addresses.${index}.city`, {
                                    required: Messages.errRequired
                                })}
                            />
                            {errors.addresses?.[index]?.city && (
                                <WidgetFormErrorMessage errorMessage={errors.addresses[index].city.message} />
                            )}
                        </label>

                        <label className="flex flex-col font-medium text-primary-800">
                            <span>State <WidgetAstrix /></span>
                            <input
                                type="text"
                                placeholder="e.g. West Bengal"
                                autoComplete="off"
                                className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                                {...register(`addresses.${index}.state`, {
                                    required: Messages.errRequired
                                })}
                            />
                            {errors.addresses?.[index]?.state && (
                                <WidgetFormErrorMessage errorMessage={errors.addresses[index].state.message} />
                            )}
                        </label>

                        <label className="flex flex-col font-medium text-primary-800">
                            <span>Country</span>
                            <input
                                type="text"
                                placeholder="e.g. India"
                                autoComplete="off"
                                className="mt-1 px-2 border-[1px] border-primary-200 rounded-md placeholder:text-gray-300"
                                {...register(`addresses.${index}.country`)}
                            />
                        </label>

                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-left text-lime-500 text-sm">
                            Remove this address
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => append({ address1: "", address2: "", pin: "", city: "", state: "", country: "" })}
                    className="ml-2 text-blue-500 text-sm">
                    Add new address
                </button>
            </div>

            {/* Save Button */}
            <WidgetButtonSubmitFullWidth className="col-span-2" label="Save" disabled={isSubmitting} />
        </form>

    );

    async function closePane() {
        dispatch(closeSlidingPane())
        Utils.showSaveMessage();
        const loadDataAccountsMaster = context.CompSyncFusionTreeGrid[DataInstancesMap.accountsMaster].loadData
        if (loadDataAccountsMaster) {
            await loadDataAccountsMaster()
        }
    }

    async function deleteContact() {
        Utils.showDeleteConfirmDialog(
            async () => {
                try {
                    await Utils.doGenericDelete({
                        buCode: buCode || '',
                        tableName: AllTables.ExtBusinessContactsAccM.name,
                        deletedIds: [getValues().id]
                    })
                    await closePane()
                } catch (e: any) {
                    console.log(e)
                }
            }
        )
    }

    async function loadData() {
        try {
            const res: ContactAndAddressesType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject,
                instance: instance,
                sqlId: SqlIdsMap.getExtBusinessContactsAccM,
                sqlArgs: {
                    accId: accId
                },
            })
            if ((!_.isEmpty(res)) && (Array.isArray(res)) && (res.length > 0)) {
                populateData(res[0])
            }
        } catch (e: any) {
            console.log(e)
        }
    }

    async function onSubmit(data: ContactAndAddressesType) {
        const xData: any = {}
        xData.contactName = data.contactName
        xData.contactCode = data.contactCode
        xData.mobileNumber = data.mobileNumber || undefined
        xData.otherMobileNumber = data.otherMobileNumber || undefined
        xData.email = data.email || undefined
        xData.otherEmail = data.otherEmail || undefined
        xData.landPhone = data.landPhone || undefined
        xData.descr = data.descr || undefined
        xData.gstin = data.gstin || undefined
        xData.stateCode = data.stateCode || undefined
        xData.accId = accId
        xData.id = data.id
        if (data?.addresses && data.addresses.length > 0) {
            data.addresses.forEach((address: any,) => {
                address.address2 = address.address2 || undefined
                address.country = address.country || undefined
            })
            xData.jAddress = JSON.stringify(data.addresses)
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: AllTables.ExtBusinessContactsAccM.name,
                xData: xData
            })
            await closePane()
        } catch (e: any) {
            console.log(e)
        }
    }

    function populateData(res: ContactAndAddressesType) {
        setValue("id", res.id)
        setValue("contactName", res.contactName || '');
        setValue("contactCode", res.contactCode || '');
        setValue("mobileNumber", res.mobileNumber || '');
        setValue("otherMobileNumber", res.otherMobileNumber || '');
        setValue("landPhone", res.landPhone || '');
        setValue("email", res.email || '');
        setValue("otherEmail", res.otherEmail || '');
        setValue("descr", res.descr || '');
        setValue("gstin", res.gstin || '');
        setValue("stateCode", res.stateCode || '');
        const addresses: AddressType[] | undefined = res.jAddress
        if (addresses && (addresses.length > 0)) {
            replace(addresses.map(address => ({
                address1: address.address1 || '',
                address2: address.address2 || '',
                pin: address.pin || '',
                city: address.city || '',
                state: address.state || '',
                country: address.country || '',
            })));
        }
    }
}

export type ContactAndAddressesPropsType = {
    props: {
        accId: number
        isAddressExists: boolean
    }
}

// Types
export type ContactAndAddressesType = {
    accId?: number
    contactName: string;
    contactCode: string;
    mobileNumber: string;
    otherMobileNumber: string;
    landPhone: string;
    email: string;
    otherEmail: string;
    descr: string;
    gstin: string;
    stateCode: string;
    addresses: AddressType[];
    jAddress?: AddressType[];
    id: number;
};

export type AddressType = {
    address1: string;
    address2: string;
    pin: string;
    city: string;
    state: string;
    country: string;
};