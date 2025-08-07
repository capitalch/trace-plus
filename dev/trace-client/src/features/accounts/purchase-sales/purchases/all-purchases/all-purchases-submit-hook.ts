import { UseFormReturn } from "react-hook-form";
import _ from 'lodash';
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { PurchaseFormDataType } from "./all-purchases";
import { ExtGstTranDType, TraceDataObjectType, TranDType, XDataObjectType } from "../../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../../utils/utils";
import { AllTables } from "../../../../../app/maps/database-tables-map";

export function useAllPurchasesSubmit(methods: UseFormReturn<PurchaseFormDataType>) {
    const { branchId, finYearId } = useUtilsInfo();
    const { getValues } = methods;
    const purchaseEditData = getValues('purchaseEditData')
    // const isEditMode = Boolean(getValues('id'))

    function getTranHData(): XDataObjectType {
        return {
            id: getValues("id") || undefined,
            tranDate: getValues("tranDate"),
            userRefNo: getValues("userRefNo"),
            remarks: getValues("remarks"),
            tranTypeId: Utils.getTranTypeId('Purchase'),
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
            // deletedIds: [...deletedIds],
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
        // if (!getValues('isGstInvoice')) return;
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
                isInput: true,
                // rate: null,
                // hsn: null,
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
            jData: JSON.stringify({ serialNumbers: entry.serialNumbers || '', remarks: entry.lineRemarks })
        }));
        const deletedIds = getValues("deletedIds") || [];
        return {
            tableName: AllTables.SalePurchaseDetails.name,
            fkeyName: 'tranDetailsId',
            deletedIds: deletedIds,
            xData,
        };
    }

    return { getTranHData };
}