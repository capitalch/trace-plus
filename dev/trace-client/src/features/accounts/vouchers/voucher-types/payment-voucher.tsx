import { useEffect, useState } from "react"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { AccountOptionType } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat"
import { Utils } from "../../../../utils/utils"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { VoucherLineItemEntry } from "../voucher-controls/voucher-line-item-entry"
import { useFormContext } from "react-hook-form"
import Decimal from "decimal.js"
import { VoucherFormDataType } from "../all-vouchers/all-vouchers"

export function PaymentVoucher({ instance }: PaymentVoucherType) {
    const [debitAccountOptions, setDebitAccountOptions] = useState<AccountOptionType[]>([])
    const [debitTotal, setDebitTotal] = useState<number>(0)
    const {
        watch,
    } = useFormContext<VoucherFormDataType>();
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
            amount={debitTotal}
            dc='C'
            instance={instance}
            isAmountFieldDisabled={true}
            lineItemEntryName="creditEntries"
            title="Credit Entries ( from Cash / Bank)"
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
            onChangeAmount={onChangeDebitAmount}
            title="Debit Entries"
            toShowInstrNo={false}
            toShowSummary={true}
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
                    accClassNames: ['debtor', 'creditor', 'dexp', 'iexp', 'other', 'purchase', 'loan', 'capital']?.join(',') || null
                }
            })

            setDebitAccountOptions(res)
        } catch (error) {
            console.error(error)
        }
    }

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