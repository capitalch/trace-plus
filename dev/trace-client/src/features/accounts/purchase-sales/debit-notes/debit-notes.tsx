import { useDispatch, useSelector } from "react-redux";
import _ from 'lodash'
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { FormProvider, useForm, } from "react-hook-form";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { DebitNotesMain } from "./debit-notes-main";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { Utils } from "../../../../utils/utils";
import { useEffect } from "react";
import { clearDebitNoteFormData, saveDebitNoteFormData } from "./debit-notes-slice";
import { Messages } from "../../../../utils/messages";
import { DebitCreditNoteEditDataType, XDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { setActiveTabIndex } from "../../../../controls/redux-components/comp-slice";
import { useDebitCreditNotesSubmit } from "../common/debit-credit-notes-submit-hook";
import Decimal from "decimal.js";
import { DebitCreditNotesView } from "../common/debit-credit-notes-view";


export function DebitNotes() {
    const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.debitNotes.savedFormData);
    const instance = DataInstancesMap.debitNotes;
    const { branchId, finYearId, dbName, buCode } = useUtilsInfo();
    const methods = useForm<DebitCreditNoteFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultDebitNoteFormValues() : savedFormData
        });
    const { clearErrors, reset, getValues, setValue, setFocus, watch } = methods;
    const { getTranHData } = useDebitCreditNotesSubmit(methods)

    const extendedMethods = { ...methods, resetAll, finalizeAndSubmit, computeGst }

    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <DebitNotesMain />
        },
        {
            label: "View",
            content: <DebitCreditNotesView tranTypeId={Utils.getTranTypeId('DebitNote')} instance={DataInstancesMap.debitNotes} />
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
            dispatch(saveDebitNoteFormData(data));
        })
    }, [dispatch, getValues])

    return (
        <FormProvider {...extendedMethods}>
            <form onSubmit={methods.handleSubmit(finalizeAndSubmit)} className="flex flex-col mr-6">
                <CompAccountsContainer>
                    <label className="mt-1 font-bold text-md text-primary-500">
                        Debit Notes
                    </label>
                    <CompTabs tabsInfo={tabsInfo} instance={instance} className="mt-2" />

                </CompAccountsContainer>
            </form>
        </FormProvider>
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
            console.log(JSON.stringify(xData))
            await Utils.doGenericUpdate({
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

    function getDefaultDebitNoteFormValues(): DebitCreditNoteFormDataType {
        return ({
            id: undefined,
            autoRefNo: "",
            tranDate: '',
            userRefNo: null,
            remarks: null,
            tranTypeId: Utils.getTranTypeId('DebitNote'),
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

    function resetAll() {
        clearErrors()
        reset(getDefaultDebitNoteFormValues());
        dispatch(clearDebitNoteFormData());
    }
}

export type DebitCreditNoteFormDataType = {
    id?: number;
    autoRefNo?: string;
    tranDate: string;
    userRefNo?: string | null;
    remarks?: string | null;
    tranTypeId: number;
    amount: number;

    isGstApplicable: boolean;
    isIgst: boolean;

    debitAccId: string | number | null;
    debitRefNo?: string | null;
    debitRemarks?: string | null;

    creditAccId: string | number | null;
    creditRefNo?: string | null;
    creditRemarks?: string | null;

    cgst: number;
    sgst: number;
    igst: number;
    gstin?: string | null;
    gstRate: number;
    hsn: string;

    branchId: number;
    deletedIds: number[]; // for ExtGstTranD
    finYearId: number;

    lineRemarks?: string | null;
    toggle: boolean; // For making the form forcefully dirty

    debitCreditNoteEditData?: DebitCreditNoteEditDataType
}