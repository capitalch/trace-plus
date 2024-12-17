import transactions from './tran-data.json'

export function InjectSummary() {
    return (<div className="m-4 flex flex-col">
        <label>Summary</label>
        <button className="bg-slate-200 w-20 rounded-md" onClick={handleInjectSummary}>Calc</button>
    </div>)

    function handleInjectSummary() {
        const clonedTransactions = transactions.map((x: any) => ({ ...x }))
    }

    function getSummaryRows() {
        const clonedTransactions: TranType[] = transactions.map((x: any) => ({ ...x }))
        const summary: TranType[] = []
        const acc: TranType = {
            tranDate: '',
            debit: 0,
            credit: 0,
            opening: 0,
            closing: 0
        }

        for (let item of clonedTransactions) {
            if(item.tranDate === acc.tranDate){
                acc.debit = acc.debit + item.debit
                acc.credit = acc.credit + item.credit
            } else {
                acc.closing = acc.debit - acc.credit
                acc.tranDate = item.tranDate
            }
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