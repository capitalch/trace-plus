import { UseFormReturn } from "react-hook-form";
import _ from 'lodash';
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { PurchaseFormDataType } from "./all-purchases";
import { ExtGstTranDType, TraceDataObjectType, TranDType, XDataObjectType } from "../../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../../utils/utils";
import { AllTables } from "../../../../../app/maps/database-tables-map";

export function useAllPurchasesSubmit(methods: UseFormReturn<PurchaseFormDataType>, tranTypeId = Utils.getTranTypeId('Purchase')) {
    const { branchId, finYearId } = useUtilsInfo();
    const { getValues } = methods;
    const purchaseEditData = getValues('purchaseEditData')

    function getTranHData(): XDataObjectType {
        return {
            id: getValues("id") || undefined,
            tranDate: getValues("tranDate"),
            userRefNo: getValues("userRefNo"),
            remarks: getValues("remarks"),
            tranTypeId: tranTypeId, //Utils.getTranTypeId('Purchase'),
            finYearId,
            branchId,
            posId: 1,
            autoRefNo: getValues("autoRefNo") || undefined,
            xDetails: getTranDDetails(),
        };
    }

    function getTranDDetails(): TraceDataObjectType[] {
        return [{
            tableName: AllTables.TranD.name,
            fkeyName: "tranHeaderId",
            xData: getTranDData(),
        }];
    }

    function getTranDData(): XDataObjectType[] {
        const xDetails: TraceDataObjectType[] = [];

        const extGst = getExtGstTranDDetails();
        const lineItems = getSalePurchaseDetailsDetails();

        if (!_.isEmpty(extGst)) xDetails.push(extGst);
        if (!_.isEmpty(lineItems)) xDetails.push(lineItems);

        const totalAmount = getValues('totalInvoiceAmount');
        const tranD: TranDType[] = purchaseEditData?.tranD || []
        const debit: XDataObjectType = {
            id: tranD.find(item => item.dc === 'D')?.id,
            accId: getValues('debitAccId'),
            dc: 'D',
            amount: totalAmount,
            ...(xDetails.length > 0 && { xDetails }),
        };

        const credit: XDataObjectType = {
            id: tranD.find(item => item.dc === 'C')?.id,
            accId: getValues('creditAccId'),
            dc: 'C',
            amount: totalAmount,
        };

        return [debit, credit];
    }

    function getExtGstTranDDetails(): TraceDataObjectType | undefined {
        const extGstTranD: ExtGstTranDType | null = purchaseEditData?.extGstTranD || null
        return {
            tableName: AllTables.ExtGstTranD.name,
            fkeyName: 'tranDetailsId',
            xData: {
                id: extGstTranD?.id,
                gstin: getValues('gstin'),
                cgst: getValues('totalCgst'),
                sgst: getValues('totalSgst'),
                igst: getValues('totalIgst'),
                isInput: (tranTypeId === 5) ? true : false,
            },
        };
    }

    function getSalePurchaseDetailsDetails(): TraceDataObjectType {
        const purchaseLineItems = getValues('purchaseLineItems') || [];

        const xData: XDataObjectType[] = purchaseLineItems.map(entry => ({
            id: entry.id,
            productId: entry.productId,
            qty: entry.qty,
            price: entry.price,
            priceGst: entry.priceGst,
            discount: entry.discount,
            cgst: entry.cgst,
            sgst: entry.sgst,
            igst: entry.igst,
            amount: entry.amount,
            hsn: entry.hsn,
            gstRate: entry.gstRate,
            jData: getJData(entry) //JSON.stringify({ serialNumbers: entry.serialNumbers || '', remarks: entry.lineRemarks })
        }));
        const deletedIds = getValues("deletedIds") || [];
        return {
            tableName: AllTables.SalePurchaseDetails.name,
            fkeyName: 'tranDetailsId',
            deletedIds: deletedIds,
            xData,
        };
    }

    function getJData(entry: XDataObjectType) {
        if (entry.remarks || entry.serialNumbers) {
            return (JSON.stringify({ serialNumbers: entry.serialNumbers || '', remarks: entry.lineRemarks }))
        }
        return (null)
    }

    return { getTranHData };
}