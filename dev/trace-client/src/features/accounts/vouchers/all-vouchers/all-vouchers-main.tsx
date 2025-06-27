import { AllVouchersCrown } from "./all-vouchers-crown";
import { VoucherCommonHeader } from "./voucher-common-header";
import { PaymentVoucher } from "./payment-voucher";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../app/store/store";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";

export function AllVouchersMain() {
    const instance = DataInstancesMap.allVouchers
    const selectedVoucherType = useSelector((state: RootStateType) => state.vouchers.voucherType)
    return (
        <div className="flex flex-col px-4">
            <AllVouchersCrown className="absolute top-13 right-6 " />
            <VoucherCommonHeader />
            {getVoucherTypeControl()}
        </div>
    )

    function getVoucherTypeControl() {
        const logicObject: any = {
            Payment: <PaymentVoucher instance={instance} />
        }
        let Ret: any = <></>
        if (selectedVoucherType) {
            Ret = logicObject[selectedVoucherType]
        }
        return (Ret)
    }
}
