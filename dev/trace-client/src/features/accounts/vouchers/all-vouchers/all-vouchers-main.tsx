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
    const { branchId,/* buCode, dbName,*/ finYearId } = useUtilsInfo();
    const instance = DataInstancesMap.allVouchers
    const selectedVoucherType = useSelector((state: RootStateType) => state.vouchers.voucherType)
    const methods = useForm<VoucherFormDataType>(
        {
            mode: "onTouched",
            criteriaMode: "all",
            defaultValues:
            {
                autoRefNo: '',
                tranDate: format(new Date(), "yyyy-MM-dd"),
                voucherType: 'Payment',
                isGst: false,
                creditEntries: [{
                    accId: null,
                    amount: 0,
                    dc: 'C',
                    id: undefined,
                    gstRate: 0,
                    hsn: null,
                    igst: 0,
                    sgst: 0,
                    cgst: 0,
                    instrNo: '',
                    tranHeaderId: undefined,
                    lineRefNo: '',
                    remarks: '',
                }],
                debitEntries: [{
                    accId: null,
                    amount: 0,
                    dc: 'D',
                    id: undefined,
                    gstRate: 0,
                    hsn: null,
                    igst: 0,
                    sgst: 0,
                    cgst: 0,
                    instrNo: '',
                    tranHeaderId: undefined,
                    lineRefNo: '',
                    remarks: '',
                }]
            }
        });
    const { watch, getValues } = methods;
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmitVoucher)} className="flex flex-col relative">
                <AllVouchersCrown className="absolute -top-22.5 right-6" />

                {/* Sticky Header Wrapper */}
                {/* <div className="absolute -top-14 right-6 z-50 flex justify-end pl-4">
                    <VoucherTypeOptions />
                </div> */}
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
            const xData: XDataObjectType = getTranHData();
            console.log("xData", JSON.stringify(xData));
            // await Utils.doGenericUpdate({
            //     buCode: buCode || "",
            //     dbName: dbName || "",
            //     tableName: DatabaseTablesMap.TranH,
            //     xData: xData,
            // });
            Utils.showSaveMessage();

        } catch (e) {
            console.error(e);
        }
    }

    function getTranHData(): XDataObjectType {
        return {
            id: (getValues("id")) || undefined,
            autoRefNo: getValues("autoRefNo") || undefined,
            branchId,
            finYearId,
            jData: "{}",
            posId: 1,
            remarks: getValues("remarks"),
            tranDate: getValues("tranDate"),
            tranTypeId: getTranTypeId(),
            userRefNo: getValues("userRefNo"),
            details: getTranDDeails(),
        };
    }

    function getTranDDeails() {
        const details: TraceDataObjectType[] = [{
            tableName: DatabaseTablesMap.TranD,
            fkeyName: "tranHeaderId",
            xData: getTranDData()
        }];
        return (details)
    }

    function getTranDData(): XDataObjectType[] {
        const creditEntries = watch("creditEntries") || [];
        const debitEntries = watch("debitEntries") || [];
        const credits: XDataObjectType[] = creditEntries.map((entry) => ({
            id: entry.id || undefined,
            accId: entry.accId || null,
            amount: entry.amount,
            dc: entry.dc,
            tranHeaderId: entry.tranHeaderId || undefined,
            instrNo: entry.instrNo || null,
            lineRefNo: entry.lineRefNo || null,
            lineRemarks: entry.remarks || null,
            details: getExtGstTranDDetails(entry),
            tranheaderId: entry.tranHeaderId || undefined
        }));
        const debits: XDataObjectType[] = debitEntries.map((entry) => ({
            id: entry.id || undefined,
            accId: entry.accId || null,
            amount: entry.amount,
            dc: entry.dc,
            tranHeaderId: entry.tranHeaderId || undefined,
            instrNo: entry.instrNo || null,
            lineRefNo: entry.lineRefNo || null,
            remarks: entry.remarks || null,
            details: getExtGstTranDDetails(entry),
            tranheaderId: entry.tranHeaderId || undefined
        }));
        return [...credits, ...debits];
    }

    function getExtGstTranDDetails(entry: VoucherLineItemEntryDataType): TraceDataObjectType | undefined {
        if (!(getValues("isGst") && entry.gstRate)) return undefined;
        return {
            tableName: DatabaseTablesMap.ExtGstTranD,
            fkeyName: "tranDetailId",
            xData: {
                id: entry.gstId || undefined,
                gstin: getValues("gstin") || null,
                rate: entry.gstRate || 0,
                cgst: entry.cgst || 0,
                sgst: entry.sgst || 0,
                igst: entry.igst || 0,
                isInput: entry.dc === 'D' ? true : false,
                tranDetailId: entry.id || undefined,
                hsn: entry.hsn || null,
            }
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
}

export type VoucherFormDataType = //TranHeaderType
    {
        id?: number
        autoRefNo: string
        gstin?: string
        isGst: boolean
        remarks: string | null
        tranDate: string
        userRefNo: string | null
        voucherType: VourcherType
        creditEntries: VoucherLineItemEntryDataType[]
        debitEntries: VoucherLineItemEntryDataType[]
    }

type VoucherLineItemEntryDataType = {
    id?: number;
    accId: string | null;
    amount: number;
    dc: 'D' | 'C';
    gstId?: number;
    gstRate?: number;
    hsn?: number | null;
    isIgst?: boolean;
    igst?: number;
    sgst?: number;
    cgst?: number;
    instrNo: string | null;
    lineRefNo: string | null;
    remarks: string | null;
    tranHeaderId?: number;
}