import { FormProvider, useForm } from "react-hook-form";
import _ from 'lodash'
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { ContactsType, SalePurchaseEditDataType, TranDType } from "../../../../utils/global-types-interfaces-enums";
// import { useUtilsInfo } from "../../../../utils/utils-info-hook";
// import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { AllSalesForm } from "./all-sales-form";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { clearSalesFormData } from "./sales-slice";

export function AllSales() {
    const dispatch: AppDispatchType = useDispatch()
    const instance = DataInstancesMap.allSales;
    const savedFormData = useSelector((state: RootStateType) => state.sales.savedFormData);
    const { /*branchId, finYearId, hasGstin, dbName, buCode, decodedDbParamsObject*/  hasGstin } = useUtilsInfo();
    const methods = useForm<SalesFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultSalesFormValues() : savedFormData
        });
    const { clearErrors, setError, getValues, setValue, reset, watch, setFocus } = methods;
    const extendedMethods = { ...methods, getDefaultSalesLineItem, resetAll }

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer
                    LeftCustomControl={() => <span className="ml-2 font-bold text-gray-500 text-lg">→ Sales</span>}>
                    <AllSalesForm />
                </CompAccountsContainer>
            </form>
        </FormProvider>
    );

    async function finalizeAndSubmit() { }
    function getDefaultSalesFormValues(): SalesFormDataType {
        return ({
            id: undefined,
            autoRefNo: undefined,
            tranDate: new Date().toISOString().split('T')[0],
            userRefNo: null,
            remarks: null,
            tranTypeId: Utils.getTranTypeId("Sales"),
            isGstInvoice: hasGstin,
            isIgst: false,

            branchId: 0,
            finYearId: 0,
            hasCustomerGstin: false,

            creditAccId: null,
            debitAccounts: [],
            gstin: null,

            deletedIds: [],
            contactDisplayData: null,
            contactData: null,
            salesLineItems: [],
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
            gstRate: 0,
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

    function resetAll() {
        clearErrors()
        reset(getDefaultSalesFormValues());
        dispatch(clearSalesFormData());
    }
}

export type SalesFormDataType = {
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

    creditAccId: string | number | null;
    debitAccounts: TranDType[];

    gstin?: string | null;

    deletedIds: number[]; // for PurchaseSaleDetails table
    salesLineItems: SalesLineItemType[];

    saleEditData?: SalePurchaseEditDataType // Check if required
    toggle: boolean; // For making the form forcefully dirty
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
    // previousStock?: number | null;
    lastPurchasePrice?: number | null;
}

export type ContactDisplayDataType = {
    index?: number;
    id: number;
    name: string;
    gstin: string;
    email: string;
    mobile: string;
    address: string;
}
