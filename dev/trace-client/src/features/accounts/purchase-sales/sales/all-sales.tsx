import { FormProvider, useForm } from "react-hook-form";
import _ from 'lodash'
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { ContactsType, SalePurchaseEditDataType, TranDExtraType, TranDType } from "../../../../utils/global-types-interfaces-enums";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { AllSalesForm } from "./all-sales-form";
import { AllSalesView } from "./sales-view/all-sales-view";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { clearSalesFormData, setSalesViewMode } from "./sales-slice";
import Decimal from "decimal.js";
import { useAllSalesSubmit } from "./all-sales-submit-hook";
// import { Messages } from "../../../../utils/messages";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
// import { useEffect } from "react";

export function AllSales() {
    const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.sales.savedFormData);
    const isViewMode = useSelector((state: RootStateType) => state.sales.isViewMode);
    const { /*branchId, finYearId, hasGstin, dbName, buCode, decodedDbParamsObject */  hasGstin, defaultGstRate, dbName, buCode } = useUtilsInfo();

    const methods = useForm<SalesFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultSalesFormValues() : savedFormData
        });
    const { clearErrors, getValues, /*setError, getValues, setValue,*/ reset, /*watch, setFocus*/ } = methods;
    const { getTranHData } = useAllSalesSubmit(methods);
    const extendedMethods = { ...methods, getDefaultSalesLineItem, getDefaultDebitAccount, resetAll, getDebitCreditDifference }

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
            const xData: XDataObjectType = getTranHData();
            // await Utils.doGenericUpdate({
            //     buCode: buCode || "",
            //     dbName: dbName || "",
            //     tableName: AllTables.TranH.name,
            //     xData: xData,
            // });

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

    function getDebitCreditDifference() {
        const totalInvoiceAmount = getValues('totalInvoiceAmount') || new Decimal(0)
        const totalDebitAmount = getValues('totalDebitAmount') || new Decimal(0)
        const diff = totalInvoiceAmount.minus(totalDebitAmount)
        return (diff.toDecimalPlaces(2).toNumber())
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

            deletedIds: [],
            contactDisplayData: null,
            contactData: null,
            salesLineItems: [],
            shippingInfo: null,
            toggle: false // For making the form forcefully dirty
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
            remarks: null
        })
    }

    function resetAll() {
        clearErrors()
        reset(getDefaultSalesFormValues());
        dispatch(clearSalesFormData());
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
    contactData: ContactsType | null;

    //TranD
    creditAccId: string | number | null;
    debitAccounts: TranDExtraType[];

    gstin?: string | null;

    deletedIds: number[]; // for PurchaseSaleDetails table
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
