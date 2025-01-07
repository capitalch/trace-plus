// import { useContext,  } from "react";
// import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { useFieldArray, useForm } from "react-hook-form";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import { Messages } from "../../../../utils/messages";
import { useValidators } from "../../../../utils/validators-hook";

export function ContactAndAddresses({ props }: ContactAndAddressesType) {
    console.log(props.accId)
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
        handleSubmit,
        // setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'addresses'
    })

    // useEffect(() => {
    //     setValue("contactName", contactName || "");
    //     setValue("contactCode", contactCode || "");
    //     setValue("mobileNumber", mobileNumber || "");
    //     setValue("otherMobileNumber", otherMobileNumber || "");
    //     setValue("landPhone", landPhone || "");
    //     setValue("email", email || "");
    //     setValue("otherEmail", otherEmail || "");
    //     setValue("descr", descr || "");
    //     setValue("gstin", gstin || "");
    //     setValue("stateCode", stateCode || "");
    //     setValue("addresses", addresses || [{ address1: "", address2: "", pin: "", city: "", state: "", country: "" }]);
    //   }, [
    //     contactName,
    //     contactCode,
    //     mobileNumber,
    //     otherMobileNumber,
    //     landPhone,
    //     email,
    //     otherEmail,
    //     descr,
    //     gstin,
    //     stateCode,
    //     addresses,
    //     setValue,
    //   ]);

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-auto min-w-72 max-w-96"
        >
            {/* Contact Information */}
            <label className="flex flex-col font-medium text-primary-400">
                <span className="font-bold">Contact Name <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. John Doe"
                    autoComplete="off"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                    {...register("contactName", {
                        required: Messages.errRequired,
                        validate: {
                            valdateContactName: checkNoSpecialChar
                        }
                    })}
                />
                {errors.contactName && <WidgetFormErrorMessage errorMessage={errors.contactName.message} />}
            </label>

            <label className="flex flex-col font-medium text-primary-400">
                <span className="font-bold">Contact Code <WidgetAstrix /></span>
                <input
                    type="text"
                    placeholder="e.g. johnDoe"
                    autoComplete="off"
                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                    {...register("contactCode", {
                        required: Messages.errRequired,
                        validate: {
                            validateContactCode: checkNoSpaceOrSpecialChar
                        }
                    })}
                />
                {errors.contactCode && <WidgetFormErrorMessage errorMessage={errors.contactCode.message} />}
            </label>

            {/* Other fields as before */}

            {/* Addresses */}
            <div className="col-span-2">
                <div className="flex flex-col gap-2">
                    <span className="font-bold text-primary-400">Addresses</span>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-2 rounded-md">
                            <label className="flex flex-col font-medium text-primary-400">
                                <span>Address Line 1 <WidgetAstrix /></span>
                                <input
                                    type="text"
                                    placeholder="e.g. 123 Main St"
                                    autoComplete="off"
                                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
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

                            <label className="flex flex-col font-medium text-primary-400">
                                <span>Address Line 2</span>
                                <input
                                    type="text"
                                    placeholder="e.g. Suite 100"
                                    autoComplete="off"
                                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
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

                            <label className="flex flex-col font-medium text-primary-400">
                                <span>Pin <WidgetAstrix /></span>
                                <input
                                    type="text"
                                    placeholder="e.g. 700043"
                                    autoComplete="off"
                                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
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

                            <label className="flex flex-col font-medium text-primary-400">
                                <span>City <WidgetAstrix /></span>
                                <input
                                    type="text"
                                    placeholder="e.g. Kolkata"
                                    autoComplete="off"
                                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                                    {...register(`addresses.${index}.city`, {
                                        required: Messages.errRequired
                                    })}
                                />
                                {errors.addresses?.[index]?.city && (
                                    <WidgetFormErrorMessage errorMessage={errors.addresses[index].city.message} />
                                )}
                            </label>

                            <label className="flex flex-col font-medium text-primary-400">
                                <span>State <WidgetAstrix /></span>
                                <input
                                    type="text"
                                    placeholder="e.g. West Bengal"
                                    autoComplete="off"
                                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                                    {...register(`addresses.${index}.state`, {
                                        required: Messages.errRequired
                                    })}
                                />
                                {errors.addresses?.[index]?.state && (
                                    <WidgetFormErrorMessage errorMessage={errors.addresses[index].state.message} />
                                )}
                            </label>

                            <label className="flex flex-col font-medium text-primary-400">
                                <span>Country</span>
                                <input
                                    type="text"
                                    placeholder="e.g. India"
                                    autoComplete="off"
                                    className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                                    {...register(`addresses.${index}.country`)}
                                />
                            </label>

                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 text-sm self-end sm:col-span-2">
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => append({ address1: "", address2: "", pin: "", city: "", state: "", country: "" })}
                        className="text-blue-500 text-sm">
                        Add Address
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="col-span-2">
                <WidgetButtonSubmitFullWidth label="Save" disabled={isSubmitting} />
            </div>
        </form>

    );

    async function onSubmit(data: any) {
        // Perform save or update logic
        console.log(data);
        // await loadData();
    }
}

export type ContactAndAddressesType = {
    props: {
        accId: number
    }
}

// Types
export type AdminNewEditContactType = {
    contactName?: string;
    contactCode?: string;
    mobileNumber?: string;
    otherMobileNumber?: string;
    landPhone?: string;
    email?: string;
    otherEmail?: string;
    descr?: string;
    gstin?: string;
    stateCode?: string;
    addresses?: AddressType[];
    id?: string;
    loadData: () => void;
};

export type AddressType = {
    address1: string;
    address2: string;
    pin: string;
    city: string;
    state: string;
    country: string;
};

// <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-auto min-w-72 max-w-96">
//     {/* Contact Information */}
//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">Contact Name <WidgetAstrix /></span>
//         <input
//             type="text"
//             placeholder="e.g. John Doe"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("contactName", {
//                 required: Messages.errRequired,
//                 validate: {
//                     valdateContactName: checkNoSpecialChar
//                 }
//             })}
//         />
//         {errors.contactName && <WidgetFormErrorMessage errorMessage={errors.contactName.message} />}
//     </label>

//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">Contact Code <WidgetAstrix /></span>
//         <input
//             type="text"
//             placeholder="e.g. johnDoe"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("contactCode", {
//                 required: Messages.errRequired,
//                 validate: {
//                     validateContactCode: checkNoSpaceOrSpecialChar
//                 }
//             })}
//         />
//         {errors.contactCode && <WidgetFormErrorMessage errorMessage={errors.contactCode.message} />}
//     </label>

//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">Mobile Number</span>
//         <input
//             type="text"
//             placeholder="e.g. 1234567890"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("mobileNumber", {
//                 validate: {
//                     validateMobileNo: checkMobileNo
//                 }
//             })}
//         />
//         {errors.mobileNumber && <WidgetFormErrorMessage errorMessage={errors.mobileNumber.message} />}
//     </label>

//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">Other Mobile Number</span>
//         <input
//             type="text"
//             placeholder="e.g. 1234567890"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("otherMobileNumber", {
//                 validate: {
//                     validateOtherMobileNo: checkMobileNo
//                 }
//             })}
//         />
//         {errors.otherMobileNumber && <WidgetFormErrorMessage errorMessage={errors.otherMobileNumber.message} />}
//     </label>

//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">Land Phone</span>
//         <input
//             type="text"
//             placeholder="e.g. 1234567890"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("landPhone",)}
//         />
//         {/* {errors.otherMobileNumber && <WidgetFormErrorMessage errorMessage={errors.otherMobileNumber.message} />} */}
//     </label>

//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">Email</span>
//         <input
//             type="text"
//             placeholder="e.g. a@c.com"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("email", {
//                 validate: {
//                     validateEmail: checkEmail
//                 }
//             })}
//         />
//         {errors.email && <WidgetFormErrorMessage errorMessage={errors.email.message} />}
//     </label>

//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">Other Email</span>
//         <input
//             type="text"
//             placeholder="e.g. a@c.com"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("otherEmail", {
//                 validate: {
//                     validateOtherEmail: checkEmail
//                 }
//             })}
//         />
//         {errors.otherEmail && <WidgetFormErrorMessage errorMessage={errors.otherEmail.message} />}
//     </label>

//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">Description</span>
//         <input
//             type="text"
//             placeholder="Description"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("descr",)}
//         />
//     </label>

//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">GSTIN Number</span>
//         <input
//             type="text"
//             placeholder="e.g. 22AAAAA0000A1Z5"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("gstin", {
//                 validate: {
//                     validateGstin: checkGstin
//                 }
//             })}
//         />
//         {errors.gstin && <WidgetFormErrorMessage errorMessage={errors.gstin.message} />}
//     </label>

//     <label className="flex flex-col font-medium text-primary-400">
//         <span className="font-bold">State Code</span>
//         <input
//             type="text"
//             placeholder="e.g. 19"
//             autoComplete="off"
//             className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//             {...register("stateCode", {
//                 validate: {
//                     validateGstStateCode: checkGstStateCode
//                 }
//             })}
//         />
//         {errors.stateCode && <WidgetFormErrorMessage errorMessage={errors.stateCode.message} />}
//     </label>

//     {/* Addresses */}
//     <div className="flex flex-col gap-2">
//         <span className="font-bold text-primary-400">Addresses</span>
//         {fields.map((field, index) => (
//             <div key={field.id} className="flex flex-col gap-2 border p-2 rounded-md">
//                 <label className="flex flex-col font-medium text-primary-400">
//                     <span>Address Line 1 <WidgetAstrix /></span>
//                     <input
//                         type="text"
//                         placeholder="e.g. 123 Main St"
//                         autoComplete="off"
//                         className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//                         {...register(`addresses.${index}.address1`, {
//                             required: Messages.errRequired,
//                             validate: {
//                                 validateAddress1: checkNoSpecialChar
//                             }
//                         })}
//                     />
//                     {errors.addresses?.[index]?.address1 && (
//                         <WidgetFormErrorMessage errorMessage={errors.addresses[index].address1.message} />
//                     )}
//                 </label>

//                 <label className="flex flex-col font-medium text-primary-400">
//                     <span>Address Line 2</span>
//                     <input
//                         type="text"
//                         placeholder="e.g. Suite 100"
//                         autoComplete="off"
//                         className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//                         {...register(`addresses.${index}.address2`, {
//                             validate: {
//                                 validateAddress2: checkNoSpecialChar
//                             }
//                         })}
//                     />
//                     {errors.addresses?.[index]?.address2 && (
//                         <WidgetFormErrorMessage errorMessage={errors.addresses[index].address2.message} />
//                     )}
//                 </label>

//                 <label className="flex flex-col font-medium text-primary-400">
//                     <span>Pin <WidgetAstrix /></span>
//                     <input
//                         type="text"
//                         placeholder="e.g. 700043"
//                         autoComplete="off"
//                         className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//                         {...register(`addresses.${index}.pin`, {
//                             required: Messages.errRequired,
//                             validate: {
//                                 validatePinCode: checkPinCode
//                             }
//                         })}
//                     />
//                     {errors.addresses?.[index]?.pin && (
//                         <WidgetFormErrorMessage errorMessage={errors.addresses[index].pin.message} />
//                     )}
//                 </label>

//                 <label className="flex flex-col font-medium text-primary-400">
//                     <span>City <WidgetAstrix /></span>
//                     <input
//                         type="text"
//                         placeholder="e.g. Kolkata"
//                         autoComplete="off"
//                         className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//                         {...register(`addresses.${index}.city`, {
//                             required: Messages.errRequired
//                         })}
//                     />
//                     {errors.addresses?.[index]?.city && (
//                         <WidgetFormErrorMessage errorMessage={errors.addresses[index].city.message} />
//                     )}
//                 </label>

//                 <label className="flex flex-col font-medium text-primary-400">
//                     <span>State <WidgetAstrix /></span>
//                     <input
//                         type="text"
//                         placeholder="e.g. West Bengal"
//                         autoComplete="off"
//                         className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//                         {...register(`addresses.${index}.state`, {
//                             required: Messages.errRequired
//                         })}
//                     />
//                     {errors.addresses?.[index]?.state && (
//                         <WidgetFormErrorMessage errorMessage={errors.addresses[index].state.message} />
//                     )}
//                 </label>

//                 <label className="flex flex-col font-medium text-primary-400">
//                     <span>Country</span>
//                     <input
//                         type="text"
//                         placeholder="e.g. India"
//                         autoComplete="off"
//                         className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
//                         {...register(`addresses.${index}.country`)}
//                     />
//                 </label>

//                 <button
//                     type="button"
//                     onClick={() => remove(index)}
//                     className="text-red-500 text-sm self-end">
//                     Remove
//                 </button>
//             </div>
//         ))}
//         <button
//             type="button"
//             onClick={() => append({ address1: "", address2: "", pin: "", city: "", state: "", country: "" })}
//             className="text-blue-500 text-sm">
//             Add Address
//         </button>
//     </div>

//     {/* Save Button */}
//     <WidgetButtonSubmitFullWidth label="Save" disabled={isSubmitting} />
// </form>