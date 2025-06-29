import clsx from "clsx";
import { voucherTypes } from "../../../../utils/global-types-interfaces-enums";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";

export function VoucherTypeOptions({ className }: VoucherTypeOptionsType) {

    const { register, watch } = useFormContext<VoucherFormDataType>();
    const selectedType = watch("voucherType");

    return (
        <div className={clsx("flex gap-2  items-center", className)}>
            <label className="text-red-500 font-semibold text-md w-20">
                {`${watch('id') ? 'Edit' : 'New'} Entry`}
            </label>
            {voucherTypes.map((type) => (
                <label
                    key={type}
                    className={clsx(
                        "cursor-pointer px-4 py-1 rounded-md border font-medium text-md",
                        selectedType === type
                            ? "bg-green-600 text-white border-blue-700"
                            : "bg-gray-50 text-gray-900 border-gray-300 hover:bg-green-400"
                    )}
                >
                    <input
                        type="radio"
                        value={type}
                        {...register("voucherType")}
                        className="sr-only"
                    />
                    {type}
                </label>
            ))}
        </div>
    )
}

type VoucherTypeOptionsType = {
    className?: string
}