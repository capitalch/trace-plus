import { useSelector } from "react-redux";
import _ from 'lodash'
import { RootStateType } from "../../../../app/store";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { FormProvider, useForm, } from "react-hook-form";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { DebitNotesMain } from "./debit-notes-main";
import { DebitNotesView } from "./debit-notes-view";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { Utils } from "../../../../utils/utils";


export function DebitNotes() {
    // const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.purchase.savedFormData);
    const instance = DataInstancesMap.debitNotes;
    const { branchId, finYearId, /*hasGstin, dbName, buCode, decodedDbParamsObject*/ } = useUtilsInfo();
    const methods = useForm<DebitNoteFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultDebitNoteFormValues() : savedFormData
        });
    const { clearErrors, /*setError, getValues, setValue, reset, watch, setFocus*/ } = methods;
    // const { getTranHData } = useAllPurchasesSubmit(methods)
    const extendedMethods = { ...methods, resetAll, }

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

    async function finalizeAndSubmit() {

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
            creditAccId: null,
            gstin: null,
            cgst:0,
            sgst:0,
            igst:0,

            branchId: branchId || 1,
            deletedIds: [],
            finYearId: finYearId || 0,
            toggle: true
        })
    }

    function resetAll() {
        clearErrors()
        // reset(getDefaultPurchaseFormValues());
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
    debitRefNo?: string;
    debitRemarks?: string;

    creditAccId: string | number | null;
    creditRefNo?: string;
    creditRemarks?: string;

    cgst: number;
    sgst: number;
    igst: number;
    gstin?: string | null;

    branchId: number;
    deletedIds: number[];
    finYearId: number;

    lineRemarks?: string | null;
    toggle: boolean; // For making the form forcefully dirty
}