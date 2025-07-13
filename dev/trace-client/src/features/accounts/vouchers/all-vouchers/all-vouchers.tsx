import { format } from "date-fns";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { AllVouchersMain } from "./all-vouchers-main";
import { VoucherTypeOptions } from "../voucher-controls/voucher-type-options";
import { FormProvider, useForm } from "react-hook-form";
import { TraceDataObjectType, VourcherType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { AppDispatchType, } from "../../../../app/store/store";
import { useDispatch } from "react-redux";
import { AllVouchersView } from "./all-vouchers-view";
import { setActiveTabIndex } from "../../../../controls/redux-components/comp-slice";
// import { setValue } from "@syncfusion/ej2-base";

export function AllVouchers() {
    const dispatch: AppDispatchType = useDispatch()
    const instance = DataInstancesMap.allVouchers;
    const { branchId, buCode, dbName, finYearId } = useUtilsInfo();
    const methods = useForm<VoucherFormDataType>(
        {
            mode: "onTouched",
            criteriaMode: "all",
            defaultValues: getDefaultVoucherFormValues()
        });
    const { watch, getValues, setValue, reset } = methods;
    const extendedMethods = { ...methods, xReset }
    const voucherType = watch('voucherType')
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
        <FormProvider {...extendedMethods}>
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

    function getDefaultVoucherFormValues() {
        return ({
            id: undefined,
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
            deletedIds: [],
            showGstInHeader: true,
        })
    }

    function getDefaultEntry(entryType: 'D' | 'C') {
        return ({
            id: undefined,
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
            const deletedIds = [...xData.deletedIds]
            xData.deletedIds = undefined
            await Utils.doValidateDebitCreditAndUpdate({
                buCode: buCode || "",
                dbName: dbName || "",
                tableName: DatabaseTablesMap.TranH,
                xData: xData,
                deletedIds: deletedIds
            });
            if (watch('id')) {
                dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 1 })) // Switch to the second tab (Edit tab)
            }
            xReset()
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
            tranTypeId: Utils.getTranTypeId(voucherType),
            finYearId: finYearId,
            branchId: branchId,
            posId: 1,
            autoRefNo: getValues("autoRefNo") || undefined,
            deletedIds: getValues("deletedIds") || undefined,
            xDetails: getTranDDeails(),
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
            xDetails: getExtGstTranDDetails(entry),
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
            xDetails: getExtGstTranDDetails(entry),
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

    function xReset() {
        // retain voucherType
        const vchrType = watch('voucherType')
        reset(getDefaultVoucherFormValues())
        if (vchrType) {
            setValue('voucherType', vchrType)
        }
    }

}

export type VoucherFormDataType =
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

        isGst: boolean;
        voucherType: VourcherType;
        creditEntries: VoucherLineItemEntryDataType[];
        debitEntries: VoucherLineItemEntryDataType[];
        deletedIds: number[];
        showGstInHeader: boolean;
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
    tranDetailsId?: number;
}

type GstDataType = {
    id?: number;
    gstin?: string | null;
    rate?: number | null;
    cgst: number;
    sgst: number;
    igst: number;
    isInput?: boolean;
    hsn?: string | null;
    isIgst: boolean;
}