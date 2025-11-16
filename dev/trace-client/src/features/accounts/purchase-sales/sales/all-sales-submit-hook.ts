import { UseFormReturn } from "react-hook-form";
import _ from 'lodash';
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { SalesFormDataType, ShippingInfoType } from "./all-sales";
import { ContactsType, ExtGstTranDType, TraceDataObjectType, TranDType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../utils/utils";
import { AllTables } from "../../../../app/maps/database-tables-map";

export function useAllSalesSubmit(methods: UseFormReturn<SalesFormDataType>, tranTypeId = Utils.getTranTypeId('Sales')) {
  const { branchId, finYearId } = useUtilsInfo();
  const { getValues } = methods;
  const salesEditData = getValues('salesEditData')
  const contactsData: ContactsType | null = getValues('contactsData')
  const shippingInfo: ShippingInfoType | null = getValues('shippingInfo')
  const salesType = getValues('salesType')

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
      contactsId: salesType === 'institution' ? null : contactsData?.id,
      jData: shippingInfo ? JSON.stringify({
        shipTo: shippingInfo
      }) : null,
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
    const tranD: TranDType[] = salesEditData?.tranD || []

    // For sales: credit the sales account, debit customer/cash account
    const credit: XDataObjectType = {
      id: tranD.find(item => item.dc === 'C')?.id,
      accId: getValues('creditAccId'),
      dc: 'C',
      amount: totalAmount,
      ...(xDetails.length > 0 && { xDetails }),
    };

    // Get debit accounts data
    const debitAccounts = getValues('debitAccounts') || [];
    const debitEntries: XDataObjectType[] = debitAccounts.map(debitAcc =>
    ({
      id: debitAcc?.id,
      accId: debitAcc.accId,
      dc: 'D',
      amount: debitAcc.amount,
      instrNo: debitAcc.instrNo,
      lineRefNo: debitAcc.lineRefNo,
      remarks: debitAcc.remarks
    }));
    return [credit, ...debitEntries];
  }

  function getExtGstTranDDetails(): TraceDataObjectType | undefined {
    const extGstTranD: ExtGstTranDType | null = salesEditData?.extGstTranD || null
    return {
      tableName: AllTables.ExtGstTranD.name,
      fkeyName: 'tranDetailsId',
      xData: {
        id: extGstTranD?.id,
        gstin: getValues('gstin'),
        cgst: getValues('totalCgst'),
        sgst: getValues('totalSgst'),
        igst: getValues('totalIgst'),
        isInput: false, // For sales, this is output GST
      },
    };
  }

  function getSalePurchaseDetailsDetails(): TraceDataObjectType {
    const salesLineItems = getValues('salesLineItems') || [];

    const xData: XDataObjectType[] = salesLineItems.map(entry => ({
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