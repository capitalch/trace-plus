import { useState } from "react"
import { useSelector } from "react-redux"
import { VoucherLineItemEntry } from "../voucher-controls/voucher-line-item-entry"
import { useFormContext } from "react-hook-form"
import Decimal from "decimal.js"
import { VoucherFormDataType } from "../all-vouchers/all-vouchers"
import { useVouchersContext } from "../vouchers-context"
import { selectAccountsCache } from "../voucher-slice"

export function PaymentVoucher({ instance }: PaymentVoucherType) {
    const [debitTotal, setDebitTotal] = useState<number>(0)
    const { watch } = useFormContext<VoucherFormDataType>();
    const { refreshAccountsCache } = useVouchersContext()
    const { cashBankAccounts, paymentDebitAccounts } = useSelector(selectAccountsCache)

    return (<div className="flex flex-col mr-6 gap-4">
        <VoucherLineItemEntry
            accountOptions={cashBankAccounts}
            allowAddRemove={false}
            amount={debitTotal}
            dc='C'
            instance={instance}
            isAmountFieldDisabled={true}
            lineItemEntryName="creditEntries"
            loadData={() => refreshAccountsCache('cashBankAccounts')}
            title="Credit Entries ( from Cash / Bank)"
            toShowInstrNo={true}
            tranTypeName="Credit"
            voucherType="Payment"
        />

        <VoucherLineItemEntry
            accountOptions={paymentDebitAccounts}
            allowAddRemove={true}
            dc='D'
            instance={instance}
            isAmountFieldDisabled={false}
            lineItemEntryName="debitEntries"
            loadData={() => refreshAccountsCache('paymentDebitAccounts')}
            onChangeAmount={onChangeDebitAmount}
            title="Debit Entries"
            toShowInstrNo={false}
            toShowSummary={true}
            tranTypeName="Debit"
            voucherType="Payment"
        />
    </div>)

    function onChangeDebitAmount() {
        const debitAmounts = watch("debitEntries")?.map(e => e.amount) || [];
        const totalDebitAmount = debitAmounts.reduce((acc, amt) => { return (acc.plus(new Decimal(amt || 0))) }, new Decimal(0));
        setDebitTotal(totalDebitAmount.toNumber())
    }
}

type PaymentVoucherType = {
    className?: string
    instance: string
}
