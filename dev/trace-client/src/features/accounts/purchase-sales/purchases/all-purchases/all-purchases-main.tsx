import { PurchaseCommonHeader } from "../purchase-controls/purchase-common-header";
import { PurchaseCommonSubHeader } from "../purchase-controls/purchase-common-sub-header";
import { PurchaseLineItems } from "../purchase-controls/purchase-line-items";

export function AllPurchasesMain() {
  // const instance = DataInstancesMap.allPurchases;
  // const {
  //   watch,
  // } = useFormContext<PurchaseFormDataType>();

  return (
    <div className="flex flex-col gap-2">
      <PurchaseCommonHeader />
      <PurchaseCommonSubHeader />
      <PurchaseLineItems title="Purchase Line Items" />
    </div>
  );
}