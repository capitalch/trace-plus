import { FormProvider, useForm } from "react-hook-form";
// import { AppDispatchType } from "../../../../app/store";
// import { useDispatch } from "react-redux";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { CompAccountsContainer } from "../../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../../controls/redux-components/comp-tabs";
import { AllPurchasesMain } from "../all-purchases/all-purchases-main";
import { AllPurchasesView } from "../all-purchases/all-purchases-view";

export function AllPurchases() {
    // const dispatch: AppDispatchType = useDispatch()
    const instance = DataInstancesMap.allPurchases;
    const { branchId, /*buCode, dbName,*/ finYearId, hasGstin } = useUtilsInfo();
    const methods = useForm<PurchaseFormDataType>(
        {
            mode: "onTouched",
            criteriaMode: "all",
            defaultValues: getDefaultPurchaseFormValues()
        });
    const { /*watch, getValues, setValue,*/ reset } = methods;
    const extendedMethods = { ...methods, resetAll, getDefaultPurchaseLineItem }
    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllPurchasesMain />
        },
        {
            label: "View",
            content: <AllPurchasesView instance={instance} />
        }
    ];
    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer>
                    <label className="mt-1 text-md font-bold text-primary-500">
                        Purchase
                    </label>
                    <CompTabs tabsInfo={tabsInfo} instance={instance} className="mt-2" />
                </CompAccountsContainer>
            </form>
        </FormProvider>
    );

    function finalizeAndSubmit(data: PurchaseFormDataType) {
        // Handle form submission logic here
        console.log("Form submitted with data:", data);
        // dispatch actions or API calls as needed
    }

    function getDefaultPurchaseFormValues(): PurchaseFormDataType {
        return ({
            id: undefined,
            autoRefNo: "",
            tranDate: new Date().toISOString().split('T')[0],
            userRefNo: null,
            remarks: null,
            isGstInvoice: hasGstin,
            isIgst: false,

            debitAccId: null,
            creditAccId: null,
            gstin: null,

            purchaseLineItems: [getDefaultPurchaseLineItem()],

            totalInvoiceAmount: 0,
            totalQty: 0,
            totalCgst: 0,
            totalSgst: 0,
            totalIgst: 0,

            branchId: branchId || 1,
            deletedIds: [],
            finYearId: finYearId || 0,
        });
    }

    function getDefaultPurchaseLineItem(): PurchaseLineItemType {
        return {
            id: undefined,
            productId: null,
            productCode: "",
            productDetails: "",
            lineRemarks: null,
            hsn: "",
            gstRate: 0,
            qty: 1,
            price: 0,
            discount: 0,
            serialNumbers: null,
            priceGst: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
        };
    }

    // function getDefaultPurchaseLineItems(): PurchaseLineItemType[] {
    //     return [{
    //         id: undefined,
    //         productId: null,
    //         productCode: "",
    //         productDetails: "",
    //         lineRemarks: null,
    //         hsn: "",
    //         gstRate: 0,
    //         qty: 0,
    //         price: 0,
    //         discount: 0,
    //         serialNumbers: null,
    //         priceGst: 0,
    //         // subTotal: 0,
    //         cgst: 0,
    //         sgst: 0,
    //         igst: 0,
    //         // amount: 0,
            
    //     }];
    // }

    function resetAll() {
        reset(getDefaultPurchaseFormValues())
    }
}

export type PurchaseFormDataType = {
    id?: number;
    autoRefNo?: string;
    tranDate: string;
    userRefNo?: string | null;
    remarks?: string | null;
    isGstInvoice: boolean;
    isIgst: boolean;

    debitAccId: string | null;
    creditAccId: string | null;
    gstin?: string | null; // for purchase invoice

    purchaseLineItems: PurchaseLineItemType[];

    totalInvoiceAmount: number;
    totalQty: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;

    branchId: number;
    deletedIds: number[]; // of TranD table
    finYearId: number;
    
    tranHeaderId?: number;
    lineRemarks?: string | null;
}

type PurchaseLineItemType = {
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
    // amount: number;
    // jData: { [key: string]: string }
    discount: number;
    priceGst: number;
    // subTotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    lineRemarks?: string | null;
    serialNumbers?: string | null;
}