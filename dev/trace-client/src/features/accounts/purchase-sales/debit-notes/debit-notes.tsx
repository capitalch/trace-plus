import { useDispatch, useSelector } from "react-redux";
import _ from 'lodash'
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { FormProvider, useForm } from "react-hook-form";
import { CompTabs, CompTabsType } from "../../../../controls/redux-components/comp-tabs";
import { DebitNotesMain } from "./debit-notes-main";
import { DebitNotesView } from "./debit-notes-view";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";

export function DebitNotes() {
    const dispatch: AppDispatchType = useDispatch()
    const savedFormData = useSelector((state: RootStateType) => state.purchase.savedFormData);
    const instance = DataInstancesMap.debitNotes;
    const { branchId, finYearId, hasGstin, dbName, buCode, decodedDbParamsObject } = useUtilsInfo();
    const methods = useForm<PurchaseFormDataType>(
        {
            mode: "all",
            criteriaMode: "all",
            defaultValues: _.isEmpty(savedFormData) ? getDefaultPurchaseFormValues() : savedFormData
        });
    const { clearErrors, setError, getValues, setValue, reset, watch, setFocus } = methods;
    // const { getTranHData } = useAllPurchasesSubmit(methods)
    const extendedMethods = { ...methods, resetAll,  }

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

    function resetAll() {
        clearErrors()
        // reset(getDefaultPurchaseFormValues());
        // dispatch(clearPurchaseFormData());
        // dispatch(setInvoicExists(false))
    }
}