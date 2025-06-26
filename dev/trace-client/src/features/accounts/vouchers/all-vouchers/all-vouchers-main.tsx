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
import { TraceDataObjectType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";

export function AllVouchersMain() {
    const { branchId, buCode, dbName, finYearId } = useUtilsInfo();
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
    const { watch, getValues } = methods;
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmitVoucher)} className="flex flex-col relative">
                <AllVouchersCrown className="absolute -top-22.5 right-6" />

                {/* Sticky Header Wrapper */}
                <div className="sticky top-0 z-50 flex justify-end bg-white border-b px-4 py-2">
                    <VoucherTypeOptions />
                </div>
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

    async function finalizeAndSubmitVoucher(data: VoucherFormDataType) {
        console.log(data)
        try {
            const xData: XDataObjectType = getTranHeaderRow();
            await Utils.doGenericUpdate({
                buCode: buCode || "",
                dbName: dbName || "",
                tableName: DatabaseTablesMap.TranH,
                xData: xData,
            });
            Utils.showSaveMessage();

        } catch (e) {
            console.error(e);
        }
    }

    function getTranHeaderRow(): XDataObjectType {
        return {
            id: (getValues("id")) || undefined,
            autoRefNo: getValues("autoRefNo"),
            branchId,
            finYearId,
            jData: "{}",
            posId: 1,
            remarks: getValues("remarks"),
            tranDate: getValues("tranDate"),
            tranTypeId: getTranTypeId(),
            userRefNo: getValues("userRefNo"),
            details: getTranDetailsRows(),
        };
    }

    function getTranTypeId() {
        const tranTypeIdMap: Record<VourcherType, number> = {
            Payment: 2,
            Receipt: 3,
            Contra: 6,
            Journal: 1
        };
        return tranTypeIdMap[selectedVoucherType]

    }

    function getTranDetailsRows() {
        const details: TraceDataObjectType[] = [{
            tableName: DatabaseTablesMap.TranD,
            fkeyName: "tranHeaderId",
            xData: getTranDetailsData()
        }];
        return (details)
    }

    function getTranDetailsData(): XDataObjectType[] {
        const creditEntries = watch("creditEntries") || [];
        const debitEntries = watch("debitEntries") || [];
        const credits: XDataObjectType[] = creditEntries.map((entry) => ({
            id: entry.entryId || undefined,
        }));
        const debits: XDataObjectType[] = debitEntries.map((entry) => ({
            id: entry.entryId || undefined,
        }));
        return [...credits, ...debits];
    }
}



export type VoucherFormDataType = //TranHeaderType
    {
        id?: string
        autoRefNo: string
        gstin?: string
        isGst: boolean
        remarks?: string
        tranDate: string
        userRefNo?: string
        voucherType: VourcherType
        creditEntries: VoucherLineItemEntryDataType[]
        debitEntries: VoucherLineItemEntryDataType[]
    }

type VoucherLineItemEntryDataType = {
    accId: string | null;
    amount: number;
    dc: 'D' | 'C';
    entryId: number | null;
    gstRate?: number | null;
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