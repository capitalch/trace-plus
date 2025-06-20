import { FormProvider, useForm } from "react-hook-form";
import { AllVouchersCrown } from "./all-vouchers-crown";
import { VoucherTypeOptions } from "./voucher-type-options";
import { VoucherCommonHeader } from "./voucher-common-header";
import { format } from "date-fns";
import { PaymentVoucher } from "./payment-voucher";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store/store";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { VourcherType } from "../voucher-slice";

export function AllVouchersMain() {
    const instance = DataInstancesMap.allVouchers
    const selectedVoucherType = useSelector((state: RootStateType) => state.vouchers.voucherType)
    const methods = useForm<VoucherFormDataType>(
        {
            mode: "onTouched",
            criteriaMode: "all",
            defaultValues:
            {
                tranDate: format(new Date(), "yyyy-MM-dd"),
                voucherType: 'Payment',
                isGst: false,
                creditEntries: [{
                    accId: null,
                    amount: 0,
                    dc: 'C',
                    entryId: null,
                    gstRate: 0,
                    hsn: null,
                    igst: 0,
                    sgst: 0,
                    cgst: 0,
                    instrNo: '',
                    tranHeaderId: null,
                    lineRefNo: '',
                    lineRemarks: ''
                }],
                debitEntries: [{
                    accId: null,
                    amount: 0,
                    dc: 'D',
                    entryId: null,
                    gstRate: 0,
                    hsn: null,
                    igst: 0,
                    sgst: 0,
                    cgst: 0,
                    instrNo: '',
                    tranHeaderId: null,
                    lineRefNo: '',
                    lineRemarks: ''
                }]
            }
        });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col relative">
                <AllVouchersCrown className="absolute -top-22.5 right-6" />
                <VoucherTypeOptions className="absolute -top-14 right-6" />
                <VoucherCommonHeader />
                {getVoucherTypeControl()}
            </form>
        </FormProvider>
    )

    function getVoucherTypeControl() {
        const logicObject: any = {
            Payment: <PaymentVoucher instance={instance} />
        }
        let Ret: any = <></>
        if (selectedVoucherType) {
            Ret = logicObject[selectedVoucherType]
        }
        return (Ret)
    }

    async function onSubmit(data: VoucherFormDataType) {
        console.log(data)
    }
}

export type VoucherFormDataType = //TranHeaderType
    {
        autoRefNo: string
        isGst: boolean
        remarks?: string
        tranDate: string
        userRefNo?: string
        voucherType: VourcherType
        creditEntries: VoucherEntryType[]
        debitEntries: VoucherEntryType[]
    }

type VoucherEntryType = {
    accId: string | null;
    amount: number;
    dc: 'D' | 'C';
    entryId: number | null;
    gstRate?: number |null;
    hsn?: number | null;
    isIgst?: boolean;
    igst?: number | null;
    sgst?: number | null;
    cgst?: number | null;
    instrNo: string;
    tranHeaderId: number | null;
    lineRefNo: string;
    lineRemarks: string;
}