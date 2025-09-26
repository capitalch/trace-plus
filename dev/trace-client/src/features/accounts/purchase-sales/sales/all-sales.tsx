import { FormProvider, useForm } from "react-hook-form";
import _ from 'lodash'
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { ContactsType, ExtGstTranDType, SalePurchaseDetailsWithExtraType, SalePurchaseEditDataType, TranDExtraType, TranDType, TranHType } from "../../../../utils/global-types-interfaces-enums";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { AllSalesForm } from "./all-sales-form";
import { AllSalesView } from "./sales-view/all-sales-view";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { clearSalesFormData, setSalesViewMode, clearSearchQuery, saveSalesFormData } from "./sales-slice";
import Decimal from "decimal.js";
import { useAllSalesSubmit } from "./all-sales-submit-hook";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { useEffect, useCallback } from "react";
import { Messages } from "../../../../utils/messages";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";

export function AllSales() {
    const instance = DataInstancesMap.allSales
    const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.sales.savedFormData);
    const isViewMode = useSelector((state: RootStateType) => state.sales.isViewMode);

    const { hasGstin, defaultGstRate, dbName, buCode, decodedDbParamsObject } = useUtilsInfo();

    const methods = useForm<SalesFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultSalesFormValues() : getDeserializedFormData(savedFormData)
        });
    const { clearErrors, getValues, setError, reset, watch, setValue } = methods;

    const getDebitCreditDifference = useCallback(() => {
        const totalInvoiceAmount = getValues('totalInvoiceAmount') || new Decimal(0)
        const totalDebitAmount = getValues('totalDebitAmount') || new Decimal(0)
        const diff = totalInvoiceAmount.minus(totalDebitAmount)
        return (diff.toDecimalPlaces(2).toNumber())
    }, [getValues])

    const { getTranHData } = useAllSalesSubmit(methods);
    const extendedMethods = { ...methods, getDefaultSalesLineItem, getDefaultDebitAccount, resetAll, getDebitCreditDifference, populateFormOverId }


    // Watch for changes in amounts and trigger validation
    const totalInvoiceAmount = watch('totalInvoiceAmount');
    const totalDebitAmount = watch('totalDebitAmount');
    const debitAccounts = watch('debitAccounts');

    useEffect(() => {
        if (savedFormData) {
            reset(_.cloneDeep(getDeserializedFormData(savedFormData)));
            // Use setTimeout to ensure setValue runs after reset completes
            setTimeout(() => {
                setValue('toggle', !savedFormData.toggle, { shouldDirty: true });
            }, 0);
        }
    }, [savedFormData, reset, setValue]);

    useEffect(() => {
        return (() => {
            const data = getSerializedFormData()
            dispatch(saveSalesFormData(data));
        })
    }, [dispatch, getValues])

    useEffect(() => {
        // Calculate difference and set/clear error accordingly
        const diff = getDebitCreditDifference();
        if (diff !== 0) {
            setError('root.amountDifference', {
                type: 'validation',
                message: Messages.errAmountSalePaymentMismatch
            });
        } else {
            clearErrors('root.amountDifference');
        }
    }, [totalInvoiceAmount, totalDebitAmount, debitAccounts, setError, clearErrors, getDebitCreditDifference]);

    const handleBackToForm = () => {
        dispatch(setSalesViewMode(false));
    };

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer
                    LeftCustomControl={() => <span className="ml-2 font-bold text-gray-500 text-lg">→ Sales</span>}>
                    {isViewMode ? (
                        <AllSalesView onBack={handleBackToForm} />
                    ) : (
                        <AllSalesForm />
                    )}
                </CompAccountsContainer>
            </form>
        </FormProvider>
    );

    async function finalizeAndSubmit() {
        try {
            const diff = getDebitCreditDifference();
            if (diff !== 0) {
                Utils.showAlertMessage('Error', Messages.errDebitCreditMismatch)
                return
            }
            const xData: XDataObjectType = getTranHData();
            console.log(JSON.stringify(xData))

            const debitAccounts = getValues('debitAccounts') || [];
            const salesType = getValues('salesType')
            const firstRow = debitAccounts[0] || {};
            let autoSubledgerAccId = null;
            // autoSubledgerAccId is always the ledger account of type 'L', means ledger having subledger. At server this id is replaced by newly created subledger account id. Server creates the subledger account only if the ledger account enabled for auto subledger.
            if (firstRow && !firstRow.id && salesType === 'bill') {
                autoSubledgerAccId = debitAccounts[0]?.accId || null;
            }
            console.log('Auto subledger acc id:', autoSubledgerAccId)
            await Utils.doGenericUpdate({
                buCode: buCode || "",
                dbName: dbName || "",
                tableName: AllTables.TranH.name,
                xData: xData,
                autoSubledgerAccId: autoSubledgerAccId
            });

            if (getValues('id')) {
                dispatch(setSalesViewMode(true)); // Switch to view mode for existing sales
            }
            resetAll();
            Utils.showSaveMessage();
        } catch (e) {
            console.error(e);
            Utils.showErrorMessage('Error saving sales data');
        }
    }

    function getDefaultSalesFormValues(): SalesFormDataType {
        return ({
            id: undefined,
            autoRefNo: undefined,
            tranDate: new Date().toISOString().split('T')[0],
            userRefNo: null,
            remarks: null,
            tranTypeId: Utils.getTranTypeId("Sales"),
            branchId: 0,
            finYearId: 0,

            hasCustomerGstin: false,
            isGstInvoice: hasGstin,
            isIgst: false,

            creditAccId: null,
            debitAccounts: [],
            gstin: null,

            totalInvoiceAmount: new Decimal(0),
            totalQty: new Decimal(0),
            totalCgst: new Decimal(0),
            totalSgst: new Decimal(0),
            totalIgst: new Decimal(0),
            totalSubTotal: new Decimal(0),
            totalDebitAmount: new Decimal(0),

            salePurchDetailsDeletedIds: [],
            tranDDeletedIds: [],
            contactDisplayData: null,
            contactsData: null,
            salesLineItems: [],
            shippingInfo: null,
            toggle: false, // For making the form forcefully dirty
            // isAutoSubledger: false,
            salesType: 'retail'
        })
    }

    function getDefaultSalesLineItem(): SalesLineItemType {
        return {
            id: undefined,
            productId: null,
            productCode: '',
            productDetails: '',
            lineRemarks: null,
            hsn: '',
            qty: 1,
            gstRate: defaultGstRate,
            price: 0,
            amount: 0,
            discount: 0,
            priceGst: 0,
            serialNumbers: null,
            subTotal: 0,
            cgst: 0,
            sgst: 0,
            igst: 0
        };
    }

    function getDefaultDebitAccount(): TranDType {
        return ({
            id: undefined,
            accId: null,
            dc: 'D',
            tranHeaderId: null,
            amount: 0,
            instrNo: null,
            lineRefNo: null,
            remarks: null,

        })
    }

    function getDeserializedFormData(data: any): SalesFormDataType {
        const out: SalesFormDataType = {
            ...data,
            totalInvoiceAmount: new Decimal(data.totalInvoiceAmount),
            totalQty: new Decimal(data.totalQty),
            totalCgst: new Decimal(data.totalCgst),
            totalSgst: new Decimal(data.totalSgst),
            totalIgst: new Decimal(data.totalIgst),
            totalSubTotal: new Decimal(data.totalSubTotal),
            totalDebitAmount: new Decimal(data.totalDebitAmount),
        }
        return (out)
    }

    function getSerializedFormData() {
        const formData = getValues()
        const serFormData = {
            ...formData,
            totalInvoiceAmount: String(formData.totalInvoiceAmount),
            totalQty: String(formData.totalQty),
            totalCgst: String(formData.totalCgst),
            totalSgst: String(formData.totalSgst),
            totalIgst: String(formData.totalIgst),
            totalSubTotal: String(formData.totalSubTotal),
            totalDebitAmount: String(formData.totalDebitAmount)
        }
        return (serFormData)
    }

    async function getSalesDetailsOnId(id: number | undefined) {
        if (!id) {
            return
        }
        return (await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            instance: instance,
            sqlId: SqlIdsMap.getSalePurchaseDetailsOnId,
            sqlArgs: {
                id: id,
            },
        }))
    }

    async function populateFormOverId(id: any) {
        const editData: any = await getSalesDetailsOnId(id)
        const salesEditData: SalePurchaseEditDataType = editData?.[0]?.jsonResult

        if (!salesEditData) {
            Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
            return
        }

        const tranH: TranHType = salesEditData.tranH
        const billTo: ContactsType | null = salesEditData.billTo
        const shippingInfo: ShippingInfoType | null = tranH?.jData?.shipTo ? tranH.jData.shipTo as any : null
        const tranD: TranDExtraType[] = salesEditData.tranD
        const extGsTranD: ExtGstTranDType = salesEditData.extGstTranD
        const salePurchaseDetails: SalePurchaseDetailsWithExtraType[] = salesEditData.salePurchaseDetails

        const totalInvoiceAmount = new Decimal(tranD.find((item) => item.dc === "C")?.amount || 0)
        // const ia = totalInvoiceAmount.toDecimalPlaces(2).toNumber()
        const totalDebitAmount = tranD.filter((item) => item.dc === "D").reduce((sum, item) => sum.add(new Decimal(item.amount || 0)), new Decimal(0))

        // Determine salesType based on tranD data
        const debitAccounts = tranD.filter((item) => item.dc === "D")
        let salesType: 'retail' | 'bill' | 'institution' = 'retail'
        if (debitAccounts.find((item) => item.isParentAutoSubledger)) {
            salesType = 'bill'
        } else if (debitAccounts.find((item) => (item.accClass === 'debtor') || (item.accClass === 'creditor'))) {
            salesType = 'institution'
        }
        salesEditData.shippingInfo = shippingInfo
        reset({
            id: tranH.id,
            autoRefNo: tranH.autoRefNo,
            tranDate: tranH.tranDate,
            userRefNo: tranH.userRefNo,
            remarks: tranH.remarks,
            tranTypeId: tranH.tranTypeId,
            isGstInvoice: Boolean(extGsTranD?.id),
            creditAccId: tranD.find((item) => item.dc === "C")?.accId,
            debitAccounts: tranD.filter((item) => item.dc === "D"),
            gstin: extGsTranD?.gstin,
            isIgst: extGsTranD?.igst ? true : false,

            totalCgst: new Decimal(extGsTranD?.cgst),
            totalSgst: new Decimal(extGsTranD?.sgst),
            totalIgst: new Decimal(extGsTranD?.igst),
            totalQty: new Decimal(salePurchaseDetails.reduce((sum, item) => sum + (item.qty || 0), 0)),
            totalInvoiceAmount: totalInvoiceAmount,
            totalDebitAmount: totalDebitAmount,
            salesEditData: salesEditData,
            salesLineItems: salePurchaseDetails.map((item) => ({
                id: item.id,
                productId: item.productId,
                productCode: item.productCode,
                upcCode: item.upcCode || null,
                productDetails: `${item.brandName} ${item.catName} ${item.label}}`,
                hsn: item.hsn.toString(),
                qty: item.qty,
                gstRate: item.gstRate,
                price: item.price,
                discount: item.discount,
                priceGst: item.priceGst,
                lineRemarks: item.remarks || null,
                serialNumbers: item.serialNumbers || null,
                amount: item.amount,
                cgst: item.cgst,
                sgst: item.sgst,
                igst: item.igst,
                subTotal: ((item.price || 0) - (item.discount || 0)) * (item.qty || 0)
            })),
            contactsData: billTo,
            shippingInfo: shippingInfo,
            salesType: salesType,
        })
        // onBack()
    }

    function resetAll() {
        clearErrors()
        reset(getDefaultSalesFormValues());
        dispatch(clearSalesFormData());
        dispatch(clearSearchQuery());
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
}

export type SalesFormDataType = {
    //TranH
    id?: number;
    autoRefNo?: string;
    tranDate: string;
    userRefNo?: string | null;
    remarks?: string | null;
    tranTypeId: number;
    branchId: number;
    finYearId: number;

    hasCustomerGstin: boolean;
    isGstInvoice: boolean;
    isIgst: boolean;

    contactDisplayData: ContactDisplayDataType | null;
    contactsData: ContactsType | null;

    //TranD
    creditAccId: string | number | null;
    debitAccounts: TranDExtraType[];

    gstin?: string | null;

    salePurchDetailsDeletedIds?: number[]; // for PurchaseSaleDetails table
    tranDDeletedIds?: number[];
    // accMDeletedIds?: number[]; // to delete auto subledger entries
    salesLineItems: SalesLineItemType[];

    totalInvoiceAmount: Decimal;
    totalQty: Decimal;
    totalCgst: Decimal;
    totalSgst: Decimal;
    totalIgst: Decimal;
    totalSubTotal: Decimal;
    totalDebitAmount: Decimal;
    shippingInfo: ShippingInfoType | null;

    salesEditData?: SalePurchaseEditDataType // Check if required
    toggle: boolean; // For making the form forcefully dirty
    // isAutoSubledger: boolean;
    salesType: 'retail' | 'bill' | 'institution';
}

export type ShippingInfoType = {
    name: string;
    mobileNumber?: string | null;
    email?: string | null;
    address1: string;
    address2?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    pin: string;
    otherInfo?: string | null;
}

export type SalesLineItemType = {
    id?: number;
    productId: number | null;
    tranDetailsID?: number;
    productCode: string;
    upcCode?: string | null;
    productDetails: string;
    hsn: string;
    qty: number;
    gstRate: number;
    price: number;
    amount: number;
    discount: number;
    priceGst: number;
    subTotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    lineRemarks?: string | null;
    serialNumbers?: string | null;

    age?: number | null;
    profit?: number | null | string;
    stock?: number | null;
    lastPurchasePrice?: number | null;
}

export type ContactDisplayDataType = {
    id?: number;
    index?: number;
    name: string;
    gstin: string;
    email: string;
    mobile: string;
    address: string;
}
