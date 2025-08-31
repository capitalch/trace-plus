import { FormProvider, useForm } from "react-hook-form";
import _ from 'lodash'
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { ContactsType, SalePurchaseEditDataType, TranDType } from "../../../../utils/global-types-interfaces-enums";
// import { useUtilsInfo } from "../../../../utils/utils-info-hook";
// import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { RootStateType } from "../../../../app/store";
import { useSelector } from "react-redux";
import { AllSalesForm } from "./all-sales-form";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";

export function AllSales() {
    // const instance = DataInstancesMap.allSales;
    const savedFormData = useSelector((state: RootStateType) => state.sales.savedFormData);
    const { /*branchId, finYearId, hasGstin, dbName, buCode, decodedDbParamsObject*/  hasGstin } = useUtilsInfo();
    const methods = useForm<SalesFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultSalesFormValues() : savedFormData
        });
    // const { clearErrors, setError, getValues, setValue, reset, watch, setFocus } = methods;
    const extendedMethods = { ...methods, /*resetAll, getDefaultPurchaseLineItem, checkPurchaseInvoiceExists*/ }

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer
                    LeftCustomControl={() => <span className="text-lg font-bold text-gray-500 ml-2">→ Sales</span>}>
                    <AllSalesForm />
                </CompAccountsContainer>
            </form>
        </FormProvider>
    );

    async function finalizeAndSubmit() { }
    function getDefaultSalesFormValues() {
        return ({
            tranDate: new Date().toISOString().split('T')[0],
            tranTypeId: 2, // Sales
            branchId: 0,
            finYearId: 0,
            hasCustomerGstin: false,
            isGstInvoice: hasGstin,
            isIgst: false,
            // contactsId: null, // customer
            creditAccId: '',
            debitAccounts: [],
            deletedIds: [],
            saleLineItems: [
                {
                    productId: null,
                    productCode: '',
                    productDetails: '',
                    hsn: '',
                    qty: 1,
                    gstRate: 0,
                    price: 0,
                    amount: 0,
                    discount: 0,
                    priceGst: 0,
                    subTotal: 0,
                    cgst: 0,
                    sgst: 0,
                    igst: 0
                }
            ],
            toggle: false // For making the form forcefully dirty
        })
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
    // contactsId: number | null; // customer
    contactDisplayData: ContactDisplayDataType | null;
    contactData: ContactsType | null;
    creditAccId: string | number;
    debitAccounts: TranDType[];
    // debitAccId: string | number | null;

    gstin?: string | null;

    deletedIds: number[]; // for PurchaseSaleDetails table
    saleLineItems: SaleLineItemType[];

    saleEditData?: SalePurchaseEditDataType
    toggle: boolean; // For making the form forcefully dirty
}

export type SaleLineItemType = {
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
