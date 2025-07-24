import { useFormContext } from "react-hook-form";
import { PurchaseFormDataType } from "../all-purchases/all-purchases";

export function PurchaseLineItem() {
    const { totalInvoiceAmount, totalQty, totalCgst, totalSgst, totalIgst } = useFormContext<PurchaseFormDataType>();

    return (
        <div className="flex flex-col gap-2">
        </div>
    );
}