import { format } from "date-fns";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container";
import { CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { AllVouchersMain } from "./all-vouchers-main";
import { VoucherStatusBar } from "../voucher-controls/voucher-status-bar";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { TraceDataObjectType, VourcherType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { AppDispatchType, RootStateType, } from "../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { AllVouchersView, VoucherTranDetailsType } from "./all-vouchers-view";
import { setActiveTabIndex, setCompAccountsContainerMainTitle } from "../../../../controls/redux-components/comp-slice";
import { useEffect, useRef } from "react";
import { Messages } from "../../../../utils/messages";
import _ from "lodash";
import { clearVoucherFormData, saveVoucherFormData } from "../voucher-slice";
import { useLocation } from "react-router-dom";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { VoucherEditDataType } from "./all-vouchers-view";
import { useVoucherPermissions } from "../../../../utils/permissions/permissions-hooks";
import { businessContextToggleSelectorFn } from "../../../layouts/layouts-slice";
import { VouchersProvider } from "../vouchers-context";

/**
 * Child component that renders voucher tabs and content.
 * Must be rendered inside FormProvider to access form context.
 */
function AllVouchersContent({ instance }: { instance: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const { watch } = useFormContext<VoucherFormDataType>()
    const voucherType = watch('voucherType')
    const activeTabIndex = useSelector((state: RootStateType) =>
        state.reduxComp.compTabs[instance]?.activeTabIndex || 0
    )

    // ✅ Now inside FormProvider - hook can access form context
    const { canView } = useVoucherPermissions()

    // Utility function to generate voucher title
    const getVoucherTitle = (type: VourcherType, isViewMode: boolean): string => {
        return isViewMode ? `${type} View` : type;
    }

    // Build tabs array with conditional View tab
    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <AllVouchersMain />
        },
        // ✅ Only include View tab if user has permission
        ...(canView ? [{
            label: "View",
            content: <AllVouchersView instance={instance} />
        }] : [])
    ]

    // Update main title when voucher type or active tab changes
    useEffect(() => {
        const isViewMode = activeTabIndex === 1
        const title = getVoucherTitle(voucherType, isViewMode)
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: title }))
    }, [voucherType, activeTabIndex, dispatch])

    // Auto-switch to New/Edit tab if user loses View permission
    useEffect(() => {
        if (activeTabIndex === 1 && !canView) {
            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 }))
        }
    }, [canView, activeTabIndex, dispatch, instance])

    return (
        <>
            {/* Voucher Control Header with Tabs */}
            <div className="mt-4 mb-2">
                <VoucherStatusBar tabsInfo={tabsInfo} />
            </div>

            {/* Tab Content */}
            <div className="mt-4">
                {tabsInfo[activeTabIndex]?.content}
            </div>
        </>
    )
}

export function AllVouchers() {
    const dispatch: AppDispatchType = useDispatch()
    const location = useLocation()
    const savedFormData = useSelector((state: RootStateType) => state.vouchers.savedFormData);
    const selectedTabIndex = useSelector((state: RootStateType) =>
        state.reduxComp.compTabs[DataInstancesMap.allVouchers]?.activeTabIndex ?? 0
    )
    const toggleBusinessContextState = useSelector(businessContextToggleSelectorFn);
    const instance = DataInstancesMap.allVouchers;
    const isInitialMount = useRef(true);
    const meta = useRef<MetaType>({
        totalDebits: 0,
        totalCredits: 0
    })
    const { branchId, buCode, dbName, finYearId, hasGstin, decodedDbParamsObject } = useUtilsInfo();

    const methods = useForm<VoucherFormDataType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: savedFormData ?? getDefaultVoucherFormValues(),
    });

    const { getValues, setValue, reset, watch } = methods;
    const extendedMethods = { resetAll, getVoucherDetailsOnId, populateFormFromId };

    useEffect(() => {
        if (savedFormData) {
            methods.reset(_.cloneDeep(savedFormData));
            setValue('toggle', !savedFormData.toggle, { shouldDirty: true })
        }
    }, [savedFormData, methods, setValue]);

    useEffect(() => {
        return (() => {
            const reduxState = Utils.getReduxState();
            if (reduxState.login.isLoggedIn) {
                const data = getValues()
                dispatch(saveVoucherFormData(data));
            }
        })
    }, [dispatch, getValues])

    // Reset form when switches to View tab
    useEffect(() => {
        if (selectedTabIndex === 1) {
            resetAll();
        }
    }, [selectedTabIndex]);

    useEffect(() => {
        // Skip execution on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        resetAll();
    }, [toggleBusinessContextState]);

    // Handle navigation from report - auto-populate form with ID from location state
    useEffect(() => {
        if (location.state?.id && location.state?.returnPath) {
            populateFormFromId(location.state.id)
        }
    }, [location.state?.id, location.state?.returnPath]);

    return (
        <VouchersProvider methods={extendedMethods}>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(finalizeAndSubmitVoucher)} className="flex flex-col">
                    <CompAccountsContainer className="relative">
                        {/* ✅ Render child component inside FormProvider */}
                        <AllVouchersContent instance={instance} />
                    </CompAccountsContainer>
                </form>
            </FormProvider>
        </VouchersProvider>
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
            isGstApplicableForEntry: false,
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
            // console.log(JSON.stringify(xData))
            await Utils.doValidateDebitCreditAndUpdate({
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

    function getTranHData(): XDataObjectType {
        return {
            id: (getValues("id")) || undefined,
            tranDate: getValues("tranDate"),
            userRefNo: getValues("userRefNo"),
            remarks: getValues("remarks"),
            tranTypeId: Utils.getTranTypeId(getValues("voucherType")),
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
        const hasGstData = entry.isGstApplicableForEntry && entry.gst?.rate;
        const deletedIds = entry.deletedIds || [];

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

    function resetAll() {
        const currentVoucherType = getValues('voucherType');
        const defaults = getDefaultVoucherFormValues();
        reset({
            ...defaults,
            voucherType: currentVoucherType,
            showGstInHeader: currentVoucherType !== 'Contra'
        });
        dispatch(clearVoucherFormData());
    }

    async function populateFormFromId(id: number) {
        try {
            const editData: any = await getVoucherDetailsOnId(id)
            const voucherEditData: VoucherEditDataType = editData?.[0]?.jsonResult;
            if (!voucherEditData) {
                Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
                return
            }
            const tranHeader = voucherEditData?.tranHeader
            const voucherType = Utils.getTranTypeName(tranHeader.tranTypeId) as VourcherType

            reset({
                id: tranHeader.id,
                tranDate: tranHeader.tranDate,
                userRefNo: tranHeader.userRefNo,
                remarks: tranHeader.remarks,
                tranTypeId: tranHeader.tranTypeId,
                autoRefNo: tranHeader.autoRefNo,
                voucherType: voucherType,
                showGstInHeader: voucherType !== 'Contra',
                deletedIds: [],
                creditEntries: voucherEditData?.tranDetails?.filter((d: VoucherTranDetailsType) => d.dc === 'C').map((d: VoucherTranDetailsType) => ({
                    id: d.id,
                    tranDetailsId: d.id, // The id is replaced by some guid, so storing in tranDetailsId
                    accId: d.accId as string | null,
                    remarks: d.remarks,
                    dc: d.dc,
                    amount: d.amount,
                    tranHeaderId: d.tranHeaderId,
                    lineRefNo: d.lineRefNo,
                    instrNo: d.instrNo,
                    isGstApplicableForEntry: d?.gst?.id ? true : false,
                    gst: d?.gst?.id ? {
                        id: d.gst.id,
                        gstin: d.gst.gstin,
                        rate: d.gst.rate,
                        cgst: d.gst.cgst,
                        sgst: d.gst.sgst,
                        igst: d.gst.igst,
                        isIgst: d?.gst?.igst ? true : false,
                        hsn: d.gst.hsn
                    } : undefined
                })),
                debitEntries: voucherEditData?.tranDetails?.filter((d: VoucherTranDetailsType) => d.dc === 'D').map((d: VoucherTranDetailsType) => ({
                    id: d.id,
                    tranDetailsId: d.id, // The id is replaced by some guid, so storing in tranDetailsId
                    accId: d.accId as string | null,
                    remarks: d.remarks,
                    dc: d.dc,
                    amount: d.amount,
                    tranHeaderId: d.tranHeaderId,
                    lineRefNo: d.lineRefNo,
                    instrNo: d.instrNo,
                    isGstApplicableForEntry: d?.gst?.id ? true : false,
                    gst: d?.gst?.id ? {
                        id: d.gst.id,
                        gstin: d.gst.gstin,
                        rate: d.gst.rate,
                        cgst: d.gst.cgst,
                        sgst: d.gst.sgst,
                        igst: d.gst.igst,
                        isIgst: d?.gst?.igst ? true : false,
                        hsn: d.gst.hsn
                    } : undefined
                })),
            },)
            // Switch to edit tab
            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 }))
        } catch (e: any) {
            console.error(e);
            Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
        }
    }

    async function getVoucherDetailsOnId(id: number | undefined) {
        return (await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            instance: instance,
            sqlId: SqlIdsMap.getVoucherDetailsOnId,
            sqlArgs: {
                id: id,
            },
        }))
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
    isGstApplicableForEntry?: boolean;
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