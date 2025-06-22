import { useEffect, useState } from "react"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { AccountOptionType } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat"
import { Utils } from "../../../../utils/utils"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { VoucherLineItemEntry } from "./voucher-line-item-entry"

export function PaymentVoucher({ instance }: PaymentVoucherType) {
    const [debitAccountOptions, setDebitAccountOptions] = useState<AccountOptionType[]>([])
    const {
        buCode
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        loadDebitAccountOptions()
    }, [])

    return (<div className="flex flex-col gap-4 mr-6">
        <VoucherLineItemEntry
            accClassNames={['cash', 'bank', 'ecash', 'card']}
            allowAddRemove={false}
            dc='C'
            instance={instance}
            isAmountFieldDisabled={true}
            lineItemEntryName="creditEntries"
            title="Credit Entries"
            toShowInstrNo={true}
            tranTypeName="Credit"
        />
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
            tranTypeName="Debit"
        />
    </div>)

    async function loadDebitAccountOptions() {
        try {
            const res: AccountOptionType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                instance: instance,
                sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
                sqlArgs: {
                    accClassNames: ['debtor', 'creditor', 'dexp', 'iexp']?.join(',') || null
                }
            })

            setDebitAccountOptions(res)
        } catch (error) {
            console.error(error)
        }
    }
}

type PaymentVoucherType = {
    className?: string
    instance: string
}