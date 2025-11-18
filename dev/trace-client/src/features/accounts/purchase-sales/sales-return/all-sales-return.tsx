import { FormProvider, useForm } from "react-hook-form";
import _ from 'lodash'
import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container";
import { ContactsType, ExtGstTranDType, SalePurchaseDetailsWithExtraType, SalePurchaseEditDataType, TranDExtraType, TranDType, TranHType, } from "../../../../utils/global-types-interfaces-enums";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { AllSalesReturnForm } from "./all-sales-return-form";
import { AllSalesReturnView } from "./all-sales-return-view";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { clearSalesReturnFormData, setSalesReturnViewMode, clearSearchQuery, saveSalesReturnFormData, setLastSalesReturnEditData } from "./sales-return-slice";
import { setCompAccountsContainerMainTitle } from "../../../../controls/redux-components/comp-slice";
import Decimal from "decimal.js";
import { useAllSalesReturnSubmit } from "./all-sales-return-submit-hook";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { useEffect, useCallback, useRef } from "react";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { ContactDisplayDataType } from "../sales/all-sales";
import { Messages } from "../../../../utils/messages";
import { useLocation } from "react-router-dom";
import { businessContextToggleSelectorFn } from "../../../layouts/layouts-slice";

export function AllSalesReturn() {
    const instance = DataInstancesMap.allSalesReturn
    const dispatch: AppDispatchType = useDispatch()
    const location = useLocation()
    const savedFormData = useSelector((state: RootStateType) => state.salesReturn.savedFormData);
    const isViewMode = useSelector((state: RootStateType) => state.salesReturn.isViewMode);
    const toggleBusinessContextState = useSelector(businessContextToggleSelectorFn);
    const isInitialMount = useRef(true);

    const { hasGstin, defaultGstRate, dbName, buCode, decodedDbParamsObject } = useUtilsInfo();

    const methods = useForm<SalesReturnFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultSalesReturnFormValues() : getDeserializedFormData(savedFormData)
        });
    const { clearErrors, getValues, reset, setValue } = methods;

    const { getTranHData } = useAllSalesReturnSubmit(methods);
    const extendedMethods = { ...methods, getDefaultSalesReturnLineItem, getDefaultCreditAccount, resetAll, populateFormOverId, getSalesReturnEditDataOnId, }

    // Utility function to generate sales return title
    const getSalesReturnTitle = (isViewMode: boolean): string => {
        return isViewMode ? "Sales Return View" : "Sales Return";
    }

    useEffect(() => {
        if (savedFormData) {
            reset(_.cloneDeep(getDeserializedFormData(savedFormData)));
            // Use setTimeout to ensure setValue runs after reset completes
            setTimeout(() => {
                setValue('toggle', !savedFormData.toggle, { shouldDirty: true });
            }, 0);
        }
    }, [savedFormData, reset, setValue]);

    const getSerializedFormData = useCallback(() => {
        const formData = getValues()
        const serFormData = {
            ...formData,
            totalInvoiceAmount: String(formData.totalInvoiceAmount),
            totalQty: String(formData.totalQty),
            totalCgst: String(formData.totalCgst),
            totalSgst: String(formData.totalSgst),
            totalIgst: String(formData.totalIgst),
            totalSubTotal: String(formData.totalSubTotal),
        }
        return (serFormData)
    }, [getValues]);

    useEffect(() => {
        return (() => {
            const data = getSerializedFormData()
            dispatch(saveSalesReturnFormData(data));
        })
    }, [dispatch, getSerializedFormData])

    // Update main title when view mode changes
    useEffect(() => {
        const title = getSalesReturnTitle(isViewMode);
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: title }));
    }, [isViewMode, dispatch]);

    // Handle navigation from report - auto-populate form with ID from location state
    useEffect(() => {
        if (location.state?.id && location.state?.returnPath) {
            populateFormOverId(location.state.id)
        }
    }, [location.state?.id, location.state?.returnPath]);

    useEffect(() => {
        // Skip execution on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        resetAll();
    }, [toggleBusinessContextState]);

    const handleBackToForm = () => {
        dispatch(setSalesReturnViewMode(false));
    };

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer>
                    {isViewMode ? (
                        <AllSalesReturnView onBack={handleBackToForm} />
                    ) : (
                        <AllSalesReturnForm />
                    )}
                </CompAccountsContainer>
            </form>
        </FormProvider>
    );

    // === MAIN FORM ACTION FUNCTIONS ===
    async function finalizeAndSubmit() {
        try {
            const xData: XDataObjectType = getTranHData();
            // console.log(JSON.stringify(xData))

            const ret = await Utils.doGenericUpdate({
                buCode: buCode || "",
                dbName: dbName || "",
                tableName: AllTables.TranH.name,
                xData: xData,
            });
            const newId = ret?.data?.genericUpdate
            const tranHId = newId || getValues('id');
            const salesReturnEditData = await getSalesReturnEditDataOnId(tranHId)
            dispatch(setLastSalesReturnEditData(salesReturnEditData));
            if (getValues('id') && (!location.state?.id)) {
                dispatch(setSalesReturnViewMode(true)); // Switch to view mode for existing sales return
            }
            if (!location.state?.id) {
                resetAll();
            }
            Utils.showSaveMessage();
        } catch (e) {
            console.error(e);
            Utils.showErrorMessage('Error saving sales return data');
        }
    }

    // === FORM DEFAULT VALUE FUNCTIONS ===
    function getDefaultSalesReturnFormValues(): SalesReturnFormDataType {
        return ({
            id: undefined,
            autoRefNo: undefined,
            tranDate: new Date().toISOString().split('T')[0],
            userRefNo: null,
            remarks: null,
            tranTypeId: Utils.getTranTypeId("SaleReturn"),
            branchId: 0,
            finYearId: 0,

            hasCustomerGstin: false,
            isGstInvoice: hasGstin,
            isIgst: false,

            debitAccId: null, // Sale account (Debit)
            creditAccount: getDefaultCreditAccount(), // Refund accounts (Credit)
            gstin: null,

            totalInvoiceAmount: new Decimal(0),
            totalQty: new Decimal(0),
            totalCgst: new Decimal(0),
            totalSgst: new Decimal(0),
            totalIgst: new Decimal(0),
            totalSubTotal: new Decimal(0),

            salePurchDetailsDeletedIds: [],
            tranDDeletedIds: [],
            contactDisplayData: null,
            contactsData: null,
            salesReturnLineItems: [],
            toggle: false, // For making the form forcefully dirty
            selectedSalesInvoiceId: null,
            salesReturnSearchText: '',
        })
    }

    function getDefaultSalesReturnLineItem(): SalesReturnLineItemType {
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
            igst: 0,
            originalSaleQty: undefined
        };
    }

    function getDefaultCreditAccount(): TranDType {
        return {
            id: undefined,
            accId: null,
            dc: 'C',
            amount: 0,
            lineRefNo: null,
            remarks: null,
            instrNo: null,
            tranHeaderId: null
        };
    }

    // === DATA SERIALIZATION FUNCTIONS ===
    function getDeserializedFormData(data: any): SalesReturnFormDataType {
        const out: SalesReturnFormDataType = {
            ...data,
            totalInvoiceAmount: new Decimal(data.totalInvoiceAmount),
            totalQty: new Decimal(data.totalQty || 0),
            totalCgst: new Decimal(data.totalCgst || 0),
            totalSgst: new Decimal(data.totalSgst || 0),
            totalIgst: new Decimal(data.totalIgst || 0),
            totalSubTotal: new Decimal(data.totalSubTotal || 0),
        }
        return (out)
    }

    // === DATABASE QUERY FUNCTIONS ===
    async function getSalesReturnDetailsOnId(id: number | undefined) {
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

    async function getSalesReturnEditDataOnId(id: number | undefined) {
        const editData: any = await getSalesReturnDetailsOnId(id)
        const salesReturnEditData: SalePurchaseEditDataType = editData?.[0]?.jsonResult
        if (!salesReturnEditData) {
            return null
        }
        return (salesReturnEditData)
    }

    async function populateFormOverId(id: any) {
        const salesReturnEditData: SalePurchaseEditDataType | null = await getSalesReturnEditDataOnId(id)
        if (!salesReturnEditData) {
            Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
            return
        }

        const tranH: TranHType = salesReturnEditData.tranH
        const billTo: ContactsType | null = salesReturnEditData.billTo
        const tranD: TranDExtraType[] = salesReturnEditData.tranD
        const extGsTranD: ExtGstTranDType = salesReturnEditData.extGstTranD
        const salePurchaseDetails: SalePurchaseDetailsWithExtraType[] = salesReturnEditData.salePurchaseDetails

        const totalInvoiceAmount = new Decimal(tranD.find((item) => item.dc === "D")?.amount || 0)
        const creditAmount = new Decimal(tranD.find((item) => item.dc === "C")?.amount || 0)

        reset({
            id: tranH.id,
            autoRefNo: tranH.autoRefNo,
            tranDate: tranH.tranDate,
            userRefNo: tranH.userRefNo,
            remarks: tranH.remarks,
            tranTypeId: tranH.tranTypeId,
            isGstInvoice: Boolean(extGsTranD?.id),
            debitAccId: tranD.find((item) => item.dc === "D")?.accId,
            creditAccount: tranD.find((item) => item.dc === "C"),
            gstin: extGsTranD?.gstin,
            isIgst: extGsTranD?.igst ? true : false,

            totalCgst: new Decimal(extGsTranD?.cgst),
            totalSgst: new Decimal(extGsTranD?.sgst),
            totalIgst: new Decimal(extGsTranD?.igst),
            totalQty: new Decimal(salePurchaseDetails.reduce((sum, item) => sum + (item.qty || 0), 0)),
            totalInvoiceAmount: totalInvoiceAmount,
            creditAmount: creditAmount,
            // paymentAmount: paymentAmount,
            salesReturnEditData: salesReturnEditData,
            salesReturnLineItems: salePurchaseDetails.map((item) => ({
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
                subTotal: ((item.price || 0) - (item.discount || 0)) * (item.qty || 0),
                originalSaleQty: undefined
            })),
            contactsData: billTo,
        })
    }

    // === UTILITY FUNCTIONS ===
    function resetAll() {
        clearErrors()
        reset(getDefaultSalesReturnFormValues());
        dispatch(clearSalesReturnFormData());
        dispatch(clearSearchQuery());
        // Scroll to top after all operations complete
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
}

export type SalesReturnFormDataType = {
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
    debitAccId: string | number | null; // Sale account (Debit)
    creditAccount: TranDType; // Refund accounts (Credit)

    gstin?: string | null;

    salePurchDetailsDeletedIds?: number[]; // for PurchaseSaleDetails table
    tranDDeletedIds?: number[];
    salesReturnLineItems: SalesReturnLineItemType[];

    totalInvoiceAmount: Decimal;
    totalQty: Decimal;
    totalCgst: Decimal;
    totalSgst: Decimal;
    totalIgst: Decimal;
    totalSubTotal: Decimal;
    creditAmount?: Decimal;

    salesReturnEditData?: SalePurchaseEditDataType
    toggle: boolean; // For making the form forcefully dirty
    selectedSalesInvoiceId: number | null;
    salesReturnSearchText?: string;
}

export type SalesReturnLineItemType = {
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
    originalSaleQty?: number;
}