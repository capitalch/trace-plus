import clsx from "clsx";
import { TranHeaderType, voucherTypes } from "../../../../utils/global-types-interfaces-enums";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { useCallback, useEffect, useState } from "react";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconPreview1 } from "../../../../controls/icons/icon-preview1";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { VoucherTranDetailsType } from "../all-vouchers/all-vouchers-view";
import { CustomModalDialog } from "../../../../controls/components/custom-modal-dialog";
import { PDFViewer } from "@react-pdf/renderer";
import { AllVouchersPDF } from "../all-vouchers/all-vouchers-pdf";
import { closeVoucherPreview, triggerVoucherPreview } from "../voucher-slice";
import { AllVouchersCrown } from "../all-vouchers/all-vouchers-crown";
import { CompTabHeaders, CompTabsType } from "../../../../controls/redux-components/comp-tabs";

export function VoucherStatusBar({ className, tabsInfo }: VoucherStatusBarType) {
    const dispatch: AppDispatchType = useDispatch()
    const { watch, setValue } = useFormContext<VoucherFormDataType>();
    const isPreviewOpen = useSelector((state: RootStateType) => state.vouchers.isPreviewOpen);
    const voucherIdToPreview = useSelector((state: RootStateType) => state.vouchers.voucherIdToPreview);
    const { resetAll }: any = useFormContext()
    const voucherType = watch("voucherType");
    const activeTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[DataInstancesMap.allVouchers]?.activeTabIndex)
    const {
        currentDateFormat,
        buCode,
        branchName,
        dbName,
        decodedDbParamsObject,
    } = useUtilsInfo();

    const getPrintPreview = () => {
        let Ret = <></>
        if (activeTabIndex === 0) {
            const id = watch('id');
            if (id) {
                Ret = <TooltipComponent content='Print Preview' className="flex">
                    <button
                        type='button'
                        onClick={() => handleOnPreview(id)}
                        className="flex items-center gap-2 px-1 py-1 bg-white rounded-md shadow-sm border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
                    >
                        <IconPreview1 className="w-5 h-5 text-indigo-600" />
                        {/* <span className="text-xs font-semibold text-slate-700">Preview</span> */}
                    </button>
                </TooltipComponent>
            }
            return (Ret)
        }
    }

    const [previewData, setPreviewData] = useState<{
        tranH: TranHeaderType;
        tranD: VoucherTranDetailsType[];
    } | null>(null);

    const getVoucherDetails = useCallback(async (id: number | undefined) => {
        const result: any = await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            instance: DataInstancesMap.allVouchers,
            sqlId: SqlIdsMap.getVoucherDetailsOnId,
            sqlArgs: {
                id: id,
            },
        });

        const data = result?.[0]?.jsonResult;
        const tranType = Utils.getTranTypeName(data?.tranHeader?.tranTypeId || 2);

        setPreviewData({
            tranH: { ...data.tranHeader, tranType },
            tranD: data.tranDetails || [],
        });
    }, [buCode, dbName, decodedDbParamsObject, setPreviewData]);

    useEffect(() => {
        if (!voucherIdToPreview) return;
        if (!isPreviewOpen) return;
        getVoucherDetails(voucherIdToPreview)

    }, [voucherIdToPreview, isPreviewOpen, getVoucherDetails]);

    useEffect(() => {
        if (voucherType === 'Contra') {
            setValue('showGstInHeader', false)
        } else {
            setValue('showGstInHeader', true)
        }
    }, [voucherType, setValue])

    function handleVoucherTypeChange(newType: string) {
        resetAll();
        setValue('voucherType', newType as any);
    }

    return (
        <div className={clsx("w-full bg-gradient-to-r from-slate-50 to-slate-100 px-4 sm:px-6 py-3 rounded-lg shadow-sm border border-slate-200", className)}>
            <div className="flex flex-wrap gap-3 items-center">
                {/* Left section - Crown */}
                <div className="flex-shrink-0">
                    <AllVouchersCrown />
                </div>

                {/* Middle section - Tab Headers (Fixed Position) */}
                {tabsInfo && (
                    <div className="flex-shrink-0 order-3 lg:order-2 w-full lg:w-auto justify-center  flex lg:flex-1 lg:justify-center">
                        <CompTabHeaders
                            instance={DataInstancesMap.allVouchers}
                            tabsInfo={tabsInfo}
                        />
                    </div>
                )}

                {/* Right section - Preview and Voucher Type Buttons */}
                <div className="flex gap-2 items-center flex-wrap flex-shrink-0 order-2 lg:order-3 ml-auto">
                    <div className="flex gap-2 items-center">
                        {/* Preview button with fixed width to prevent layout shift */}
                        <div >
                            {getPrintPreview()}
                        </div>
                        {voucherTypes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleVoucherTypeChange(type)}
                                className={clsx(
                                    "cursor-pointer px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm whitespace-nowrap",
                                    voucherType === type
                                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-2 border-indigo-500 shadow-md scale-105"
                                        : "bg-white text-slate-700 border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md",
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom modal dialog */}
            <CustomModalDialog
                isOpen={isPreviewOpen}
                onClose={() => {
                    setPreviewData(null)
                    dispatch(closeVoucherPreview())
                }}
                title={`${voucherType} Voucher Preview`}
                element={
                    previewData ? (<PDFViewer style={{ width: "100%", height: "100%" }}>
                        <AllVouchersPDF
                            currentDateFormat={currentDateFormat}
                            branchName={branchName || ''}
                            tranH={previewData?.tranH || {}}
                            tranD={previewData?.tranD || []}
                        />
                    </PDFViewer>) : <></>
                }
            />
        </div>
    )

    async function handleOnPreview(id: number | undefined) {
        dispatch(triggerVoucherPreview(id || 0))
    }
}

type VoucherStatusBarType = {
    className?: string
    tabsInfo?: CompTabsType
}