import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { ProductLineItems } from "./product-line-items";


export function BranchTransferForm() {
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

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {/* Use the extracted hook/component */}
        <ProductLineItems />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );

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