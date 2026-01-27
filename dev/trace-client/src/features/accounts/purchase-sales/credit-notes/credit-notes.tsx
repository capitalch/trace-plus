import { useDispatch, useSelector } from "react-redux";
import _ from 'lodash'
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { FormProvider, useForm } from "react-hook-form";
import { DebitCreditNoteFormDataType } from "../debit-notes/debit-notes";
import { useDebitCreditNotesSubmit } from "../common/debit-credit-notes-submit-hook";
import { CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { WidgetTabToggleButtons } from "../../../../controls/widgets/widget-tab-toggle-buttons";
import { useEffect, useRef } from "react";
import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container";
import { Utils } from "../../../../utils/utils";
import { Messages } from "../../../../utils/messages";
import { DebitCreditNoteEditDataType, ExtGstTranDType, TranDType, TranHType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { setActiveTabIndex, setCompAccountsContainerMainTitle } from "../../../../controls/redux-components/comp-slice";
import Decimal from "decimal.js";
import { CreditNotesMain } from "./credit-notes-main";
import { clearCreditNoteFormData, saveCreditNoteFormData } from "./credit-notes-slice";
import { DebitCreditNotesView } from "../common/debit-credit-notes-view";
import { useLocation } from "react-router-dom";
import { useCreditNotesPermissions } from "../../../../utils/permissions/permissions-hooks";
import { businessContextToggleSelectorFn } from "../../../layouts/layouts-slice";
import { CreditNotesProvider } from "./credit-notes-context";

/**
 * Child component that renders credit note tabs and content.
 * Must be rendered inside FormProvider to access form context.
 */
function CreditNotesContent({ instance }: { instance: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const selectedTabIndex = useSelector((state: RootStateType) =>
        state.reduxComp.compTabs[instance]?.activeTabIndex || 0
    )

    // ✅ Get credit notes permissions
    const { canView } = useCreditNotesPermissions()

    // Utility function to generate credit note title
    const getCreditNoteTitle = (isViewMode: boolean): string => {
        return isViewMode ? "Credit Notes View" : "Credit Notes";
    }

    // Build tabs array with conditional View tab
    const visibleTabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <CreditNotesMain />
        },
        // ✅ Only include View tab if user has permission
        ...(canView ? [{
            label: "View",
            content: <DebitCreditNotesView tranTypeId={Utils.getTranTypeId('CreditNote')} instance={DataInstancesMap.creditNotes} />
        }] : [])
    ]

    // Update main title when active tab changes
    useEffect(() => {
        const isViewMode = selectedTabIndex === 1;
        const title = getCreditNoteTitle(isViewMode);
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: title }));
    }, [selectedTabIndex, dispatch]);

    // Auto-switch to New/Edit tab if user loses View permission
    useEffect(() => {
        if (selectedTabIndex === 1 && !canView) {
            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 }))
        }
    }, [canView, selectedTabIndex, dispatch, instance])

    return (
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
    )
}

export function CreditNotes() {
    const dispatch: AppDispatchType = useDispatch()
    const location = useLocation()
    const savedFormData = useSelector((state: RootStateType) => state.creditNotes.savedFormData);
    const toggleBusinessContextState = useSelector(businessContextToggleSelectorFn);
    const instance = DataInstancesMap.creditNotes;
    const isInitialMount = useRef(true);
    const { branchId, finYearId, dbName, buCode, decodedDbParamsObject } = useUtilsInfo();
    const methods = useForm<DebitCreditNoteFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultCreditNoteFormValues() : savedFormData
        });
    const { clearErrors, reset, getValues, setValue, setFocus, watch } = methods;
    const { getTranHData } = useDebitCreditNotesSubmit(methods, Utils.getTranTypeId('CreditNote'))
    const selectedTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[instance]?.activeTabIndex ?? 0);

    useEffect(() => {
        if (savedFormData) {
            reset(_.cloneDeep(savedFormData),);
            setValue('toggle', !savedFormData.toggle, { shouldDirty: true }) // making forcefully dirty
        }
    }, [savedFormData, reset, setValue]);

    useEffect(() => {
        return (() => {
            const reduxState = Utils.getReduxState();
            if (reduxState.login.isLoggedIn) {
                const data = getValues()
                dispatch(saveCreditNoteFormData(data));
            }
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

    useEffect(() => {
        // Skip execution on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        resetAll();
    }, [toggleBusinessContextState]);

    return (
        <CreditNotesProvider methods={{ resetAll, computeGst, populateFormFromId, getCreditNoteEditDataOnId }}>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                    {/* ✅ Render child component inside FormProvider */}
                    <CreditNotesContent instance={instance} />
                </form>
            </FormProvider>
        </CreditNotesProvider>
    );

    function computeGst() {
        const { isGstApplicable, isIgst, gst, gstHalf } = getGstArtifacts()
        if (!isGstApplicable) return
        if (isIgst) {
            setValue('igst', gst)
            setValue('cgst', 0)
            setValue('sgst', 0)
        } else {
            setValue('igst', 0)
            setValue('cgst', gstHalf)
            setValue('sgst', gstHalf)
        }
    }

    async function finalizeAndSubmit() {
        if (!isValidGst) {
            setFocus("amount");
            Utils.showAlertMessage('Error', Messages.errInvalidGst)
            return;
        }
        try {
            const xData: XDataObjectType = getTranHData();
            // console.log(JSON.stringify(xData))
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

    function getDefaultCreditNoteFormValues(): DebitCreditNoteFormDataType {
        return ({
            id: undefined,
            autoRefNo: "",
            tranDate: '',
            userRefNo: null,
            remarks: null,
            tranTypeId: Utils.getTranTypeId('CreditNote'),
            amount: 0,

            isGstApplicable: false,
            isIgst: false,

            debitAccId: null,
            debitRefNo: null,
            debitRemarks: null,
            creditAccId: null,
            creditRefNo: null,
            creditRemarks: null,
            gstin: null,

            gstRate: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            hsn: '',

            branchId: branchId || 1,
            deletedIds: [],
            finYearId: finYearId || 0,
            toggle: true
        })
    }

    function getGstArtifacts() {
        const isGstApplicable = getValues('isGstApplicable');
        const gstRate = new Decimal(getValues('gstRate') || 0);
        const amount = new Decimal(getValues('amount') || 0);
        const isIgst = getValues('isIgst');

        // gst = amount * (gstRate / 100) / (1 + gstRate / 100)
        const divisor: Decimal = gstRate.div(100).plus(1);
        const gst: Decimal = amount.times(gstRate.div(100)).div(divisor);

        // gstHalf = gst / 2
        const gstHalf: Decimal = gst.div(2);

        return {
            isGstApplicable,
            isIgst,
            gst: gst.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
            gstHalf: gstHalf.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toDecimalPlaces(2).toNumber()
        };
    }

    function isValidGst() {
        const { isGstApplicable, isIgst, gst, gstHalf } = getGstArtifacts()
        const igst = getValues('igst')
        const cgst = getValues('cgst')
        const sgst = getValues('sgst')
        if (!isGstApplicable) return (true)
        if (igst === 0 && cgst === 0 && sgst === 0) {
            return (false)
        }
        if (isIgst) {
            if (!Utils.isAlmostEqual(igst, gst, .1, .02)) {
                return (false)
            }
        } else {
            if (!Utils.isAlmostEqual(cgst, gstHalf, .1, .02)) {
                return (false)
            }
            if (!Utils.isAlmostEqual(sgst, gstHalf, .1, .02)) {
                return (false)
            }
        }
        return (true)
    }

    // === DATABASE QUERY FUNCTIONS ===
    async function getCreditNoteEditDataOnId(id: number | undefined) {
        if (!id) {
            return
        }
        return (await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            instance: instance,
            sqlId: SqlIdsMap.getDebitCreditNoteDetailsOnId,
            sqlArgs: {
                id: id,
            },
        }))
    }

    // === FORM POPULATION FUNCTIONS ===
    async function populateFormFromId(id: number) {
        try {
            const editData: any = await getCreditNoteEditDataOnId(id)
            const dcEditData: DebitCreditNoteEditDataType = editData?.[0]?.jsonResult
            if (!dcEditData) {
                Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
                return
            }
            const tranH: TranHType = dcEditData.tranH
            const tranD: TranDType[] = dcEditData.tranD
            const extGsTranD: ExtGstTranDType | undefined = dcEditData?.extGstTranD
            const debitRow: TranDType = tranD.find((item) => item.dc === "D") as TranDType
            const creditRow: TranDType = tranD.find((item) => item.dc === "C") as TranDType
            reset({
                //TranH
                id: tranH.id,
                autoRefNo: tranH.autoRefNo,
                tranDate: tranH.tranDate,
                userRefNo: tranH.userRefNo,
                remarks: tranH.remarks,
                tranTypeId: tranH.tranTypeId,

                //TranD
                debitAccId: debitRow?.accId,
                debitRefNo: debitRow?.lineRefNo,
                debitRemarks: debitRow?.remarks,
                creditAccId: creditRow?.accId,
                creditRefNo: creditRow?.lineRefNo,
                creditRemarks: creditRow?.remarks,
                amount: creditRow?.amount || 0,

                //ExtGstTranD
                isGstApplicable: Boolean(extGsTranD?.id),
                gstin: extGsTranD?.gstin,
                gstRate: extGsTranD?.rate || 0,
                isIgst: extGsTranD?.igst ? true : false,
                cgst: extGsTranD?.cgst || 0,
                sgst: extGsTranD?.sgst || 0,
                igst: extGsTranD?.igst || 0,
                hsn: extGsTranD?.hsn || '',

                debitCreditNoteEditData: dcEditData
            })

            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 })) // Switch to the first tab (Edit tab)
        } catch (e: any) {
            console.error(e);
            Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
        }
    }

    function resetAll() {
        clearErrors()
        reset(getDefaultCreditNoteFormValues());
        dispatch(clearCreditNoteFormData());
    }
}