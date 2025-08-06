import { format } from "date-fns";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { AllVouchersMain } from "./all-vouchers-main";
import { VoucherTypeOptions } from "../voucher-controls/voucher-type-options";
import { FormProvider, useForm } from "react-hook-form";
import { TraceDataObjectType, VourcherType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { AppDispatchType, RootStateType, } from "../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { AllVouchersView } from "./all-vouchers-view";
import { setActiveTabIndex } from "../../../../controls/redux-components/comp-slice";
import { useEffect, useRef } from "react";
import { Messages } from "../../../../utils/messages";
import _ from "lodash";
import { clearVoucherFormData, saveVoucherFormData } from "../voucher-slice";

export function AllVouchers() {
    const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.vouchers.savedFormData);
    const instance = DataInstancesMap.allVouchers;
    const meta = useRef<MetaType>({
        totalDebits: 0,
        totalCredits: 0
    })
    const { branchId, buCode, dbName, finYearId, hasGstin } = useUtilsInfo();
    const methods = useForm<VoucherFormDataType>(
        {
            mode: "onTouched",
            criteriaMode: "all",
            defaultValues: savedFormData ?? getDefaultVoucherFormValues()
        });
    const { watch, getValues, setValue, reset } = methods;
    const extendedMethods = { ...methods, resetAll, resetDetails }
    const voucherType = watch('voucherType')
    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllVouchersMain />
        },
        {
            label: "View",
            content: <AllVouchersView instance={instance} />
        }
    ];

    useEffect(() => {
        if (savedFormData) {
            methods.reset(_.cloneDeep(savedFormData),);
            setValue('toggle', !savedFormData.toggle, { shouldDirty: true }) // making forcefully dirty
        }
    }, [savedFormData, methods, setValue]);

    useEffect(() => {
        return (() => {
            const data = getValues()
            dispatch(saveVoucherFormData(data));
        })
    }, [dispatch, getValues])

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmitVoucher)} className="flex flex-col">
                <CompAccountsContainer className=" relative">
                    <label className="mt-1 text-md font-bold text-primary-500">
                        All Vouchers
                    </label>
                    {/* Sticky voucher type selector */}
                    <div className="sticky top-0 right-6 self-end z-5">
                        <VoucherTypeOptions className="absolute right-0 top-2 rounded" />
                    </div>
                    <CompTabs tabsInfo={tabsInfo} instance={instance} className="mt-2" />
                </CompAccountsContainer>
            </form>
        </FormProvider>
    )

    function getDefaultVoucherFormValues(): VoucherFormDataType {
        return ({
            id: undefined,
            tranDate: format(new Date(), "yyyy-MM-dd"),
            userRefNo: null,
            remarks: null,
            tranTypeId: 2,
            finYearId: finYearId || 0,
            branchId: branchId || 1,
            posId: 1,
            autoRefNo: '',
            voucherType: 'Payment' as VourcherType,
            isGst: false,
            creditEntries: [getDefaultEntry('C')],
            debitEntries: [getDefaultEntry('D')],
            deletedIds: [],
            showGstInHeader: hasGstin,
            toggle: true,
        })
    }

    function getDefaultEntry(entryType: 'D' | 'C') {
        return ({
            id: undefined,
            accId: null,
            remarks: null,
            dc: entryType,
            amount: 0,
            tranHeaderId: undefined,
            lineRefNo: null,
            instrNo: null,
            gst: undefined,
            deletedIds: [],
        })
    }

    async function finalizeAndSubmitVoucher(data: VoucherFormDataType) {
        try {
            const xData: XDataObjectType = getTranHData();
            // ✅ Check total debits and credits
            if ((meta.current.totalCredits !== meta.current.totalDebits) || (meta.current.totalCredits === 0) || (meta.current.totalDebits === 0)) {
                Utils.showAlertMessage('Error', Messages.errDebitCreditMismatch)
                return
            }
            // ✅ Check for duplicate accId in debit and credit
            const creditAccIds = new Set(data.creditEntries.map(entry => entry.accId).filter(Boolean));
            const duplicateAccId = data.debitEntries.find(entry => creditAccIds.has(entry.accId));
            if (duplicateAccId) {
                Utils.showAlertMessage("Error", Messages.errSameAccountCannotAppearInDebitAndCredit);
                return;
            }
            // ✅ Proceed with saving
            xData.deletedIds = undefined
            await Utils.doValidateDebitCreditAndUpdate({
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

    function getTranHData(): XDataObjectType {
        return {
            id: (getValues("id")) || undefined,
            tranDate: getValues("tranDate"),
            userRefNo: getValues("userRefNo"),
            remarks: getValues("remarks"),
            tranTypeId: Utils.getTranTypeId(voucherType),
            finYearId: finYearId,
            branchId: branchId,
            posId: 1,
            autoRefNo: getValues("autoRefNo") || undefined,
            xDetails: getTranDDetails(),
        };
    }

    function getTranDDetails() {
        const deletedIds = getValues("deletedIds") || []
        const details: TraceDataObjectType[] = [{
            tableName: AllTables.TranD.name,
            fkeyName: "tranHeaderId",
            xData: getTranDData(),
            deletedIds: [...deletedIds]
        }];
        return (details)
    }

    function getTranDData(): XDataObjectType[] {
        const creditEntries = getValues("creditEntries") || [];
        const debitEntries = getValues("debitEntries") || [];
        const credits: XDataObjectType[] = creditEntries.map((entry) => ({
            id: entry.id || undefined,
            accId: entry.accId || null,
            remarks: entry.remarks || null,
            dc: entry.dc,
            amount: entry.amount,
            lineRefNo: entry.lineRefNo || null,
            instrNo: entry.instrNo || null,
            xDetails: getExtGstTranDDetails(entry),
        }));
        const debits: XDataObjectType[] = debitEntries.map((entry) => ({
            id: entry.id || undefined,
            accId: entry.accId || null,
            remarks: entry.remarks || null,
            dc: entry.dc,
            amount: entry.amount,
            lineRefNo: entry.lineRefNo || null,
            instrNo: entry.instrNo || null,
            xDetails: getExtGstTranDDetails(entry),
        }));
        // ✅ Calculate totals
        meta.current.totalDebits = debits.reduce((acc: number, d) => acc + (d.amount || 0), 0);
        meta.current.totalCredits = credits.reduce((acc: number, c) => acc + (c.amount || 0), 0);
        return [...credits, ...debits];
    }

    function getExtGstTranDDetails(entry: VoucherLineItemEntryDataType): TraceDataObjectType | undefined {
        const hasGstData = getValues("isGst") && entry.gst?.rate;
        const deletedIds = getDeletedIdsFromDebitAndCreditEntries();

        // If no GST data and no deleted IDs, return undefined
        if (!hasGstData && _.isEmpty(deletedIds)) return undefined;

        const trace: TraceDataObjectType = {
            tableName: AllTables.ExtGstTranD.name,
        };

        if (hasGstData) {
            trace.fkeyName = "tranDetailsId";
            trace.xData = {
                id: entry?.gst?.id || undefined,
                gstin: entry?.gst?.gstin || null,
                rate: entry?.gst?.rate || 0,
                cgst: entry?.gst?.cgst || 0,
                sgst: entry?.gst?.sgst || 0,
                igst: entry?.gst?.igst || 0,
                isInput: entry.dc === 'D',
                hsn: entry?.gst?.hsn || null,
            };
        }

        if (!_.isEmpty(deletedIds)) {
            trace.deletedIds = deletedIds;
        }

        return trace;
    }

    function getDeletedIdsFromDebitAndCreditEntries() {
        const deletedIds: number[] = []
        const creditEntries = getValues("creditEntries") || [];
        const debitEntries = getValues("debitEntries") || [];
        creditEntries.forEach((entry: any) => {
            if (entry?.deletedIds?.length) {
                deletedIds.push(...entry.deletedIds);
            }
        });

        debitEntries.forEach((entry: any) => {
            if (entry?.deletedIds?.length) {
                deletedIds.push(...entry.deletedIds);
            }
        });
        return deletedIds;
    }

    function resetAll() {
        // retain voucherType
        const vchrType = watch('voucherType')
        reset(getDefaultVoucherFormValues())
        if (vchrType) {
            setValue('voucherType', vchrType)
        }
        dispatch(clearVoucherFormData());
    }

    function resetDetails() {
        setValue("id", undefined)
        setValue('autoRefNo', '')
        setValue('isGst', false)
        setValue('deletedIds', [])
        setValue("creditEntries", [getDefaultEntry('C')])
        setValue("debitEntries", [getDefaultEntry('D')])
        // setTimeout(() => {
        //     setValue("creditEntries", [getDefaultEntry('C')])
        //     setValue("debitEntries", [getDefaultEntry('D')])
        // }, 0)
    }
}

export type VoucherFormDataType =
    {
        id?: number;
        tranDate: string;
        userRefNo?: string | null;
        remarks?: string | null;
        tags?: string | null;
        jData?: object | null;
        tranTypeId: number;
        finYearId: number;
        branchId: number;
        posId?: number | null;
        autoRefNo: string;

        isGst: boolean;
        voucherType: VourcherType;
        creditEntries: VoucherLineItemEntryDataType[];
        debitEntries: VoucherLineItemEntryDataType[];
        deletedIds: number[]; // of TranD table
        showGstInHeader: boolean;
        toggle: boolean; // For making the form forcefully dirty
    }

type VoucherLineItemEntryDataType = {
    id?: number;
    accId: string | null;
    remarks?: string | null;
    dc: 'D' | 'C';
    amount: number;
    tranHeaderId?: number;
    lineRefNo?: string | null;
    instrNo?: string | null;
    gst?: GstDataType
    tranDetailsId?: number;
    deletedIds: number[]; // for ExtGstTranDTable
}

type GstDataType = {
    id?: number;
    gstin?: string | null;
    rate?: number | null;
    cgst: number;
    sgst: number;
    igst: number;
    isInput?: boolean;
    hsn?: string | null;
    isIgst: boolean;
}

type MetaType = {
    totalDebits: number;
    totalCredits: number;
}