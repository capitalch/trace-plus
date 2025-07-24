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
    const extendedMethods = { ...methods, resetAll }
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
            tranDate: new Date().toISOString().split('T')[0],
            userRefNo: null,
            remarks: null,
            finYearId: finYearId || 0,
            branchId: branchId || 1,
            autoRefNo: "",
            isGstInvoice: hasGstin,
            deletedIds: [],
            debitAccId: null,
            creditAccId: null,
            gstin: null,
            totalInvoiceAmount: 0,
            totalQty: 0,
            totalCgst: 0,
            totalSgst: 0,
            totalIgst: 0
        });
    }

    function resetAll() {
        // retain voucherType
        // const vchrType = watch('voucherType')
        reset(getDefaultPurchaseFormValues())
        // dispatch(clearVoucherFormData());
    }
}

export type PurchaseFormDataType = {
    id?: number;
    tranDate: string;
    userRefNo?: string | null;
    remarks?: string | null;
    finYearId: number;
    branchId: number;
    autoRefNo?: string;

    isGstInvoice: boolean;
    deletedIds: number[]; // of TranD table
    debitAccId: string | null;
    creditAccId: string | null;
    gstin?: string | null; // for purchase invoice
    totalInvoiceAmount:number;
    totalQty:number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
}