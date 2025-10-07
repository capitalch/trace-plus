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

export function VoucherTypeOptions({ className }: VoucherTypeOptionsType) {
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

    const getLabel = () => {
        let label = ''
        if (activeTabIndex === 0) {
            const id = watch('id');
            label = `${id ? 'Edit' : 'New'} Entry`;
        }
        return (label)
    }

    const getPrintPreview = () => {
        let Ret = <></>
        if (activeTabIndex === 0) {
            const id = watch('id');
            if (id) {
                Ret = <TooltipComponent content='Print Preview' className="flex">
                    <button type='button' onClick={() => handleOnPreview(id)}>
                        <IconPreview1 className="w-8 h-8 text-blue-500" />
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
        <div className={clsx("flex gap-2 items-center", className)}>
            <label className="w-20 font-semibold text-amber-400 text-md">
                {getLabel()}
            </label>
            {getPrintPreview()}
            {voucherTypes.map((type) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => handleVoucherTypeChange(type)}
                    className={clsx(
                        "cursor-pointer px-4 py-1 rounded-md border font-medium text-md",
                        voucherType === type
                            ? "bg-green-600 text-white border-blue-700"
                            : "bg-gray-50 text-gray-900 border-gray-300 hover:bg-green-400",
                    )}
                >
                    {type}
                </button>
            ))}

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

type VoucherTypeOptionsType = {
    className?: string
}