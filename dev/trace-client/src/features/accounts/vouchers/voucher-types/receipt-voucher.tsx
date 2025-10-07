import { useEffect, useState } from "react"
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map"
import { AccountOptionType } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat"
import { Utils } from "../../../../utils/utils"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { VoucherLineItemEntry } from "../voucher-controls/voucher-line-item-entry"
import { useFormContext } from "react-hook-form"
import Decimal from "decimal.js"
import { VoucherFormDataType } from "../all-vouchers/all-vouchers"

export function ReceiptVoucher({ instance }: ReceiptVoucherType) {
    const [creditAccountOptions, setCreditAccountOptions] = useState<AccountOptionType[]>([])
    const [creditTotal, setCreditTotal] = useState<number>(0)
    const {
        watch,
    } = useFormContext<VoucherFormDataType>();
    const {
        buCode
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()
    
    useEffect(() => {
        loadCreditAccountOptions()
    }, [])

    return (<div className="flex flex-col mr-6 gap-4">
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
        />

        <VoucherLineItemEntry
            accountOptions={creditAccountOptions}
            allowAddRemove={true}
            dc='C'
            instance={instance}
            isAmountFieldDisabled={false}
            lineItemEntryName="creditEntries"
            loadData={loadCreditAccountOptions}
            onChangeAmount={onChangeCreditAmount}
            title="Credit Entries"
            toShowInstrNo={false}
            toShowSummary={true}
            tranTypeName="Credit"
        />
    </div>)

    async function loadCreditAccountOptions() {
        try {
            const res: AccountOptionType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                instance: instance,
                sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
                sqlArgs: {
                    accClassNames: ['debtor', 'creditor', 'other', 'dexp', 'iexp', 'loan', 'capital', 'iincome', 'dincome']?.join(',') || null
                }
            })

            setCreditAccountOptions(res)
        } catch (error) {
            console.error(error)
        }
    }

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