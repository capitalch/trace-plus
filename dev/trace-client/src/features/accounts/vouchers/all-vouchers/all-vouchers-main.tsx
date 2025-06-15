import { FormProvider, useForm } from "react-hook-form";
import { AllVouchersCrown } from "./all-vouchers-crown";
import { VourcherType } from "../voucher-slice";
import { VoucherTypeOptions } from "./voucher-type-options";
import { VoucherCommonHeader } from "./voucher-common-header";
import { format } from "date-fns";

export function AllVouchersMain() {

    const methods = useForm<VoucherFormDataType>(
        {
            defaultValues:
            {
                tranDate: format(new Date(), "yyyy-MM-dd"),
                voucherType: 'Payment'
            }
        });

    return (<FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col relative">
            <AllVouchersCrown className="absolute -top-22.5 right-6" />
            <VoucherTypeOptions className="absolute -top-14 right-6" />
            <VoucherCommonHeader/>
        </form>
    </FormProvider>)

    function onSubmit(data: VoucherFormDataType) {
        console.log(data)
    }
}

export type VoucherFormDataType = {
    autoRefNo: string
    remarks?: string
    tranDate: string
    userRefNo?: string
    voucherType: VourcherType
}