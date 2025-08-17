import { useDispatch, useSelector } from "react-redux";
import _ from 'lodash'
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { FormProvider, useForm, } from "react-hook-form";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { DebitNotesMain } from "./debit-notes-main";
import { DebitNotesView } from "./debit-notes-view";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { Utils } from "../../../../utils/utils";
import { useEffect } from "react";
import { saveDebitNoteFormData } from "./debit-notes-slice";


export function DebitNotes() {
    const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.debitNotes.savedFormData);
    const instance = DataInstancesMap.debitNotes;
    const { branchId, finYearId, /*hasGstin, dbName, buCode, decodedDbParamsObject*/ } = useUtilsInfo();
    const methods = useForm<DebitNoteFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultDebitNoteFormValues() : savedFormData
        });
    const { clearErrors, reset , getValues, setValue , /*setError, reset setFocus*/ } = methods;
    // const { getTranHData } = useAllPurchasesSubmit(methods)
    // const isGstApplicable = watch('isGstApplicable')
    const extendedMethods = { ...methods, resetAll, finalizeAndSubmit, computeGst }
        
    const tabsInfo: CompTabsType = [
        {
            label: "New / Edit",
            content: <DebitNotesMain />
        },
        {
            label: "View",
            content: <DebitNotesView />
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
                    <label className="mt-1 text-md font-bold text-primary-500">
                        Debit Notes
                    </label>
                    <CompTabs tabsInfo={tabsInfo} instance={instance} className="mt-2" />

                </CompAccountsContainer>
            </form>
        </FormProvider>
    );

    function computeGst() {
        const isGstApplicable = getValues('isGstApplicable')
        if (!isGstApplicable) return
        const gstRate = getValues('gstRate')
        const amount = getValues('amount')
        const isIgst = getValues('isIgst')
        const gst = amount * (gstRate / 100) / (1 + gstRate / 100)
        const gstHalf = gst / 2
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

    async function finalizeAndSubmit(data: DebitNoteFormDataType) {
        console.log(data)
    }

    function getDefaultDebitNoteFormValues(): DebitNoteFormDataType {
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

    function resetAll() {
        clearErrors()
        reset(getDefaultDebitNoteFormValues());
        // dispatch(clearPurchaseFormData());
        // dispatch(setInvoicExists(false))
    }
}

export type DebitNoteFormDataType = {
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
    deletedIds: number[];
    finYearId: number;

    lineRemarks?: string | null;
    toggle: boolean; // For making the form forcefully dirty
}