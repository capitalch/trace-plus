import { useSelector } from "react-redux";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";
import { VoucherLineItemEntry } from "../voucher-controls/voucher-line-item-entry";
import { useState } from "react";
import Decimal from "decimal.js";
import { useVouchersContext } from "../vouchers-context";
import { selectAccountsCache } from "../voucher-slice";

export function ContraVoucher({ instance }: ContraVoucherType) {
    const [creditTotal, setCreditTotal] = useState<number>(0)
    const { watch } = useFormContext<VoucherFormDataType>();
    const { refreshAccountsCache } = useVouchersContext()
    const { cashBankAccounts } = useSelector(selectAccountsCache)

    return(<div className="flex flex-col mr-6 gap-4">
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
            voucherType="Contra"
        />

        <VoucherLineItemEntry
            accountOptions={cashBankAccounts}
            allowAddRemove={false}
            dc='C'
            instance={instance}
            isAmountFieldDisabled={false}
            lineItemEntryName="creditEntries"
            loadData={() => refreshAccountsCache('cashBankAccounts')}
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
