import { FormProvider, useForm} from "react-hook-form";
import _ from 'lodash'
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { CompAccountsContainer } from "../../../../../controls/redux-components/comp-accounts-container";
import { CompTabsType } from "../../../../../controls/redux-components/comp-tabs";
import { AllPurchasesMain } from "../all-purchases/all-purchases-main";
import { AllPurchasesView } from "../all-purchases/all-purchases-view";
import { WidgetTabToggleButtons } from "../../../../../controls/widgets/widget-tab-toggle-buttons";
import { SalePurchaseEditDataType, XDataObjectType, ExtGstTranDType, TranDType, TranHType, SalePurchaseDetailsWithExtraType } from "../../../../../utils/global-types-interfaces-enums";
import { AppDispatchType, RootStateType } from "../../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { clearPurchaseFormData, savePurchaseFormData, setInvoicExists } from "../purchase-slice";
import { useEffect } from "react";
import { Utils } from "../../../../../utils/utils";
import { setActiveTabIndex, setCompAccountsContainerMainTitle } from "../../../../../controls/redux-components/comp-slice";
import { useAllPurchasesSubmit } from "./all-purchases-submit-hook";
import { Messages } from "../../../../../utils/messages";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { AllTables } from "../../../../../app/maps/database-tables-map";
import { useLocation } from "react-router-dom";
import { usePurchasePermissions } from "../../../../../utils/permissions/permissions-hooks";

/**
 * Child component that renders purchase tabs and content.
 * Must be rendered inside FormProvider to access form context.
 */
function AllPurchasesContent({ instance }: { instance: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const selectedTabIndex = useSelector((state: RootStateType) =>
        state.reduxComp.compTabs[instance]?.activeTabIndex || 0
    )

    // ✅ Get purchase permissions
    const { canView } = usePurchasePermissions()

    // Utility function to generate purchase title
    const getPurchaseTitle = (isViewMode: boolean): string => {
        return isViewMode ? "Purchase View" : "Purchase";
    }

    // Build tabs array with conditional View tab
    const visibleTabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllPurchasesMain />
        },
        // ✅ Only include View tab if user has permission
        ...(canView ? [{
            label: "View",
            content: <AllPurchasesView />
        }] : [])
    ]

    // Update main title when active tab changes
    useEffect(() => {
        const isViewMode = selectedTabIndex === 1;
        const title = getPurchaseTitle(isViewMode);
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

export function AllPurchases() {
    const dispatch: AppDispatchType = useDispatch()
    const location = useLocation()
    const savedFormData = useSelector((state: RootStateType) => state.purchase.savedFormData);
    const instance = DataInstancesMap.allPurchases;
    const { branchId, finYearId, hasGstin, dbName, buCode, decodedDbParamsObject } = useUtilsInfo();
    const methods = useForm<PurchaseFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultPurchaseFormValues() : savedFormData
        });
    const { clearErrors, setError, getValues, setValue, reset, watch, setFocus } = methods;
    const { getTranHData } = useAllPurchasesSubmit(methods)
    const extendedMethods = { ...methods, resetAll, getDefaultPurchaseLineItem, checkPurchaseInvoiceExists, populateFormFromId, getPurchaseEditDataOnId }
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
            dispatch(savePurchaseFormData(data));
        })
    }, [dispatch, getValues])

    // Reset form when switches to View tab
    useEffect(() => {
        if (selectedTabIndex === 1 ) {
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
                <AllPurchasesContent instance={instance} />
            </form>
        </FormProvider>
    );

    async function checkPurchaseInvoiceExists() {
        const invoiceNo = getValues('userRefNo')
        const creditAccId = getValues('creditAccId')
        if ((!invoiceNo) || (!creditAccId)) {
            return (true)
        }
        const res = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.doesPurchaseInvoiceExist,
            sqlArgs: {
                finYearId: finYearId,
                id: getValues('id') || 0,
                tranTypeId: 5,
                accId: creditAccId,
                userRefNo: invoiceNo
            }
        })
        const isExists = Boolean(res[0])
        if (isExists) {
            dispatch(setInvoicExists(true))
            setError('userRefNo', { type: 'manual', message: Messages.errInvoiceExists });
            return (false);
        } else {
            dispatch(setInvoicExists(false))
            clearErrors('userRefNo')
        }
        return (true);
    }

    async function finalizeAndSubmit() {
        const isInvoiceValid = await checkPurchaseInvoiceExists();
        if (!isInvoiceValid) {
            // Focus the field if needed
            setFocus("userRefNo");
            Utils.showAlertMessage('Error', Messages.errInvoiceExists)
            return;
        }
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
            if (!location.state?.id){
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

    // === DATABASE QUERY FUNCTIONS ===
    async function getPurchaseDetailsOnId(id: number | undefined) {
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

    async function getPurchaseEditDataOnId(id: number | undefined) {
        const editData: any = await getPurchaseDetailsOnId(id)
        const purchaseEditData: SalePurchaseEditDataType = editData?.[0]?.jsonResult
        if (!purchaseEditData) {
            return null
        }
        return (purchaseEditData)
    }

    // === FORM POPULATION FUNCTIONS ===
    async function populateFormFromId(id: number) {
        try {
            const purchaseEditData: SalePurchaseEditDataType | null = await getPurchaseEditDataOnId(id)
            if (!purchaseEditData) {
                Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
                return
            }
            const tranH: TranHType = purchaseEditData.tranH
            const tranD: TranDType[] = purchaseEditData.tranD
            const extGsTranD: ExtGstTranDType = purchaseEditData.extGstTranD
            const salePurchaseDetails: SalePurchaseDetailsWithExtraType[] = purchaseEditData.salePurchaseDetails

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
                purchaseEditData: purchaseEditData,
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
            })
            dispatch(setInvoicExists(false))
            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 })) // Switch to the first tab (Edit tab)
        } catch (e: any) {
            console.error(e);
            Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
        }
    }

    function resetAll() {
        clearErrors()
        reset(getDefaultPurchaseFormValues());
        dispatch(clearPurchaseFormData());
        dispatch(setInvoicExists(false))
    }
}

export type PurchaseFormDataType = {
    id?: number;
    autoRefNo?: string;
    tranDate: string;
    userRefNo?: string | null;
    remarks?: string | null;
    tranTypeId: number;
    isGstInvoice: boolean;
    isIgst: boolean;

    debitAccId: string | number | null;
    creditAccId: string | number | null;
    gstin?: string | null; // for purchase invoice

    purchaseLineItems: PurchaseLineItemType[];

    totalInvoiceAmount: number;
    totalQty: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;

    branchId: number;
    deletedIds: number[]; // of PurchaseSaleDetails table
    finYearId: number;

    lineRemarks?: string | null;

    purchaseEditData?: SalePurchaseEditDataType
    toggle: boolean; // For making the form forcefully dirty
}

export type PurchaseLineItemType = {
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