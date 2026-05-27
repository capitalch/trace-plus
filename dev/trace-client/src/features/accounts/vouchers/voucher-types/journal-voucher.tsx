import { useSelector } from "react-redux";
import { VoucherLineItemEntry } from "../voucher-controls/voucher-line-item-entry";
import { useVouchersContext } from "../vouchers-context";
import { selectAccountsCache } from "../voucher-slice";

export function JournalVoucher({ instance }: JournalVoucherType) {
    const { refreshAccountsCache } = useVouchersContext()
    const { journalAccounts } = useSelector(selectAccountsCache)

    return (
        <div className="flex flex-col mr-6 gap-4">
            <VoucherLineItemEntry
                accountOptions={journalAccounts}
                allowAddRemove={true}
                dc='D'
                instance={instance}
                isAmountFieldDisabled={false}
                lineItemEntryName="debitEntries"
                loadData={() => refreshAccountsCache('journalAccounts')}
                title="Debit Entries"
                toShowInstrNo={false}
                toShowSummary={true}
                tranTypeName="Debit"
                voucherType="Journal"
            />

            <VoucherLineItemEntry
                accountOptions={journalAccounts}
                allowAddRemove={true}
                dc='C'
                instance={instance}
                isAmountFieldDisabled={false}
                lineItemEntryName="creditEntries"
                loadData={() => refreshAccountsCache('journalAccounts')}
                title="Credit Entries"
                toShowInstrNo={false}
                toShowSummary={true}
                tranTypeName="Credit"
                voucherType="Journal"
            />
        </div>
    )
}

type JournalVoucherType = {
    className?: string
    instance: string
}
