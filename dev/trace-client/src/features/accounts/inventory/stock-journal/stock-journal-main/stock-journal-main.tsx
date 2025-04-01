import { FormProvider, useForm } from "react-hook-form";
import { format } from "date-fns";
import { ProductLineItem } from "../../shared-types";
import { StockJournalHeader } from "./stock-journal-header"
import { StockJournalTabs } from "./stock-journal-tabs";

export function StockJournalMain({ instance }: { instance: string }) {
    // const dispatch: AppDispatchType = useDispatch();
    // const instance = DataInstancesMap.productsStockJournal
    // const {
    //     branchId,
    //     buCode,
    //     context,
    //     dbName,
    //     decodedDbParamsObject,
    //     finYearId
    // } = useUtilsInfo();
    // const selectedTranHeaderId = useSelector(
    //     (state: RootStateType) => state.reduxComp.compTabs[instance]?.id
    // );

    const methods = useForm<StockJournalType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            autoRefNo: "",
            tranDate: format(new Date(), "yyyy-MM-dd"),
            userRefNo: null,
            remarks: null,
            sourceLineItems: [
                {
                    productCode: null,
                    productDetails: null,
                    lineRefNo: null,
                    qty: 1,
                    price: 0,
                    lineRemarks: null,
                    serialNumbers: null
                }
            ],
            outputLineItems: [
                {
                    productCode: null,
                    productDetails: null,
                    lineRefNo: null,
                    qty: 1,
                    price: 0,
                    lineRemarks: null,
                    serialNumbers: null
                }
            ],
        }
    });
    const { reset } = methods;
    const extendedMethods = { ...methods, xReset };

    return (<div className="h-[calc(100vh-240px)]">
        <FormProvider {...extendedMethods}>
            <form
                className="flex flex-col gap-6 mr-6 min-w-[85rem]"
                onSubmit={methods.handleSubmit(onSubmit)}
            >
                <StockJournalHeader />                
                <StockJournalTabs instance={instance} />
            </form>
        </FormProvider>
    </div>)

    async function onSubmit(data: StockJournalType) {
        console.log(data)
    }
    function xReset() {
        reset({
            id: undefined,
            autoRefNo: "",
            tranDate: format(new Date(), "yyyy-MM-dd"),
            userRefNo: null,
            remarks: null,
            sourceLineItems: [
                {
                    id: undefined,
                    productId: undefined,
                    productCode: null,
                    productDetails: null,
                    lineRefNo: null,
                    qty: 1,
                    price: 0,
                    lineRemarks: null,
                    tranHeaderId: undefined,
                    serialNumbers: null,
                    upcCode: null
                }
            ],
            outputLineItems: [
                {
                    id: undefined,
                    productId: undefined,
                    productCode: null,
                    productDetails: null,
                    lineRefNo: null,
                    qty: 1,
                    price: 0,
                    lineRemarks: null,
                    tranHeaderId: undefined,
                    serialNumbers: null,
                    upcCode: null
                }
            ]
        });
    }

}

export type StockJournalType = {
    id?: string | number;
    autoRefNo?: string | null;
    sourceLineItems: ProductLineItem[];
    outputLineItems: ProductLineItem[];
    remarks?: string | null;
    tranDate: string;
    userRefNo?: string | null;
}