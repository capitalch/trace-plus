import clsx from "clsx";
import { voucherTypes } from "../../../../utils/global-types-interfaces-enums";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store/store";
import { useEffect } from "react";

export function VoucherTypeOptions({ className }: VoucherTypeOptionsType) {
    const { register, watch, setValue, } = useFormContext<VoucherFormDataType>();
    const { resetDetails }: any = useFormContext()
    const voucherType = watch("voucherType");
    const activeTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[DataInstancesMap.allVouchers]?.activeTabIndex)

    const getLabel = () => {
        let label = ''
        if (activeTabIndex === 0) {
            label = `${watch('id') ? 'Edit' : 'New'} Entry`
        }
        return (label)
    }

    useEffect(() => {
        resetDetails()
        if (voucherType === 'Contra') {
            setValue('showGstInHeader', false)
        } else {
            setValue('showGstInHeader', true)
        }
    }, [voucherType, setValue]) // including resetArray in dependency array causes infinite loop

    return (
        <div className={clsx("flex gap-2  items-center", className)}>
            <label className="text-amber-400 font-semibold text-md w-20">
                {getLabel()}
            </label>
            {voucherTypes.map((type) => (
                <label
                    key={type}
                    className={clsx(
                        "cursor-pointer px-4 py-1 rounded-md border font-medium text-md",
                        voucherType === type
                            ? "bg-green-600 text-white border-blue-700"
                            : "bg-gray-50 text-gray-900 border-gray-300 hover:bg-green-400",
                        // isDisabled() && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input
                        type="radio"
                        value={type}
                        // disabled={isDisabled()}
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