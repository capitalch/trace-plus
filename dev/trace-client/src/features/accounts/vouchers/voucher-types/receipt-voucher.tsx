import { useState } from "react"
import { useSelector } from "react-redux"
import { VoucherLineItemEntry } from "../voucher-controls/voucher-line-item-entry"
import { useFormContext } from "react-hook-form"
import Decimal from "decimal.js"
import { VoucherFormDataType } from "../all-vouchers/all-vouchers"
import { useVouchersContext } from "../vouchers-context"
import { selectAccountsCache } from "../voucher-slice"

export function ReceiptVoucher({ instance }: ReceiptVoucherType) {
    const [creditTotal, setCreditTotal] = useState<number>(0)
    const { watch } = useFormContext<VoucherFormDataType>();
    const { refreshAccountsCache } = useVouchersContext()
    const { cashBankAccounts, receiptCreditAccounts } = useSelector(selectAccountsCache)

    return (<div className="flex flex-col mr-6 gap-4">
        <VoucherLineItemEntry
            accountOptions={cashBankAccounts}
            allowAddRemove={false}
            amount={creditTotal}
            dc='D'
            instance={instance}
            isAmountFieldDisabled={true}
            lineItemEntryName="debitEntries"
            loadData={() => refreshAccountsCache('cashBankAccounts')}
            title="Debit Entries ( to Cash / Bank)"
            toShowInstrNo={true}
            tranTypeName="Debit"
            voucherType="Receipt"
        />

        <VoucherLineItemEntry
            accountOptions={receiptCreditAccounts}
            allowAddRemove={true}
            dc='C'
            instance={instance}
            isAmountFieldDisabled={false}
            lineItemEntryName="creditEntries"
            loadData={() => refreshAccountsCache('receiptCreditAccounts')}
            onChangeAmount={onChangeCreditAmount}
            title="Credit Entries"
            toShowInstrNo={false}
            toShowSummary={true}
            tranTypeName="Credit"
            voucherType="Receipt"
        />
    </div>)

    function onChangeCreditAmount() {
        const creditAmounts = watch("creditEntries")?.map(e => e.amount) || [];
        const totalCreditAmount = creditAmounts.reduce((acc, amt) => { return (acc.plus(new Decimal(amt || 0))) }, new Decimal(0));
        setCreditTotal(totalCreditAmount.toNumber())
    }
}

type ReceiptVoucherType = {
    className?: string
    instance: string
}
