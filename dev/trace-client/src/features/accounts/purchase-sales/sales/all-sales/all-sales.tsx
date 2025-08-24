import { FormProvider, useForm } from "react-hook-form";
import _ from 'lodash'
import { CompAccountsContainer } from "../../../../../controls/components/comp-accounts-container";
import { SalePurchaseEditDataType } from "../../../../../utils/global-types-interfaces-enums";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { RootStateType } from "../../../../../app/store";
import { useSelector } from "react-redux";
import SalesForm from "./sample-sales-form";

export function AllSales() {
    const instance = DataInstancesMap.allSales;
    const savedFormData = useSelector((state: RootStateType) => state.sales.savedFormData);
    const { branchId, finYearId, hasGstin, dbName, buCode, decodedDbParamsObject } = useUtilsInfo();
    const methods = useForm<SalesFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultSalesFormValues() : savedFormData
        });
    const { clearErrors, setError, getValues, setValue, reset, watch, setFocus } = methods;
    const extendedMethods = { ...methods, /*resetAll, getDefaultPurchaseLineItem, checkPurchaseInvoiceExists*/ }

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer>
                    <label className="mt-1 text-md font-bold text-primary-500">
                        Sales
                    </label>
                    <SalesForm />
                    {/* <CompTabs tabsInfo={tabsInfo} instance={instance} className="mt-2" /> */}
                </CompAccountsContainer>
            </form>
        </FormProvider>
    );

    async function finalizeAndSubmit() { }
    function getDefaultSalesFormValues() {
        return ({})
    }
}

export type SalesFormDataType = {
    id?: number;
    autoRefNo?: string;
    tranDate: string;
    userRefNo?: string | null;
    remarks?: string | null;
    tranTypeId: number;
    isGstBill: boolean;
    isIgst: boolean;

    debitAccId: string | number | null;
    creditAccId: string | number | null;
    gstin?: string | null;

    branchId: number;
    deletedIds: number[]; // of PurchaseSaleDetails table
    finYearId: number;

    lineRemarks?: string | null;

    purchaseEditData?: SalePurchaseEditDataType
    toggle: boolean; // For making the form forcefully dirty
}