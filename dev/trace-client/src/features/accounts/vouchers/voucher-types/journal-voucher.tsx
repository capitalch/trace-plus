import { useEffect, useState } from "react";
import { AccountOptionType } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { VoucherLineItemEntry } from "../voucher-controls/voucher-line-item-entry";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";

export function JournalVoucher({ instance }: JournalVoucherType) {
    const [debitAccountOptions, setDebitAccountOptions] = useState<AccountOptionType[]>([])
    const [creditAccountOptions, setCreditAccountOptions] = useState<AccountOptionType[]>([])

    const {
        buCode
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        loadDebitAccountOptions()
        loadCreditAccountOptions()
    }, [])

    return (
        <div className="flex flex-col mr-6 gap-4">
            <VoucherLineItemEntry
                accountOptions={debitAccountOptions}
                allowAddRemove={true}
                dc='D'
                instance={instance}
                isAmountFieldDisabled={false}
                lineItemEntryName="debitEntries"
                loadData={loadDebitAccountOptions}
                title="Debit Entries"
                toShowInstrNo={false}
                toShowSummary={true}
                tranTypeName="Debit"
            />

            <VoucherLineItemEntry
                accountOptions={creditAccountOptions}
                allowAddRemove={true}
                dc='C'
                instance={instance}
                isAmountFieldDisabled={false}
                lineItemEntryName="creditEntries"
                loadData={loadCreditAccountOptions}
                title="Credit Entries"
                toShowInstrNo={false}
                toShowSummary={true}
                tranTypeName="Credit"
            />
        </div>
    )

    async function loadCreditAccountOptions() {
        try {
            const res: AccountOptionType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                instance: instance,
                sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
                sqlArgs: {
                    accClassNames: ['branch',
                        'capital',
                        'other',
                        'loan',
                        'iexp',
                        'dexp',
                        'dincome',
                        'iincome',
                        'creditor',
                        'debtor',
                        'sale',
                        'purchase']?.join(',') || null
                }
            })
            setCreditAccountOptions(res)
        } catch (error) {
            console.error(error)
        }
    }

    async function loadDebitAccountOptions() {
        try {
            const res: AccountOptionType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                instance: instance,
                sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
                sqlArgs: {
                    accClassNames: ['branch',
                        'capital',
                        'cash',
                        'bank',
                        'other',
                        'loan',
                        'iexp',
                        'dexp',
                        'dincome',
                        'iincome',
                        'creditor',
                        'debtor',
                        'sale',
                        'purchase']?.join(',') || null
                }
            })
            setDebitAccountOptions(res)
        } catch (error) {
            console.error(error)
        }
    }
}

type JournalVoucherType = {
    className?: string
    instance: string
}