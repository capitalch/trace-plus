// import { PurchaseCommonHeader } from "../../purchases/purchase-controls/purchase-common-header";
import { PurchaseCommonSubHeader } from "../../purchases/purchase-controls/purchase-common-sub-header";
import { PurchaseLineItems } from "../../purchases/purchase-controls/purchase-line-items";
import { PurchaseReturnCommonHeader } from "../purchase-return-controls/purchase-return-common-header";

export function AllPurchaseReturnsMain(){
    return (
    <div className="flex flex-col gap-2">
      <PurchaseReturnCommonHeader />
      <PurchaseCommonSubHeader />
      <PurchaseLineItems title="Purchase Return Line Items" />
    </div>
  );
}