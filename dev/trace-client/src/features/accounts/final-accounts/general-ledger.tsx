import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import _ from 'lodash'
import Decimal, { } from 'decimal.js'
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { LedgerSubledger } from "../../../controls/redux-components/ledger-subledger"
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map"
import { CompSwitch } from "../../../controls/redux-components/comp-switch"
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { compAppLoaderVisibilityFn, selectCompCheckBoxStateFn, selectCompSwitchStateFn, selectLedgerSubledgerFieldFn, setCompCheckBoxState } from "../../../controls/redux-components/comp-slice"
import { AppDispatchType, RootStateType } from "../../../app/store/store"
import { useUtilsInfo } from "../../../utils/utils-info-hook"
import { useEffect, useRef, useState } from "react"
import { CompSyncFusionGridToolbar } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { Utils } from "../../../utils/utils"
import { setQueryHelperData } from "../../../app/graphql/query-helper-slice"
import { CompAppLoader } from "../../../controls/redux-components/comp-app-loader"
import { CompCheckBox } from "../../../controls/redux-components/comp-checkbox"
import { CompInstances } from "../../../controls/redux-components/comp-instances"
import { currentFinYearSelectorFn, FinYearType } from "../../login/login-slice"
import { RowDataBoundEventArgs } from "@syncfusion/ej2-react-grids"

export function GeneralLedger() {
    const [, setRefresh] = useState({})
    const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.generalLedger
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn) || Utils.getRunningFinYear() //Utils.getCurrentLoginInfo().currentFinYear || Utils.getRunningFinYear()
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, instance))
    const selectedAccId: any = useSelector((state: RootStateType) => selectLedgerSubledgerFieldFn(state, instance, 'finalAccId'))
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance))

    const toShowBalance: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, CompInstances.compCheckBoxBalanceLedger))
    const toShowReverse: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, CompInstances.compCheckBoxReverseLedger))
    const toShowSummaryRow: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, CompInstances.compCheckBoxSummaryLedger))

    const selectedData: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.data, shallowEqual)

    const meta: any = useRef<{ transactions: TranType[], transactionsCopy: TranType[] }>({
        transactions: [],
        transactionsCopy: []
    })

    const {
        branchId
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        , decFormatter
        , finYearId
    } = useUtilsInfo()

    useEffect(() => {
        if (selectedAccId) {
            loadData()
        } else {
            // Reset data
            const gridRef: any = context.CompSyncFusionGrid[instance]?.gridRef
            if (gridRef?.current) {
                gridRef.current.dataSource = []
            }
        }
    }, [selectedAccId, isAllBranches, currentFinYear])

    useEffect(() => {
        return (() => {
            dispatch(setCompCheckBoxState({
                instance: [CompInstances.compCheckBoxBalanceLedger
                    , CompInstances.compCheckBoxReverseLedger
                    , CompInstances.compCheckBoxSummaryLedger]
                , checkBoxState: false
            }))
        })
    }, [])

    useEffect(() => {
        formatData()
        setRefresh({})
    }, [toShowBalance, toShowReverse, toShowSummaryRow])

    return (
        <CompAccountsContainer>
            <div className="flex items-center mt-6 min-w-[1200px]">
                <div className="flex flex-col w-72">
                    <label className="text-lg font-medium text-primary-400">General ledger</label>
                    <label className="text-blue-500 font-medium">{selectedData?.accName}</label>
                </div>
                <div className="flex flex-col items-end flex-wrap mr-8 min-w-[150px]">
                    <CompCheckBox label="Show balance" instance={CompInstances.compCheckBoxBalanceLedger} />
                    <CompCheckBox label="Reverse" instance={CompInstances.compCheckBoxReverseLedger} />
                    <CompCheckBox label="Daily summary" instance={CompInstances.compCheckBoxSummaryLedger} />
                </div>
                <CompSwitch leftLabel="All branches" instance={instance} className="ml-auto" />
                <CompSyncFusionGridToolbar
                    title=""
                    isLastNoOfRows={false}
                    instance={instance}
                    minWidth="500px"
                />
                <LedgerSubledger
                    className="-mt-4 w-80 ml-auto mr-6"
                    heading="All accounts"
                    instance={instance}
                    isAllBranches={isAllBranches}
                    showAccountBalance={true}
                    sqlId={SqlIdsMap.getLedgerLeafAccounts} />
            </div>

            <CompSyncFusionGrid
                aggregates={getAggregates()}
                className="mr-6 mt-4"
                columns={getColumns()}
                // dataSource={selectedData?.transactions}
                dataSource={meta?.current?.transactions || []}
                hasIndexColumn={false}
                height="calc(100vh - 300px)"
                instance={instance}
                isLoadOnInit={false}
                loadData={loadData}
                onRowDataBound={onRowDataBound}
            />
            {/* Separate instance of appLoader is needed otherwise it clashes with global appLoader with instance compAppLoader */}
            {isVisibleAppLoader && <CompAppLoader />}

        </CompAccountsContainer>
    )


    function calculateClosing() {
        const ret: Decimal = meta.current.transactionsCopy.reduce((sum: Decimal, current: DecTranType) => (sum.plus(current.debit || 0).minus(current.credit || 0)), new Decimal(0))
        const r: number = +ret.toFixed(2)
        const dbCr = r < 0 ? 'Cr' : 'Dr'
        return (`${decFormatter.format(Math.abs(r))} ${dbCr}`)
    }

    function calculateCount() {
        return (meta.current.transactionsCopy?.length || 0)
    }

    function calculateCredits() {
        const ret: Decimal = meta.current.transactionsCopy.reduce((sum: Decimal, current: DecTranType) => (sum.plus(current.credit || 0)), new Decimal(0))
        const r: number = +ret.toFixed(2)
        return (decFormatter.format(r))
    }

    function calculateDebits() {
        const ret: Decimal = meta.current.transactionsCopy.reduce((sum: Decimal, current: DecTranType) => (sum.plus(current.debit || 0)), new Decimal(0))
        const r: number = +ret.toFixed(2)
        return (decFormatter.format(r))
    }

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'autoRefNo',
                field: 'autoRefNo',
                format: 'N0',
                type: 'Custom',
                customAggregate: calculateCount,
                footerTemplate: (props: any) => <span>Count:{` ${props?.['autoRefNo - custom'] || 0}`}</span>
            },
            {
                columnName: 'debit',
                field: 'debit',
                format: 'N2',
                type: 'Custom',
                customAggregate: calculateDebits,
                footerTemplate: (props: any) => <span>{`${props?.['debit - custom'] || 0}`}</span>
            },
            {
                columnName: 'credit',
                field: 'credit',
                format: 'N2',
                type: 'Custom',
                customAggregate: calculateCredits,
                footerTemplate: (props: any) => <span>{`${props?.['credit - custom'] || 0}`}</span>
            },
            {
                columnName: 'instrNo',
                field: 'instrNo',
                format: 'N2',
                type: 'Custom',
                customAggregate: calculateClosing,
                footerTemplate: (props: any) => <span>Closing:{` ${props?.['instrNo - custom'] || 0}`}</span>
            }
        ])
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: "tranDate",
                headerText: "Date",
                width: 100,
                textAlign: 'Left',
                type: 'date',
                // format:'yyyy-MM-dd'
                format: Utils.getCurrentDateFormat().replace("DD", "dd").replace("YYYY", "yyyy")
            },
            {
                field: "autoRefNo",
                headerText: "Ref no",
                width: 150,
                textAlign: 'Left'
            },
            {
                field: "otherAccounts",
                headerText: "Other accounts",
                width: 300,
                textAlign: 'Left'
            },
            {
                field: "debit",
                headerText: "Debits",
                width: 150,
                format: 'N2',
                textAlign: 'Right',
                type: 'number'
            },
            {
                field: "credit",
                headerText: "Credits",
                width: 150,
                format: 'N2',
                textAlign: 'Right',
                type: 'number'
            },
            {
                field: 'balance',
                headerText: 'Balance',
                width: 150,
                format: 'N2',
                textAlign: 'Right',
                type: 'number'
            },
            {
                field: "instrNo",
                headerText: "Instrument",
                width: 200,
                textAlign: 'Left'
            },
            {
                field: "tranType",
                headerText: "Type",
                width: 80,
                textAlign: 'Left'
            },
            {
                field: "userRefNo",
                headerText: "User ref",
                width: 150,
                textAlign: 'Left'
            },
            {
                field: "remarks",
                headerText: "Remarks",
                width: 300,
                textAlign: 'Left'
            },
            {
                field: "lineRefNo",
                headerText: "Line ref",
                width: 200,
                textAlign: 'Left'
            },
            {
                field: "lineRemarks",
                headerText: "Line remarks",
                width: 300,
                textAlign: 'Left'
            },
            {
                field: "branchName",
                headerText: "Branch",
                width: 200,
                textAlign: 'Left'
            },
            {
                field: "id",
                headerText: "Id",
                width: 80,
                textAlign: 'Left'
            },
        ])
    }

    async function loadData() {
        const finalAccId: number = Utils.getReduxState().reduxComp.ledgerSubledger[instance].finalAccId || 0
        const hasAllBranches: boolean = Utils.getReduxState().reduxComp.compSwitch[instance] || false
        if (!finalAccId) {
            meta.current.transactions = []
            meta.current.transactionsCopy = []
            return
        }
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject || {},
            instance: instance,
            sqlArgs: {
                accId: finalAccId,
                finYearId: finYearId,
                branchId: hasAllBranches ? null : branchId
            },
            sqlId: SqlIdsMap.getAccountLedger
        })
        const jsonResult = res?.[0]?.jsonResult
        const opBals: any[] = jsonResult?.opBalance || []
        const formattedOpBals: any[] = opBals.map((op: any) => ({
            ...op,
            "otherAccounts": "Opening balance:",
            "tranDate": currentFinYear.startDate
        }))

        if (jsonResult?.transactions) {
            jsonResult.transactions.unshift(...formattedOpBals)
        } else {
            jsonResult.transactions = formattedOpBals
        }
        jsonResult.transactions = jsonResult?.transactions || []
        // Add index field for reversing
        jsonResult.transactions.forEach((item: any, index: number) => item.index = index + 1)
        meta.current.transactionsCopy = jsonResult.transactions.map((x: any) => ({ ...x }))
        formatData()
        dispatch(setQueryHelperData({
            instance: instance,
            data: jsonResult
        }))
    }

    function formatData() {
        if (_.isEmpty(meta?.current?.transactionsCopy)) {
            return
        }
        showDailySummary()
        showBalance()
        showReverse()
    }

    function showDailySummary() {
        const toShowSummaryRow: boolean = Utils.getReduxState().reduxComp.compCheckBox[CompInstances.compCheckBoxSummaryLedger] || false
        let clonedTransactions: TranType[] = meta.current.transactionsCopy.map((x: any) => ({ ...x }))
        if (toShowSummaryRow) {
            const summaryRows: TranType[] = getSummaryRows()
            clonedTransactions = clonedTransactions.concat(summaryRows)
            clonedTransactions = _.sortBy(clonedTransactions, ['tranDate'])
            meta.current.transactions = clonedTransactions
        } else {
            meta.current.transactions = clonedTransactions
        }
        // Indexing
        (meta.current.transactions as TranType[]).forEach((item: TranType, index: number) => item.index = index + 1)
    }

    function getSummaryRows(): TranType[] {
        const summary: TranType[] = []
        const acc: DecTranType = {
            autoRefNo: 'Summary',
            tranDate: currentFinYear.startDate,
            debit: new Decimal(0),
            credit: new Decimal(0),
            opening: new Decimal(0),
            closing: new Decimal(0)
        }

        for (const item of meta.current.transactionsCopy as TranType[]) {
            if (item.tranDate === acc.tranDate) {
                acc.debit = acc.debit.plus(new Decimal(item.debit))
                acc.credit = acc.credit.plus(new Decimal(item.credit))
            } else {
                pushToSummary()
                // reset acc
                acc.tranDate = item.tranDate
                acc.opening = acc.closing
                acc.credit = new Decimal(item.credit)
                acc.debit = new Decimal(item.debit)
            }
        }
        pushToSummary()
        return (summary)

        function getFormattedToDrCr(value: any, type: string) {
            return (`${type}: ${decFormatter.format(Math.abs(value))} ${(value < 0 ? 'Cr' : 'Dr')}`)
        }

        function pushToSummary() {
            acc.closing = acc.opening.plus(acc.debit).minus(acc.credit)
            acc.otherAccounts = getFormattedToDrCr(acc.opening.toFixed(2), 'Opening')
            acc.instrNo = getFormattedToDrCr(acc.closing.toFixed(2), 'Closing')
            summary.push({
                autoRefNo: acc.autoRefNo,
                tranDate: acc.tranDate,
                instrNo: acc.instrNo,
                otherAccounts: acc.otherAccounts,
                opening: +acc.opening.toFixed(2),
                closing: +acc.closing.toFixed(2),
                debit: +acc.debit.toFixed(2),
                credit: +acc.credit.toFixed(2)
            })
        }
    }

    function showReverse() {
        const toShowReverse: boolean = Utils.getReduxState().reduxComp.compCheckBox[CompInstances.compCheckBoxReverseLedger] || false
        if(toShowReverse){
            meta.current.transactions = _.orderBy(meta.current.transactions, ['index'], ['desc'])
            // Reindex
            meta.current.transactions.forEach((item: TranType, index: number) => item.index = index + 1)
        }
    }

    function showBalance() {
        const transactions: any = meta?.current?.transactions
        const toShowBalance: boolean = Utils.getReduxState().reduxComp.compCheckBox[CompInstances.compCheckBoxBalanceLedger] || false
        let bal: Decimal = new Decimal(0)
        const clonedTransactions = transactions.map((x: any) => ({ ...x }))
        if (toShowBalance) {
            clonedTransactions.forEach((tran: any) => {
                if (tran.autoRefNo !== 'Summary') {
                    tran.balance = bal.plus(tran.debit).minus(tran.credit).toNumber();
                    bal = new Decimal(tran.balance);
                }
            });
        } else {
            clonedTransactions.forEach((tran: any) => {
                tran.balance = '';
            });
        }
        meta.current.transactions = clonedTransactions
    }

    function onRowDataBound(args: RowDataBoundEventArgs) {
        const rowData: TranType = args.data as any
        if (rowData.autoRefNo === 'Summary') {
            (args.row as HTMLElement).style.backgroundColor = '#ecf0f2';
            // (args.row as HTMLElement).style.color = '#ecf0f2'; 
            (args.row as HTMLElement).style.fontWeight = 'bold';
        }
    }
}

type DecTranType = {
    tranDate?: string
    opening: Decimal
    closing: Decimal
    debit: Decimal
    credit: Decimal
    otherAccounts?: string
    instrNo?: string
    autoRefNo?: string
}

type TranType = {
    index?: number
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