import { UseFormReturn } from "react-hook-form";
import _ from 'lodash';
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { SalesReturnFormDataType } from "./all-sales-return";
import { ContactsType, ExtGstTranDType, TraceDataObjectType, TranDType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../utils/utils";
import { AllTables } from "../../../../app/maps/database-tables-map";

export function useAllSalesReturnSubmit(methods: UseFormReturn<SalesReturnFormDataType>, tranTypeId = Utils.getTranTypeId('SaleReturn')) {
  const { branchId, finYearId } = useUtilsInfo();
  const { getValues } = methods;
  const salesReturnEditData = getValues('salesReturnEditData')
  const contactsData: ContactsType | null = getValues('contactsData')

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
      contactsId: contactsData?.id,
      xDetails: getTranDDetails(),
    };
  }

  function getTranDDetails(): TraceDataObjectType[] {
    return [{
      tableName: AllTables.TranD.name,
      fkeyName: "tranHeaderId",
      deletedIds: getValues('tranDDeletedIds'),
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
    const creditAmount = getValues(`creditAccount.amount`) || 0;
    const tranD: TranDType[] = salesReturnEditData?.tranD || []

    // For sales return: debit the sales return account, credit payment account
    const debit: XDataObjectType = {
      id: tranD.find(item => item.dc === 'D')?.id,
      accId: getValues('debitAccId'), // This will be the sales return account
      dc: 'D',
      amount: totalAmount,
      ...(xDetails.length > 0 && { xDetails }),
    };

    // Credit the payment account
    const credit: XDataObjectType = {
      id: tranD.find(item => item.dc === 'C')?.id,
      accId: getValues(`creditAccount.accId`),
      dc: 'C',
      amount: creditAmount,
      instrNo: getValues(`creditAccount.instrNo`) || null,
      remarks: getValues(`creditAccount.remarks`) || null,
      lineRefNo: getValues(`creditAccount.lineRefNo`) || null,
    };

    return [debit, credit];
  }

  function getExtGstTranDDetails(): TraceDataObjectType | undefined {
    const extGstTranD: ExtGstTranDType | null = salesReturnEditData?.extGstTranD || null
    return {
      tableName: AllTables.ExtGstTranD.name,
      fkeyName: 'tranDetailsId',
      xData: {
        id: extGstTranD?.id,
        gstin: getValues('gstin'),
        cgst: getValues('totalCgst'),
        sgst: getValues('totalSgst'),
        igst: getValues('totalIgst'),
        isInput: true, // For sales return, this is input GST (reverse of sales)
      },
    };
  }

  function getSalePurchaseDetailsDetails(): TraceDataObjectType {
    const salesReturnLineItems = getValues('salesReturnLineItems') || [];

    const xData: XDataObjectType[] = salesReturnLineItems.map(entry => ({
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
      jData: getJData(entry)
    }));
    const deletedIds = getValues("salePurchDetailsDeletedIds") || [];
    return {
      tableName: AllTables.SalePurchaseDetails.name,
      fkeyName: 'tranDetailsId',
      deletedIds: deletedIds,
      xData,
    };
  }

  function getJData(entry: XDataObjectType) {
    if (entry.lineRemarks || entry.serialNumbers) {
      return (JSON.stringify({ serialNumbers: entry.serialNumbers || '', remarks: entry.lineRemarks }))
    }
    return (null)
  }

  return { getTranHData };
}