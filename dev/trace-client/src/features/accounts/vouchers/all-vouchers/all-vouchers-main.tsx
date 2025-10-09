// import { AllVouchersCrown } from "./all-vouchers-crown";
import { VoucherCommonHeader } from "../voucher-controls/voucher-common-header";
import { PaymentVoucher } from "../voucher-types/payment-voucher";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { ReceiptVoucher } from "../voucher-types/receipt-voucher";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "./all-vouchers";
import { ContraVoucher } from "../voucher-types/contra-voucher";
import { JournalVoucher } from "../voucher-types/journal-voucher";

export function AllVouchersMain() {
    const instance = DataInstancesMap.allVouchers
    const {
        watch,
    } = useFormContext<VoucherFormDataType>();
    const voucherType = watch('voucherType')
    return (
        <div className="flex flex-col px-4">
            {/* absolute right-6 top-13 */}
            {/* <AllVouchersCrown className="ml-auto mr-2" />  */}
            <VoucherCommonHeader />
            {getVoucherTypeControl()}
        </div>
    )

    function getVoucherTypeControl() {
        const logicObject: any = {
            Contra: <ContraVoucher instance={instance} />,
            Payment: <PaymentVoucher instance={instance} />,
            Receipt: <ReceiptVoucher instance={instance} />,
            Journal: <JournalVoucher instance={instance} />
        }
        let Ret: any = <></>
        if (voucherType) {
            Ret = logicObject[voucherType]
        }
        return (Ret)
    }
}
