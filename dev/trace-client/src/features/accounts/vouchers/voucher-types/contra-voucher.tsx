import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";
// import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { VoucherLineItemEntry } from "../voucher-controls/voucher-line-item-entry";
import { useState } from "react";
import Decimal from "decimal.js";

export function ContraVoucher({ instance }: ContraVoucherType) {
    const [creditTotal, setCreditTotal] = useState<number>(0)
    const {
        watch,
    } = useFormContext<VoucherFormDataType>();

    // const {
    //     buCode
    //     , dbName
    //     , decodedDbParamsObject
    // } = useUtilsInfo()

    return(<div className="flex flex-col mr-6 gap-4">
        <VoucherLineItemEntry
            accClassNames={['cash', 'bank', 'ecash', 'card']}
            allowAddRemove={false}
            amount={creditTotal}
            dc='D'
            instance={instance}
            isAmountFieldDisabled={true}
            lineItemEntryName="debitEntries"
            title="Debit Entries ( to Cash / Bank)"
            toShowInstrNo={true}
            tranTypeName="Debit"
            voucherType="Contra"
        />

        <VoucherLineItemEntry
            accClassNames={['cash', 'bank', 'ecash', 'card']}
            allowAddRemove={false}
            dc='C'
            instance={instance}
            isAmountFieldDisabled={false}
            lineItemEntryName="creditEntries"
            onChangeAmount={onChangeCreditAmount}
            title="Credit Entries ( from Cash / Bank)"
            toShowInstrNo={true}
            tranTypeName="Credit"
            voucherType="Contra"
        />
    </div>)

    function onChangeCreditAmount() {
            const creditAmounts = watch("creditEntries")?.map(e => e.amount) || [];
            const totalCreditAmount = creditAmounts.reduce((acc, amt) => { return (acc.plus(new Decimal(amt || 0))) }, new Decimal(0));
            setCreditTotal(totalCreditAmount.toNumber())
        }
}



type ContraVoucherType = {
    className?: string
    instance: string
}