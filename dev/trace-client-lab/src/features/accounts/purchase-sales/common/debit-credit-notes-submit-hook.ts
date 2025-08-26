import { UseFormReturn } from "react-hook-form";
import _ from 'lodash'
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { ExtGstTranDType, TraceDataObjectType, TranDType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { DebitCreditNoteFormDataType } from "../debit-notes/debit-notes";

export function useDebitCreditNotesSubmit(methods: UseFormReturn<DebitCreditNoteFormDataType>, tranTypeId = Utils.getTranTypeId('DebitNote')) {
    const { branchId, finYearId } = useUtilsInfo();
    const { getValues } = methods;
    const debitCreditNoteEditData = getValues('debitCreditNoteEditData')

    function getTranHData(): XDataObjectType {
        return {
            id: getValues("id") || undefined,
            tranDate: getValues("tranDate"),
            userRefNo: getValues("userRefNo"),
            remarks: getValues("remarks"),
            tranTypeId: tranTypeId,
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
        if (!_.isEmpty(extGst)) xDetails.push(extGst);

        const amount = getValues('amount');
        const tranD: TranDType[] = debitCreditNoteEditData?.tranD || []
        const debit: XDataObjectType = {
            id: tranD.find(item => item.dc === 'D')?.id,
            accId: getValues('debitAccId'),
            dc: 'D',
            amount: amount,
            lineRefNo: getValues('debitRefNo') || null,
            remarks: getValues('debitRemarks') || null
        };
        if (extGst && tranTypeId === Utils.getTranTypeId('CreditNote')) {
            debit.xDetails = [...xDetails]
        }

        const credit: XDataObjectType = {
            id: tranD.find(item => item.dc === 'C')?.id,
            accId: getValues('creditAccId'),
            dc: 'C',
            amount: amount,
            lineRefNo: getValues('creditRefNo') || null,
            remarks: getValues('creditRemarks') || null
        };
        if (extGst && tranTypeId === Utils.getTranTypeId('DebitNote')) {
            credit.xDetails = [...xDetails]
        }

        return [debit, credit];
    }

    function getExtGstTranDDetails(): TraceDataObjectType | undefined {
        const extGstTranD: ExtGstTranDType | null = debitCreditNoteEditData?.extGstTranD || null
        const isGstApplicable = getValues('isGstApplicable')
        return {
            tableName: AllTables.ExtGstTranD.name,
            fkeyName: 'tranDetailsId',
            deletedIds: getValues('deletedIds'), // for ExtGstTranD
            xData: isGstApplicable ? {
                id: extGstTranD?.id,
                gstin: getValues('gstin'),
                cgst: getValues('cgst'),
                sgst: getValues('sgst'),
                igst: getValues('igst'),
                rate: getValues('gstRate'),
                hsn: getValues('hsn'),
                isInput: (tranTypeId === Utils.getTranTypeId('DebitNote')) ? false : true,
            } : undefined,
        };
    }

    return { getTranHData };
}