import _ from 'lodash'
import { transactions } from './tran-data'

export function InjectSummary() {
    return (<div className="m-4 flex flex-col">
        <label>Summary</label>
        <button className="bg-slate-200 w-20 rounded-md" onClick={handleInjectSummary}>Calc</button>
    </div>)

    function handleInjectSummary() {
        let clonedTransactions = transactions.map((x: any) => ({ ...x }))
        const summary: TranType[] = getSummaryRows()
        clonedTransactions = clonedTransactions.concat(summary)
        clonedTransactions = _.sortBy(clonedTransactions,['tranDate'])
        console.log(clonedTransactions)
    }

    function getSummaryRows(): TranType[] {
        const summary: TranType[] = []
        const acc: TranType = {
            tranDate: '2024-04-01',
            debit: 0,
            credit: 0,
            opening: 0,
            closing: 0
        }

        for (let item of transactions) {
            if (item.tranDate === acc.tranDate) {
                acc.debit = acc.debit + item.debit
                acc.credit = acc.credit + item.credit
            } else {
                acc.closing = (acc.opening || 0) + acc.debit - acc.credit
                acc.otherAccounts = getFormattedToDrCr(acc.opening || 0,'Opening')
                acc.instrNo = getFormattedToDrCr(acc.closing || 0,'Closing')
                acc.autoRefNo = 'Summary'
                summary.push({ ...acc })
                // reset acc
                acc.tranDate = item.tranDate
                acc.opening = acc.closing
                acc.credit = item.credit
                acc.debit = item.debit
                acc.otherAccounts = getFormattedToDrCr(acc.opening || 0,'Opening')
                acc.instrNo = getFormattedToDrCr(acc.closing || 0,'Closing')
                acc.autoRefNo = 'Summary'
            }
        }
        summary.push({ ...acc })
        return (summary)

        function getFormattedToDrCr(value: number, type: string) {
            return (`${type}: ${Math.abs(value)} ${(value < 0 ? 'Cr' : 'Dr')}`)
        }
    }
}

type TranType = {
    opening?: number
    closing?: number
    id?: string
    tranDate?: string
    tranType?: string
    autoRefNo?: string
    userRefNo?: string
    lineRemarks?: string
    lineRefNo?: string
    branchName?: string
    remarks?: string
    debit: number
    credit: number
    instrNo?: string
    otherAccounts?: string
}