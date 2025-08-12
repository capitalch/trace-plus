import { useDispatch, useSelector } from "react-redux";
import _ from 'lodash'
import { AppDispatchType, RootStateType } from "../../../../../app/store";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { FormProvider, useForm } from "react-hook-form";
import { PurchaseFormDataType, PurchaseLineItemType } from "../../purchases/all-purchases/all-purchases";
import { CompTabs, CompTabsType } from "../../../../../controls/redux-components/comp-tabs";
import { AllPurchaseReturnsMain } from "../../purchase-returns/all-purchase-returns/all-purchase-returns-main";
import { AllPurchaseReturnsView } from "../../purchase-returns/all-purchase-returns/all-purchase-returns-view";
import { clearPurchaseReturnFormData } from "../../purchase-returns/purchase-return-slice";
import { CompAccountsContainer } from "../../../../../controls/components/comp-accounts-container";

export function AllPurchaseReturns() {
    const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.purchaseReturn.savedFormData);
    const instance = DataInstancesMap.allPurchaseReturns;
    const { branchId, finYearId, hasGstin, /*dbName, buCode, decodedDbParamsObject */ } = useUtilsInfo();
    const methods = useForm<PurchaseFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultPurchaseFormValues() : savedFormData
        });
    const { clearErrors, /*setError, getValues, setValue,*/ reset, /*watch, setFocus*/ } = methods;

    const extendedMethods = { ...methods, resetAll, getDefaultPurchaseLineItem, }

    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllPurchaseReturnsMain />
        },
        {
            label: "View",
            content: <AllPurchaseReturnsView />
        }
    ];

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer>
                    <label className="mt-1 text-md font-bold text-primary-500">
                        Purchase Returns
                    </label>
                    <CompTabs tabsInfo={tabsInfo} instance={instance} className="mt-2" />

                </CompAccountsContainer>
            </form>
        </FormProvider>
    );

    async function finalizeAndSubmit() { }

    function getDefaultPurchaseFormValues(): PurchaseFormDataType {
        return ({
            id: undefined,
            autoRefNo: "",
            tranDate: '',
            userRefNo: null,
            remarks: null,
            tranTypeId: 5,
            isGstInvoice: hasGstin,
            isIgst: false,

            debitAccId: null,
            creditAccId: null,
            gstin: null,

            purchaseLineItems: [],

            totalInvoiceAmount: 0,
            totalQty: 0,
            totalCgst: 0,
            totalSgst: 0,
            totalIgst: 0,

            branchId: branchId || 1,
            deletedIds: [],
            finYearId: finYearId || 0,
            toggle: true
        });
    }

    function getDefaultPurchaseLineItem(): PurchaseLineItemType {
        return ({
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
            subTotal: 0,
            amount: 0
        });
    }

    function resetAll() {
        clearErrors()
        reset(getDefaultPurchaseFormValues());
        dispatch(clearPurchaseReturnFormData());
        // dispatch(setInvoicExists(false))
    }

}