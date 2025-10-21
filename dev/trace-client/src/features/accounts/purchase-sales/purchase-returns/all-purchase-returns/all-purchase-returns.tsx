import { useDispatch, useSelector } from "react-redux";
import _ from 'lodash'
import { AppDispatchType, RootStateType } from "../../../../../app/store";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { FormProvider, useForm } from "react-hook-form";
import { PurchaseFormDataType, PurchaseLineItemType } from "../../purchases/all-purchases/all-purchases";
import { CompTabsType } from "../../../../../controls/redux-components/comp-tabs";
import { AllPurchaseReturnsMain } from "../../purchase-returns/all-purchase-returns/all-purchase-returns-main";
import { AllPurchaseReturnsView } from "../../purchase-returns/all-purchase-returns/all-purchase-returns-view";
import { WidgetTabToggleButtons } from "../../../../../controls/widgets/widget-tab-toggle-buttons";
import { clearPurchaseReturnFormData, savePurchaseReturnFormData } from "../../purchase-returns/purchase-return-slice";
import { CompAccountsContainer } from "../../../../../controls/redux-components/comp-accounts-container";
import { XDataObjectType, SalePurchaseEditDataType, ExtGstTranDType, TranDType, TranHType, SalePurchaseDetailsWithExtraType } from "../../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../../utils/utils";
import { setActiveTabIndex, setCompAccountsContainerMainTitle } from "../../../../../controls/redux-components/comp-slice";
import { useAllPurchasesSubmit } from "../../purchases/all-purchases/all-purchases-submit-hook";
import { AllTables } from "../../../../../app/maps/database-tables-map";
import { useEffect } from "react";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { Messages } from "../../../../../utils/messages";
import { useLocation } from "react-router-dom";
import { usePurchaseReturnPermissions } from "../../../../../utils/permissions/permissions-hooks";

/**
 * Child component that renders purchase return tabs and content.
 * Must be rendered inside FormProvider to access form context.
 */
function AllPurchaseReturnsContent({ instance }: { instance: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const selectedTabIndex = useSelector((state: RootStateType) =>
        state.reduxComp.compTabs[instance]?.activeTabIndex || 0
    )

    // ✅ Get purchase return permissions
    const { canView } = usePurchaseReturnPermissions()

    // Utility function to generate purchase return title
    const getPurchaseReturnTitle = (isViewMode: boolean): string => {
        return isViewMode ? "Purchase Return View" : "Purchase Return";
    }

    // Build tabs array with conditional View tab
    const visibleTabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllPurchaseReturnsMain />
        },
        // ✅ Only include View tab if user has permission
        ...(canView ? [{
            label: "View",
            content: <AllPurchaseReturnsView />
        }] : [])
    ]

    // Update main title when active tab changes
    useEffect(() => {
        const isViewMode = selectedTabIndex === 1;
        const title = getPurchaseReturnTitle(isViewMode);
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: title }));
    }, [selectedTabIndex, dispatch]);

    // Auto-switch to New/Edit tab if user loses View permission
    useEffect(() => {
        if (selectedTabIndex === 1 && !canView) {
            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 }))
        }
    }, [canView, selectedTabIndex, dispatch, instance])

    return (
        <>
            <CompAccountsContainer
                MiddleCustomControl={() => (
                    <WidgetTabToggleButtons
                        instance={instance}
                        tabsInfo={visibleTabsInfo}
                    />
                )}
            >
                <div className="mt-4">
                    {visibleTabsInfo[selectedTabIndex]?.content}
                </div>
            </CompAccountsContainer>
        </>
    )
}

export function AllPurchaseReturns() {
    const dispatch: AppDispatchType = useDispatch()
    const location = useLocation()
    const savedFormData = useSelector((state: RootStateType) => state.purchaseReturn.savedFormData);
    const instance = DataInstancesMap.allPurchaseReturns;
    const { branchId, finYearId, hasGstin, dbName, buCode, decodedDbParamsObject } = useUtilsInfo();
    const methods = useForm<PurchaseFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultPurchaseFormValues() : savedFormData
        });
    const { clearErrors, getValues, setValue, reset, watch, } = methods;
    const { getTranHData } = useAllPurchasesSubmit(methods, Utils.getTranTypeId('PurchaseReturn'))
    const extendedMethods = { ...methods, resetAll, getDefaultPurchaseLineItem, populateFormFromId, getPurchaseReturnEditDataOnId }
    const selectedTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[instance]?.activeTabIndex ?? 0);

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

    // Reset form when switches to View tab
    useEffect(() => {
        if (selectedTabIndex === 1) {
            resetAll();
        }
    }, [selectedTabIndex]);

    // Handle navigation from report - auto-populate form with ID from location state
    useEffect(() => {
        if (location.state?.id && location.state?.returnPath) {
            populateFormFromId(location.state.id)
        }
    }, [location.state?.id, location.state?.returnPath]);

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                {/* ✅ Render child component inside FormProvider */}
                <AllPurchaseReturnsContent instance={instance} />
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

            if (watch('id') && (!location.state?.id)) {
                dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 1 })) // Switch to the second tab (Edit tab)
            }
            if (!location.state?.id) {
                resetAll()
            }
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

    // === DATABASE QUERY FUNCTIONS ===
    async function getPurchaseReturnDetailsOnId(id: number | undefined) {
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

    async function getPurchaseReturnEditDataOnId(id: number | undefined) {
        const editData: any = await getPurchaseReturnDetailsOnId(id)
        const purchaseReturnEditData: SalePurchaseEditDataType = editData?.[0]?.jsonResult
        if (!purchaseReturnEditData) {
            return null
        }
        return (purchaseReturnEditData)
    }

    // === FORM POPULATION FUNCTIONS ===
    async function populateFormFromId(id: number) {
        try {
            const purchaseReturnEditData: SalePurchaseEditDataType | null = await getPurchaseReturnEditDataOnId(id)
            if (!purchaseReturnEditData) {
                Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
                return
            }
            const tranH: TranHType = purchaseReturnEditData.tranH
            const tranD: TranDType[] = purchaseReturnEditData.tranD
            const extGsTranD: ExtGstTranDType = purchaseReturnEditData.extGstTranD
            const salePurchaseDetails: SalePurchaseDetailsWithExtraType[] = purchaseReturnEditData.salePurchaseDetails

            reset({
                id: tranH.id,
                autoRefNo: tranH.autoRefNo,
                tranDate: tranH.tranDate,
                userRefNo: tranH.userRefNo,
                remarks: tranH.remarks,
                tranTypeId: tranH.tranTypeId,
                isGstInvoice: Boolean(extGsTranD?.id),
                debitAccId: tranD.find((item) => item.dc === "D")?.accId,
                creditAccId: tranD.find((item) => item.dc === "C")?.accId,
                gstin: extGsTranD?.gstin,
                isIgst: extGsTranD?.igst ? true : false,

                totalCgst: extGsTranD?.cgst,
                totalSgst: extGsTranD?.sgst,
                totalIgst: extGsTranD?.igst,
                totalQty: salePurchaseDetails.reduce((sum, item) => sum + (item.qty || 0), 0),
                totalInvoiceAmount: tranD?.[0]?.amount || 0,
                purchaseEditData: purchaseReturnEditData,
                purchaseLineItems: salePurchaseDetails.map((item) => ({
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
                    serialNumbers: item.serialNumbers || null
                }))
            },)
            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 })) // Switch to the first tab (Edit tab)
        } catch (e: any) {
            console.error(e);
            Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
        }
    }

    function resetAll() {
        clearErrors()
        reset(getDefaultPurchaseFormValues());
        dispatch(clearPurchaseReturnFormData());
    }

}