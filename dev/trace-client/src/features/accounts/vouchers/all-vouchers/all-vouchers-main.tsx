import { AllVouchersCrown } from "./all-vouchers-crown";
import { VoucherCommonHeader } from "../voucher-controls/voucher-common-header";
import { PaymentVoucher } from "../voucher-types/payment-voucher";
// import { useSelector } from "react-redux";
// import { RootStateType } from "../../../../app/store/store";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { ReceiptVoucher } from "../voucher-types/receipt-voucher";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "./all-vouchers";

export function AllVouchersMain() {
    const instance = DataInstancesMap.allVouchers
    const {
        watch,
    } = useFormContext<VoucherFormDataType>();
    // const selectedVoucherType = useSelector((state: RootStateType) => state.vouchers.voucherType)
    const voucherType = watch('voucherType')
    return (
        <div className="flex flex-col px-4">
            <AllVouchersCrown className="absolute top-13 right-6 " />
            <VoucherCommonHeader />
            {getVoucherTypeControl()}
        </div>
    )

    function getVoucherTypeControl() {
        const logicObject: any = {
            Payment: <PaymentVoucher instance={instance} />,
            Receipt: <ReceiptVoucher instance={instance} />
        }
        let Ret: any = <></>
        if (voucherType) {
            Ret = logicObject[voucherType]
        }
        return (Ret)
    }
}
