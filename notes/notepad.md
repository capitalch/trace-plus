## Different steps for Hierarchy accounts
- Step 1: Basic without recursion: Array_agg for children
- Step 2: With recursion array_agg
- Step 3: Basic without recursion json_agg
- Step 4: With recursion json_agg

I have following tables in an accounting system PostgreSql. I want to create trial balance:
1) AccM: As Accounts Master: id, accCode, accName, accType(L forliability, A for Asset, E for expences, I for Income), parentId
2) AccOpBal: For opening balances of accounts: id, accId, dc(D for Debits, C for Credits), amount
3) TranD: For transaction details: id, accId, dc (D for Debits, C for Credits), amount
Create a trial balance query to be consumed by Syncfusion TreeGrid. It should be hierarchal. The parentId column defines the hierarchy in AccM table


import { useForm, useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import clsx from "clsx";
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width";
import _ from "lodash";

export function AdminNewEditContact({
  contactName,
  contactCode,
  mobileNumber,
  otherMobileNumber,
  landPhone,
  email,
  otherEmail,
  descr,
  gstin,
  stateCode,
  addresses,
  id,
  loadData
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
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
    name: "addresses",
  });

  useEffect(() => {
    setValue("contactName", contactName || "");
    setValue("contactCode", contactCode || "");
    setValue("mobileNumber", mobileNumber || "");
    setValue("otherMobileNumber", otherMobileNumber || "");
    setValue("landPhone", landPhone || "");
    setValue("email", email || "");
    setValue("otherEmail", otherEmail || "");
    setValue("descr", descr || "");
    setValue("gstin", gstin || "");
    setValue("stateCode", stateCode || "");
    setValue("addresses", addresses || [{ address1: "", address2: "", pin: "", city: "", state: "", country: "" }]);
  }, [
    contactName,
    contactCode,
    mobileNumber,
    otherMobileNumber,
    landPhone,
    email,
    otherEmail,
    descr,
    gstin,
    stateCode,
    addresses,
    setValue,
  ]);

  async function onSubmit(data) {
    // Perform save or update logic
    console.log(data);
    await loadData();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-auto min-w-72">
      {/* Contact Information */}
      <label className="flex flex-col font-medium text-primary-400">
        <span className="font-bold">Contact Name <WidgetAstrix /></span>
        <input
          type="text"
          placeholder="e.g. John Doe"
          autoComplete="off"
          className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
          {...register("contactName", { required: "Contact Name is required." })}
        />
        {errors.contactName && <WidgetFormErrorMessage errorMessage={errors.contactName.message} />}
      </label>

      <label className="flex flex-col font-medium text-primary-400">
        <span className="font-bold">Contact Code</span>
        <input
          type="text"
          placeholder="e.g. C001"
          autoComplete="off"
          className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
          {...register("contactCode")}
        />
      </label>

      <label className="flex flex-col font-medium text-primary-400">
        <span className="font-bold">Mobile Number <WidgetAstrix /></span>
        <input
          type="text"
          placeholder="e.g. +1234567890"
          autoComplete="off"
          className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
          {...register("mobileNumber", { required: "Mobile Number is required." })}
        />
        {errors.mobileNumber && <WidgetFormErrorMessage errorMessage={errors.mobileNumber.message} />}
      </label>

      {/* Addresses */}
      <div className="flex flex-col gap-2">
        <span className="font-bold text-primary-400">Addresses</span>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-2 border p-2 rounded-md">
            <label className="flex flex-col font-medium text-primary-400">
              <span>Address Line 1</span>
              <input
                type="text"
                placeholder="e.g. 123 Main St"
                autoComplete="off"
                className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                {...register(`addresses.${index}.address1`)}
              />
            </label>

            <label className="flex flex-col font-medium text-primary-400">
              <span>Address Line 2</span>
              <input
                type="text"
                placeholder="e.g. Suite 100"
                autoComplete="off"
                className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                {...register(`addresses.${index}.address2`)}
              />
            </label>

            <label className="flex flex-col font-medium text-primary-400">
              <span>City</span>
              <input
                type="text"
                placeholder="e.g. New York"
                autoComplete="off"
                className="mt-1 rounded-md border-[1px] border-primary-200 px-2"
                {...register(`addresses.${index}.city`)}
              />
            </label>

            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 text-sm self-end">
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

      {/* Save Button */}
      <WidgetButtonSubmitFullWidth label="Save" disabled={isSubmitting} />
    </form>
  );
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
