import { PurchaseLineItems } from "../../purchases/purchase-controls/purchase-line-items";
import { PurchaseReturnHeader } from "../purchase-return-controls/purchase-return-header";
import { PurchaseReturnSubHeader } from "../purchase-return-controls/purchase-return-sub-header";

export function AllPurchaseReturnsMain(){
    return (
    <div className="flex flex-col gap-2">
      <PurchaseReturnHeader />
      <PurchaseReturnSubHeader />
      <PurchaseLineItems title="Purchase Return Line Items" />
    </div>
  );
}