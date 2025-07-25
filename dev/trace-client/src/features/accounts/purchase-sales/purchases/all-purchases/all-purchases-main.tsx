// import { useFormContext } from "react-hook-form";
// import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { PurchaseCommonHeader } from "../purchase-controls/purchase-common-header";
import { PurchaseCommonSubHeader } from "../purchase-controls/purchase-common-sub-header";
import { PurchaseLineItems } from "../purchase-controls/purchase-line-items";
// import { PurchaseFormDataType } from "./all-purchases";

export function AllPurchasesMain() {
  // const instance = DataInstancesMap.allPurchases;
  // const {
  //   watch,
  // } = useFormContext<PurchaseFormDataType>();

  return (
    <div className="flex flex-col gap-2">
      <PurchaseCommonHeader />
      <PurchaseCommonSubHeader />
      <PurchaseLineItems name="purchaseLineItems" title="Purchase Line Items" />
    </div>
  );
}