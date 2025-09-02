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
import { clearPurchaseReturnFormData, savePurchaseReturnFormData } from "../../purchase-returns/purchase-return-slice";
import { CompAccountsContainer } from "../../../../../controls/components/comp-accounts-container";
import { XDataObjectType } from "../../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../../utils/utils";
import { setActiveTabIndex } from "../../../../../controls/redux-components/comp-slice";
import { useAllPurchasesSubmit } from "../../purchases/all-purchases/all-purchases-submit-hook";
import { AllTables } from "../../../../../app/maps/database-tables-map";
import { useEffect } from "react";

export function AllPurchaseReturns() {
    const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.purchaseReturn.savedFormData);
    const instance = DataInstancesMap.allPurchaseReturns;
    const { branchId, finYearId, hasGstin, dbName, buCode } = useUtilsInfo();
    const methods = useForm<PurchaseFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultPurchaseFormValues() : savedFormData
        });
    const { clearErrors, getValues, setValue, reset, watch, } = methods;
    const { getTranHData } = useAllPurchasesSubmit(methods, Utils.getTranTypeId('PurchaseReturn'))
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

    useEffect(() => {
        if (savedFormData) {
            reset(_.cloneDeep(savedFormData),);
            setValue('toggle', !savedFormData.toggle, { shouldDirty: true }) // making forcefully dirty
        }
    }, [savedFormData, reset, setValue]);

    useEffect(() => {
        return (() => {
            const data = getValues()
            dispatch(savePurchaseReturnFormData(data));
        })
    }, [dispatch, getValues])

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer>
                    <label className="mt-1 font-bold text-md text-red-500">
                        Purchase Return
                    </label>
                    <CompTabs tabsInfo={tabsInfo} instance={instance} className="mt-2" />
                </CompAccountsContainer>
            </form>
        </FormProvider>
    );

    async function finalizeAndSubmit() {
        try {
            const xData: XDataObjectType = getTranHData();
            console.log(JSON.stringify(xData))
            await Utils.doGenericUpdate({
                buCode: buCode || "",
                dbName: dbName || "",
                tableName: AllTables.TranH.name,
                xData: xData,
            });

            if (watch('id')) {
                dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 1 })) // Switch to the second tab (Edit tab)
            }
            resetAll()
            Utils.showSaveMessage();
        } catch (e) {
            console.error(e);
        }
    }

    function getDefaultPurchaseFormValues(): PurchaseFormDataType {
        return ({
            id: undefined,
            autoRefNo: "",
            tranDate: '',
            userRefNo: null,
            remarks: null,
            tranTypeId: 10,
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
    }

}