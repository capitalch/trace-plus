import { FormProvider, useForm } from "react-hook-form";
// import { AppDispatchType } from "../../../../app/store";
// import { useDispatch } from "react-redux";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { CompAccountsContainer } from "../../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../../controls/redux-components/comp-tabs";
import { AllPurchasesMain } from "../all-purchases/all-purchases-main";
import { AllPurchasesView } from "../all-purchases/all-purchases-view";
// import { CustomModalDialog } from "../../../../../controls/components/custom-modal-dialog";
// import { PDFViewer } from "@react-pdf/renderer";
// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { AppDispatchType } from "../../../../../app/store";
// import { closePurchaseInvoicePreview } from "../purchase=slice";
// import { AllPurchasesPDF } from "./purchase-invoice-pdf";
// import { SalePurchaseEditDataType } from "../../../../../utils/global-types-interfaces-enums";
// import { Utils } from "../../../../../utils/utils";
// import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
// import { PurchaseInvoicePDF } from "./purchase-invoice-pdf";

export function AllPurchases() {
    // const dispatch: AppDispatchType = useDispatch()
    const instance = DataInstancesMap.allPurchases;
    const { branchId, /*currentDateFormat, buCode, dbName, decodedDbParamsObject,*/ finYearId, hasGstin } = useUtilsInfo();
    // const isPreviewOpen = useSelector((state: RootStateType) => state.purchase.isPreviewOpen);
    // const purchaseIdToPreview = useSelector((state: RootStateType) => state.purchase.purchaseIdToPreview);
    const methods = useForm<PurchaseFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: getDefaultPurchaseFormValues()
        });
    const { /*watch, getValues, setValue,*/ reset } = methods;
    const extendedMethods = { ...methods, resetAll, getDefaultPurchaseLineItem }
    // const [previewData, setPreviewData] = useState<SalePurchaseEditDataType | null>(null);

    // const getPurchaseDetailsOnId = useCallback(async (id: number | undefined) => {
    //     if (!id) {
    //         return
    //     }
    //     const result: any = await Utils.doGenericQuery({
    //         buCode: buCode || "",
    //         dbName: dbName || "",
    //         dbParams: decodedDbParamsObject,
    //         instance: instance,
    //         sqlId: SqlIdsMap.getSalePurchaseDetailsOnId,
    //         sqlArgs: {
    //             id: id,
    //         },
    //     });

    //     const data: SalePurchaseEditDataType = result?.[0]?.jsonResult;
    //     setPreviewData(data);
    // }, [buCode, dbName, decodedDbParamsObject, setPreviewData, instance]);

    // useEffect(() => {
    //     if (!purchaseIdToPreview) return
    //     if (!isPreviewOpen) return;
    //     getPurchaseDetailsOnId(purchaseIdToPreview)
    // }, [getPurchaseDetailsOnId, purchaseIdToPreview, isPreviewOpen])

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
    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer>
                    <label className="mt-1 text-md font-bold text-primary-500">
                        Purchase
                    </label>
                    <CompTabs tabsInfo={tabsInfo} instance={instance} className="mt-2" />

                    {/* Custom modal dialog */}
                    {/* <CustomModalDialog
                        isOpen={isPreviewOpen}
                        onClose={() => {
                            setPreviewData(null)
                            dispatch(closePurchaseInvoicePreview())
                        }}
                        title={`Purchase Invoice Preview`}
                        element={
                            previewData ? (<PDFViewer style={{ width: "100%", height: "100%" }}>
                                <PurchaseInvoicePDF
                                    currentDateFormat={currentDateFormat}
                                    // branchName={branchName || ''}
                                    previewData={previewData}
                                // tranH={previewData?.tranH || {}}
                                // tranD={previewData?.tranD || []}
                                />
                            </PDFViewer>) : <></>
                        }
                    /> */}
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
            tranDate: '', //new Date().toISOString().split('T')[0],
            userRefNo: null,
            remarks: null,
            tranTypeId: 5,
            isGstInvoice: hasGstin,
            isIgst: false,

            debitAccId: null,
            creditAccId: null,
            gstin: null,

            purchaseLineItems: [], //new Array(getDefaultPurchaseLineItem()),

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
        reset(getDefaultPurchaseFormValues())
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