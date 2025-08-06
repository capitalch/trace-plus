import { FormProvider, useForm } from "react-hook-form";
import _ from 'lodash'
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { CompAccountsContainer } from "../../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../../controls/redux-components/comp-tabs";
import { AllPurchasesMain } from "../all-purchases/all-purchases-main";
import { AllPurchasesView } from "../all-purchases/all-purchases-view";
import { SalePurchaseEditDataType, TraceDataObjectType, XDataObjectType } from "../../../../../utils/global-types-interfaces-enums";
import { AppDispatchType, RootStateType } from "../../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { clearPurchaseFormData, savePurchaseFormData } from "../purchase-slice";
import { useEffect } from "react";
import { Utils } from "../../../../../utils/utils";
import { AllTables } from "../../../../../app/maps/database-tables-map";
import { setActiveTabIndex } from "../../../../../controls/redux-components/comp-slice";

export function AllPurchases() {
    const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.purchase.savedFormData);
    const instance = DataInstancesMap.allPurchases;
    const { branchId, finYearId, hasGstin, dbName, buCode } = useUtilsInfo();
    const methods = useForm<PurchaseFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultPurchaseFormValues() : savedFormData
        });
    const { getValues, setValue, reset, watch } = methods;
    const extendedMethods = { ...methods, resetAll, getDefaultPurchaseLineItem }

    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllPurchasesMain />
        },
        {
            label: "View",
            content: <AllPurchasesView />
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
            dispatch(savePurchaseFormData(data));
        })
    }, [dispatch, getValues])

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

    async function finalizeAndSubmit(data: PurchaseFormDataType) {
        console.log(data)
        try {
            const xData: XDataObjectType = getTranHData();
            xData.deletedIds = undefined
            // await Utils.doGenericUpdate({
            //     buCode: buCode || "",
            //     dbName: dbName || "",
            //     tableName: AllTables.TranH.name,
            //     xData: xData,
            // });

            if (watch('id')) {
                dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 1 })) // Switch to the second tab (Edit tab)
            }
            resetAll()
            Utils.showSaveMessage();
        } catch (e) {
            console.error(e);
        }
    }

    function getTranHData(): XDataObjectType {
        return {
            id: (getValues("id")) || undefined,
            tranDate: getValues("tranDate"),
            userRefNo: getValues("userRefNo"),
            remarks: getValues("remarks"),
            tranTypeId: Utils.getTranTypeId('Purchase'),
            finYearId: finYearId,
            branchId: branchId,
            posId: 1,
            autoRefNo: getValues("autoRefNo") || undefined,
            xDetails: getTranDDetails(),
        };
    }

    function getTranDDetails() {
        const deletedIds = getValues("deletedIds") || []
        // const purchaseDetails =
        const details: TraceDataObjectType[] = [{
            tableName: AllTables.TranD.name,
            fkeyName: "tranHeaderId",
            xData: getTranDData(),
            deletedIds: [...deletedIds]
        }];
        return (details)
    }

    function getTranDData(): XDataObjectType[] {
        const extGstTranDDetails = getExtGstTranDDetails()
        const salePurchaseDetailsDetails = getSalePurchaseDetailsDetails()
        const xDetails = []
        if (!_.isEmpty(extGstTranDDetails)) {
            xDetails.push(extGstTranDDetails)
        }
        if (!_.isEmpty(salePurchaseDetailsDetails)) {
            xDetails.push(salePurchaseDetailsDetails)
        }
        const debit: XDataObjectType = {
            id: undefined,
            accId: getValues('debitAccId'),
            dc: 'D',
            amount: getValues('totalInvoiceAmount'),
        }
        if (!_.isEmpty(xDetails)) {
            debit.xDetails = xDetails as TraceDataObjectType | TraceDataObjectType[]
        }
        const credit: XDataObjectType = {
            id: undefined,
            accId: getValues('creditAccId'),
            dc: 'C',
            amount: getValues('totalInvoiceAmount'),
        }
        return ([debit, credit])
    }

    function getExtGstTranDDetails(): TraceDataObjectType | undefined {
        const isGstInvoice = getValues('isGstInvoice')
        if (!isGstInvoice) return (undefined)
        return ({
            tableName: AllTables.ExtGstTranD.name,
            fkeyName: 'tranDetailsId',
            xData: {
                id: undefined,
                gstin: getValues('gstin'),
                rate: null,
                cgst: getValues('totalCgst'),
                sgst: getValues('totalSgst'),
                igst: getValues('totalIgst'),
                isInput: true,
                hsn: null
            }
        })
    }

    function getSalePurchaseDetailsDetails(): TraceDataObjectType {
        const purchaseLineItems = getValues('purchaseLineItems')
        const xData = purchaseLineItems.map((entry) => ({
            id: undefined,
            productId: entry.productId,
            qty: entry.qty,
            price: entry.price,
            priceGst: entry.priceGst,
            discount: entry.discount,
            cgst: entry.cgst,
            sgst: entry.sgst,
            igst: entry.igst,
            amount: entry.amount,
            hsn: entry.hsn,
            gstRate: entry.gstRate
        }))
        return ({
            tableName: AllTables.SalePurchaseDetails.name,
            fkeyName: 'tranDetailsId',
            xData: xData
        })
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

    function resetAll() {
        reset(getDefaultPurchaseFormValues());
        dispatch(clearPurchaseFormData());
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
    deletedIds: number[]; // of TranD table
    finYearId: number;

    tranHeaderId?: number;
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
    // jData: { [key: string]: string }
    discount: number;
    priceGst: number;
    subTotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    lineRemarks?: string | null;
    serialNumbers?: string | null;
}