import { format } from "date-fns";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";
// import { VourcherType } from "../voucher-slice";
import { AllVouchersMain } from "./all-vouchers-main";
import { VoucherTypeOptions } from "../voucher-controls/voucher-type-options";
import { FormProvider, useForm } from "react-hook-form";
import { TraceDataObjectType, VourcherType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { RootStateType } from "../../../../app/store/store";
import { useSelector } from "react-redux";
import { AllVouchersView } from "./all-vouchers-view";

export function AllVouchers() {
    const instance = DataInstancesMap.allVouchers;
    const { branchId,/* buCode, dbName,*/ finYearId } = useUtilsInfo();
    const selectedVoucherType = useSelector((state: RootStateType) => state.vouchers.voucherType)
    const methods = useForm<VoucherFormDataType>(
        {
            mode: "onTouched",
            criteriaMode: "all",
            defaultValues: getDefaultVoucherForm()
        });
    const { watch, getValues } = methods;

    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllVouchersMain />
        },
        {
            label: "View",
            content: <AllVouchersView instance={instance} />
        }
    ];
    
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmitVoucher)} className="flex flex-col">
                <CompAccountsContainer className=" relative">
                    <label className="mt-1 text-md font-bold text-primary-500">
                        All Vouchers
                    </label>
                    {/* Sticky voucher type selector */}
                    <div className="sticky top-0 right-6 self-end z-5">
                        <VoucherTypeOptions className="absolute right-0 top-2 rounded" />
                    </div>
                    <CompTabs tabsInfo={tabsInfo} instance={instance} className="mt-2" />
                </CompAccountsContainer>
            </form>
        </FormProvider>
    )

    function getDefaultVoucherForm() {
        return ({
            tranDate: format(new Date(), "yyyy-MM-dd"),
            userRefNo: null,
            remarks: null,
            tranTypeId: 2,
            finYearId: finYearId,
            branchId: branchId,
            posId: 1,
            autoRefNo: '',
            voucherType: 'Payment' as VourcherType,
            isGst: false,
            creditEntries: [getDefaultEntry('C')],
            debitEntries: [getDefaultEntry('D')],
        })
    }

    function getDefaultEntry(entryType: 'D' | 'C') {
        return ({
            accId: null,
            remarks: null,
            dc: entryType,
            amount: 0,
            tranHeaderId: undefined,
            lineRefNo: null,
            instrNo: null,
            gst: undefined
        })
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
            tranDate: getValues("tranDate"),
            userRefNo: getValues("userRefNo"),
            remarks: getValues("remarks"),
            tranTypeId: Utils.getTranTypeId(selectedVoucherType),
            finYearId: finYearId,
            branchId: branchId,
            posId: 1,
            autoRefNo: getValues("autoRefNo") || undefined,
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
            remarks: entry.remarks || null,
            dc: entry.dc,
            amount: entry.amount,
            tranHeaderId: entry.tranHeaderId || undefined,
            lineRefNo: entry.lineRefNo || null,
            instrNo: entry.instrNo || null,
            details: getExtGstTranDDetails(entry),
        }));
        const debits: XDataObjectType[] = debitEntries.map((entry) => ({
            id: entry.id || undefined,
            accId: entry.accId || null,
            remarks: entry.remarks || null,
            dc: entry.dc,
            amount: entry.amount,
            tranHeaderId: entry.tranHeaderId || undefined,
            lineRefNo: entry.lineRefNo || null,
            instrNo: entry.instrNo || null,
            details: getExtGstTranDDetails(entry),
        }));
        return [...credits, ...debits];
    }

    function getExtGstTranDDetails(entry: VoucherLineItemEntryDataType): TraceDataObjectType | undefined {
        if (!(getValues("isGst") && entry.gst?.rate)) return undefined;
        return {
            tableName: DatabaseTablesMap.ExtGstTranD,
            fkeyName: "tranDetailsId",
            xData: {
                id: entry?.gst?.id || undefined,
                gstin: entry?.gst?.gstin || null,
                rate: entry?.gst?.rate || 0,
                cgst: entry?.gst?.cgst || 0,
                sgst: entry?.gst?.sgst || 0,
                igst: entry?.gst?.igst || 0,
                isInput: entry.dc === 'D' ? true : false,
                tranDetailsId: entry.id || undefined,
                hsn: entry?.gst?.hsn || null,
            }
        };
    }

}

export type VoucherFormDataType = //TranHeaderType
    {
        id?: number;
        tranDate: string;
        userRefNo?: string | null;
        remarks?: string | null;
        tags?: string | null;
        jData?: object | null;
        tranTypeId: number;
        finYearId: number;
        branchId: number;
        posId?: number | null;
        autoRefNo: string;

        isGst: boolean
        voucherType: VourcherType
        creditEntries: VoucherLineItemEntryDataType[]
        debitEntries: VoucherLineItemEntryDataType[]
    }

type VoucherLineItemEntryDataType = {
    id?: number;
    accId: string | null;
    remarks?: string | null;
    dc: 'D' | 'C';
    amount: number;
    tranHeaderId?: number;
    lineRefNo?: string | null;
    instrNo?: string | null;
    gst?: GstDataType
}

type GstDataType = {
    id?: number;
    gstin?: string | null;
    rate?: number | null;
    cgst: number;
    sgst: number;
    igst: number;
    isInput?: boolean;
    tranDetailsId?: number;
    hsn?: string | null;
    isIgst: boolean;
}

// {
//     autoRefNo: '',
//     tranDate: format(new Date(), "yyyy-MM-dd"),
//     voucherType: 'Payment',
//     isGst: false,
//     creditEntries: [{
//         accId: null,
//         amount: 0,
//         dc: 'C',
//         id: undefined,
//         gstRate: 0,
//         hsn: null,
//         igst: 0,
//         sgst: 0,
//         cgst: 0,
//         instrNo: '',
//         tranHeaderId: undefined,
//         lineRefNo: '',
//         remarks: '',
//     }],
//     debitEntries: [{
//         accId: null,
//         amount: 0,
//         dc: 'D',
//         id: undefined,
//         gstRate: 0,
//         hsn: null,
//         igst: 0,
//         sgst: 0,
//         cgst: 0,
//         instrNo: '',
//         tranHeaderId: undefined,
//         lineRefNo: '',
//         remarks: '',
//     }]
// }