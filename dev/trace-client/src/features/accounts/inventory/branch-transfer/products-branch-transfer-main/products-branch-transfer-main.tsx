import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { ProductsBrancheTransferHeader } from "./products-branch-transfer-header";

export function ProductsBranchTransferMain({ instance }: { instance: string }) {
    const methods = useForm<BranchTransferType>({
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            tranDate: format(new Date(), "yyyy-MM-dd"),
            userRefNo: undefined,
            remarks: undefined,
            destBranchId: undefined,
            productLineItems: [
                {
                    productCode: undefined,
                    productDetails: undefined,
                    lineRefNo: undefined,
                    qty: 1,
                    price: 0,
                    lineRemarks: undefined,
                    serialNumbers: ''
                }
            ]
        }
    });

    return (
        <div className="h-[calc(100vh-240px)]">
            <FormProvider {...methods}>
                <form className="flex flex-col gap-6 mr-6 min-w-[85rem]"
                    onSubmit={methods.handleSubmit(onSubmit)}>
                    <ProductsBrancheTransferHeader />
                    {/* Use the extracted hook/component */}
                    {/* <ProductLineItems /> */}
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        </div>
    );

    async function onSubmit(data: BranchTransferType) {
        console.log(data);
    }
}

type BranchTransferType = {
    id?: string | number;
    autoRefNo?: string;
    destBranchId?: number;
    productLineItems: ProductLineItem[];
    remarks?: string;
    tranDate: string;
    userRefNo?: string;
};

type ProductLineItem = {
    id?: number | string;
    amount?: number;
    jData?: { [key: string]: any };
    lineRefNo?: string;
    lineRemarks?: string;
    price: number;
    productCode?: string;
    productDetails?: string;
    productId?: number;
    qty: number;
    serialNumbers: string;
    tranHeaderId?: number;
    upcCode?: string;
};