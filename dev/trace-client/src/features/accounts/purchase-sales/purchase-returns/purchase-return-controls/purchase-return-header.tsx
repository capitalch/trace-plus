import { useFormContext } from "react-hook-form";
import _ from 'lodash';
import { useValidators } from "../../../../../utils/validators-hook";
import { FormField } from "../../../../../controls/widgets/form-field";
import clsx from "clsx";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../../utils/messages";
import { IconReset } from "../../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../../controls/icons/icon-submit";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { AppDispatchType, RootStateType } from "../../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconPreview1 } from "../../../../../controls/icons/icon-preview1";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { WidgetModeIndicatorBadge } from "../../../../../controls/widgets/widget-mode-indicator-badge";
import { PurchaseFormDataType } from "../../purchases/all-purchases/all-purchases";
import { Utils } from "../../../../../utils/utils";
import { PurchaseReturnSelectInvoice } from "./purchase-return-select-invoice";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { ExtGstTranDType, SalePurchaseDetailsWithExtraType, SalePurchaseEditDataType, TranDType, TranHType } from "../../../../../utils/global-types-interfaces-enums";
import { useEffect } from "react";
import { generatePurchaseReturnInvoicePDF } from "../all-purchase-returns/purchase-return-invoice-jspdf";
import { triggerPurchaseReturn } from "../purchase-return-slice";

export function PurchaseReturnHeader() {
    const dispatch:AppDispatchType = useDispatch()
    const activeTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[DataInstancesMap.allPurchaseReturns]?.activeTabIndex)
    const { branchName, buCode, dbName, decodedDbParamsObject, currentDateFormat } = useUtilsInfo();
    const purchaseReturnToggle = useSelector((state:RootStateType)=>state.purchaseReturn.toggle)
    const { checkAllowedDate } = useValidators();
    const {
        reset,
        setValue,
        watch,
        register,
        getValues,
        formState: { errors, isSubmitting, isDirty, isValid},
        trigger
    } = useFormContext<PurchaseFormDataType>();
    const { resetAll }: any = useFormContext();

    const getPrintPreview = () => {
        let Ret = <></>
        if (activeTabIndex === 0) {
            const id = watch('id');
            if (id) {
                Ret = <TooltipComponent content='Print Preview' className="flex">
                    <button type='button' onClick={() => handleOnPreview()}>
                        <IconPreview1 className="w-8 h-8 text-blue-500" />
                    </button>
                </TooltipComponent>
            }
            return (Ret)
        }
    }
    
    useEffect(() => {
        setTimeout(() => trigger(), 0) // trigger to redo computation of total amounts. This works
    }, [purchaseReturnToggle, trigger])

    return (
        <div className="relative flex flex-wrap p-2 bg-red-50 gap-6 mt-4 mb-6">
            {/* Mode Badge - Top Left Corner */}
            <div className="absolute -top-7 -left-5 z-10">
                <WidgetModeIndicatorBadge isEditMode={!!watch('id')} />
            </div>

            {/* Auto ref no */}
            <FormField label="Auto ref no" className="w-52">
                <input
                    type="text"
                    className={clsx("bg-gray-200 rounded mt-1")}
                    readOnly
                    disabled
                    title="Auto reference number"
                    value={watch("autoRefNo") ?? ''}
                />
            </FormField>

            {/* tran date */}
            <FormField label="Date" required error={errors?.tranDate?.message}>
                <input
                    type="date"
                    className={clsx(
                        inputFormFieldStyles, 'mt-1',
                        errors?.tranDate && "border-red-500 bg-red-100"
                    )}
                    {...register("tranDate", {
                        required: Messages.errRequired,
                        validate: checkAllowedDate
                    })}
                />
            </FormField>

            {/*  User ref no / Invoice no for Purchase Return*/}
            <FormField required label="Invoice No" error={errors?.userRefNo?.message}>
                <div className="relative">
                    <input
                        type="text"
                        className={clsx(inputFormFieldStyles, 'mt-1 pr-12')}
                        {...register("userRefNo")}
                    />
                    <TooltipComponent content='Select an invoice' position="RightCenter">
                        <button
                            type="button"
                            className="flex absolute items-center mt-1 px-3 inset-y-0 right-0" onClick={handleSearchInvoice}>
                            <IconSearch className="w-5 h-5 text-blue-500" />
                        </button>
                    </TooltipComponent>
                </div>
            </FormField>

            {/* Remarks */}
            <FormField className="w-auto min-w-60" label="Remarks">
                <textarea
                    rows={3}
                    className={clsx(inputFormFieldStyles, "text-xs mt-1")}
                    placeholder="Enter remarks"
                    {...register("remarks")}
                />
            </FormField>

            {/* Is GST Invoice */}
            <FormField label="GST Invoice ?" className="items-center ml-4">
                <div className="flex items-center mt-3 gap-2">
                    <button
                        type="button"
                        className={clsx(
                            "px-4 py-1 text-sm rounded-full border",
                            watch("isGstInvoice")
                                ? "bg-green-500 text-white border-green-600"
                                : "bg-white text-gray-600 border-gray-300"
                        )}
                        onClick={() => setValue("isGstInvoice", true, { shouldDirty: true })}
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        className={clsx(
                            "px-4 py-1 text-sm rounded-full border",
                            !watch("isGstInvoice")
                                ? "bg-red-500 text-white border-red-600"
                                : "bg-white text-gray-600 border-gray-300"
                        )}
                        onClick={() => setValue("isGstInvoice", false, { shouldDirty: true })}
                    >
                        No
                    </button>
                </div>
            </FormField>

            {/* Reset submit */}
            <div className="flex mt-6 ml-auto h-10 gap-3">
                {getPrintPreview()}

                {/* Reset */}
                <button
                    onClick={resetAll}
                    type="button"
                    className="inline-flex items-center px-5 font-medium text-center text-white bg-amber-500 rounded-lg hover:bg-amber-800 focus:outline-hidden focus:ring-4 focus:ring-amber-300 disabled:bg-amber-200 dark:bg-amber-600 dark:focus:ring-amber-800 dark:hover:bg-amber-700"
                >
                    <IconReset className="mr-2 w-6 h-6 text-white" />
                    Reset
                </button>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || (!isValid)}
                    className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-teal-500 rounded-lg hover:bg-teal-800 focus:outline-hidden focus:ring-4 focus:ring-teal-300 disabled:bg-teal-200 dark:bg-teal-600 dark:focus:ring-teal-800 dark:hover:bg-teal-700"
                >
                    <IconSubmit className="mr-2 w-6 h-6 text-white" /> Submit
                </button>
            </div>
        </div>
    );

    async function getPurchaseDetailsOnId(id: number) {
        return (await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getSalePurchaseDetailsOnId,
            sqlArgs: {
                id: id,
            },
        }))
    }

    function handleOnPreview() {
        const purchaseEditData: any = getValues('purchaseEditData') || {}
        if (_.isEmpty(purchaseEditData)) return
        generatePurchaseReturnInvoicePDF(purchaseEditData, branchName || '', currentDateFormat)
    }

    function handleSearchInvoice() {
        Utils.showHideModalDialogA({
            title: "Select Invoice",
            isOpen: true,
            element: <PurchaseReturnSelectInvoice onSelect={populateInvoiceOnId} />,
            size: 'lg',
        })
    }

    async function populateInvoiceOnId(id: number) {
        if (!id) return
        const editData: any = await getPurchaseDetailsOnId(id);
        const purchaseEditData: SalePurchaseEditDataType = editData?.[0]?.jsonResult
        setValue('purchaseEditData', undefined)
        const tranH: TranHType = purchaseEditData.tranH
        const tranD: TranDType[] = purchaseEditData.tranD
        const extGsTranD: ExtGstTranDType = purchaseEditData.extGstTranD
        const salePurchaseDetails: SalePurchaseDetailsWithExtraType[] = purchaseEditData.salePurchaseDetails

        reset({
            id: undefined,
            userRefNo: tranH.userRefNo,
            tranTypeId: tranH.tranTypeId,
            remarks: tranH.userRefNo,
            isGstInvoice: Boolean(extGsTranD?.id),
            debitAccId: tranD.find((item) => item.dc === "C")?.accId, //Mind it, this is opposite
            creditAccId: tranD.find((item) => item.dc === "D")?.accId,
            gstin: extGsTranD?.gstin,
            isIgst: extGsTranD?.igst ? true : false,
            purchaseEditData: undefined, // purchaseEditData os used for id later on

            totalCgst: extGsTranD?.cgst,
            totalSgst: extGsTranD?.sgst,
            totalIgst: extGsTranD?.igst,
            totalQty: salePurchaseDetails.reduce((sum, item) => sum + (item.qty || 0), 0),
            totalInvoiceAmount: tranD?.[0]?.amount || 0,

            purchaseLineItems: salePurchaseDetails.map((item) => ({
                id: undefined,
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
        dispatch(triggerPurchaseReturn())
    }
}