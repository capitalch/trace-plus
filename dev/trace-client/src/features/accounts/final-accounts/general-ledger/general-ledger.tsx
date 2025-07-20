import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import _ from 'lodash'
import Decimal from 'decimal.js'
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { CompSwitch } from "../../../../controls/redux-components/comp-switch"
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { compAppLoaderVisibilityFn, selectCompCheckBoxStateFn, selectCompSwitchStateFn, setCompCheckBoxState } from "../../../../controls/redux-components/comp-slice"
import { AppDispatchType, RootStateType } from "../../../../app/store"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { useEffect, useRef, useState } from "react"
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { Utils } from "../../../../utils/utils"
import { CompAppLoader } from "../../../../controls/redux-components/comp-app-loader"
import { CompCheckBox } from "../../../../controls/redux-components/comp-checkbox"
import { CompInstances } from "../../../../controls/redux-components/comp-instances"
import { RowDataBoundEventArgs } from "@syncfusion/ej2-react-grids"
import dayjs from "dayjs"
import { AccountPickerTree } from "../../../../controls/redux-components/account-picker-tree/account-picker-tree"
import { setAccountPickerAccId } from "../../../../controls/redux-components/account-picker-tree/account-picker-tree-slice"
import { GeneralLedgerPrintPreviewButton } from "./general-ledger-print-preview-button"

export function GeneralLedger() {
    const [, setRefresh] = useState({})
    const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.generalLedger
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, instance), shallowEqual)
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance), shallowEqual)
    const toShowBalance: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, CompInstances.compCheckBoxBalanceLedger), shallowEqual)
    const toShowReverse: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, CompInstances.compCheckBoxReverseLedger), shallowEqual)
    const toShowSummaryRow: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, CompInstances.compCheckBoxSummaryLedger), shallowEqual)
    const selectedAccountPickerAccId = useSelector((state: RootStateType) => state.accountPickerTree[instance]?.id, shallowEqual)

    const currentDateFormat = Utils.getCurrentDateFormat().replace("DD", "dd").replace("YYYY", "yyyy")
    const meta = useRef<{ accName: string, transactions: AccTranType[], transactionsCopy: AccTranType[], accClass: string }>({
        accName: '',
        accClass: '',
        transactions: [],
        transactionsCopy: []
    })

    const {
        branchId
        , buCode
        , context
        , currentFinYear
        , dbName
        , decodedDbParamsObject
        , decFormatter
        , finYearId
    } = useUtilsInfo()

    useEffect(() => {
        if (selectedAccountPickerAccId) {
            loadData()
        } else {
            meta.current.accName = ''
            meta.current.transactions = []
            meta.current.transactionsCopy = []
            setRefresh({})
            // Reset data
            const gridRef: any = context.CompSyncFusionGrid[instance]?.gridRef
            if (gridRef?.current) {
                gridRef.current.dataSource = []
            }
        }
    }, [selectedAccountPickerAccId, isAllBranches, currentFinYear?.finYearId, branchId, instance, context])

    useEffect(() => {
        return (() => { //cleanup
            dispatch(setCompCheckBoxState({
                instance: [CompInstances.compCheckBoxBalanceLedger
                    , CompInstances.compCheckBoxReverseLedger
                    , CompInstances.compCheckBoxSummaryLedger]
                , checkBoxState: false
            }))
            dispatch(setAccountPickerAccId({ instance: instance, id: null }))
        })
    }, [dispatch, instance])

    useEffect(() => {
        formatData()
        const gridRef: any = context.CompSyncFusionGrid[instance]?.gridRef
        if (gridRef?.current) {
            gridRef.current.dataSource = meta.current.transactions
        }
        setRefresh({})
    }, [toShowBalance, toShowReverse, toShowSummaryRow, instance, context,])

    return (
        <CompAccountsContainer>
            <div className="flex items-center mt-6 min-w-[1200px]">
                <div className="flex flex-col w-72">
                    <label className="text-lg font-medium text-primary-400">General ledger</label>
                    <label className="text-blue-500 font-medium">{meta?.current?.accName}</label>
                </div>
                <div className="flex flex-col items-end flex-wrap mr-8 min-w-[150px]">
                    <CompCheckBox label="Show balance" instance={CompInstances.compCheckBoxBalanceLedger} />
                    <CompCheckBox label="Reverse" instance={CompInstances.compCheckBoxReverseLedger} />
                    <CompCheckBox label="Daily summary" instance={CompInstances.compCheckBoxSummaryLedger} />
                </div>
                <CompSwitch leftLabel="All branches" instance={instance} className="ml-auto" />
                <CompSyncFusionGridToolbar
                    CustomControl={() =>
                        <GeneralLedgerPrintPreviewButton
                            accountName={meta.current.accName}
                            accClass={meta.current.accClass}
                            data={meta.current.transactions}
                            instance={instance}
                            nonSummaryData={meta.current.transactionsCopy}
                        />}
                    title=""
                    isLastNoOfRows={false}
                    instance={instance}
                    isPdfExport={false}
                    minWidth="500px"
                />
                <AccountPickerTree instance={instance} showAccountBalance={false} />
            </div>

            <CompSyncFusionGrid
                aggregates={getAggregates()}
                className="mr-6 mt-4"
                columns={getColumns()}
                dataSource={meta?.current?.transactions || []}
                hasIndexColumn={false}
                height="calc(100vh - 320px)"
                instance={instance}
                loadData={loadData}
                onRowDataBound={onRowDataBound}
            />
            {/* Separate instance of appLoader is needed otherwise it clashes with global appLoader with instance compAppLoader */}
            {isVisibleAppLoader && <CompAppLoader />}
        </CompAccountsContainer>
    )

    function calculateClosing() {
        const ret = meta.current.transactionsCopy.reduce((sum: Decimal, current: AccTranType) => (sum.plus(current.debit || 0).minus(current.credit || 0)), new Decimal(0))
        const r = ret.toNumber()
        return (r)
    }

    function calculateCount() {
        return (meta.current.transactionsCopy?.length || 0)
    }

    function calculateCredits() {
        const ret: Decimal = meta.current.transactionsCopy.reduce((sum: Decimal, current: AccTranType) => (sum.plus(current.credit || 0)), new Decimal(0))
        const r: number = ret.toNumber()
        return (r)
    }

    function calculateDebits() {
        const ret: Decimal = meta.current.transactionsCopy.reduce((sum: Decimal, current: AccTranType) => (sum.plus(current.debit || 0)), new Decimal(0))
        const r: number = ret.toNumber()
        return (r)
    }

    function formatData() {
        if (_.isEmpty(meta?.current?.transactionsCopy)) {
            return
        }
        showDailySummary()
        showBalance()
        showReverse()
    }

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'autoRefNo',
                field: 'autoRefNo',
                format: 'N0',
                type: 'Custom',
                customAggregate: calculateCount,
                footerTemplate: (props: any) => <span>Count:{` ${props?.['autoRefNo - custom'] ?? 0}`}</span>
            },
            {
                columnName: 'debit',
                field: 'debit',
                format: 'N2',
                type: 'Custom',
                customAggregate: calculateDebits,
                footerTemplate: (props: any) => <span>{`${decFormatter.format(props?.['debit - custom'] || 0)}`}</span>
            },
            {
                columnName: 'credit',
                field: 'credit',
                format: 'N2',
                type: 'Custom',
                customAggregate: calculateCredits,
                footerTemplate: (props: any) => <span>{`${decFormatter.format(props?.['credit - custom'] || 0)}`}</span>
            },
            {
                columnName: 'instrNo',
                field: 'instrNo',
                format: 'N2',
                type: 'Custom',
                customAggregate: calculateClosing,
                footerTemplate: (props: any) => <span>Closing:{` ${decFormatter.format(Math.abs(props?.['instrNo - custom'] || 0))} ${props?.['instrNo - custom'] < 0 ? 'Cr' : 'Dr'}`}</span>
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
                type: 'string', // Pdf export allows string only. So not used Date type. For PDF export only used template
                format: currentDateFormat,
                template: (props: any) => dayjs(props.tranDate).format(Utils.getCurrentDateFormat())
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
        const hasAllBranches: boolean = Utils.getReduxState().reduxComp.compSwitch[instance] || false
        if (!selectedAccountPickerAccId) {
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
                accId: selectedAccountPickerAccId,
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
            "tranDate": currentFinYear?.startDate,
            "autoRefNo": '',
            "instrNo": ''
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
        meta.current.accName = jsonResult.accName
        meta.current.accClass = jsonResult.accClass
        formatData()
        setRefresh({})
    }

    function showDailySummary() {
        const toShowSummaryRow: boolean = Utils.getReduxState().reduxComp.compCheckBox[CompInstances.compCheckBoxSummaryLedger] || false
        let clonedTransactions: AccTranType[] = meta.current.transactionsCopy.map((x: any) => ({ ...x }))
        if (toShowSummaryRow) {
            const summaryRows: AccTranType[] = getSummaryRows()
            clonedTransactions = clonedTransactions.concat(summaryRows)
            clonedTransactions = _.sortBy(clonedTransactions, ['tranDate'])
            meta.current.transactions = clonedTransactions
        } else {
            meta.current.transactions = clonedTransactions
        }
        // Indexing
        (meta.current.transactions as AccTranType[]).forEach((item: AccTranType, index: number) => item.index = index + 1)
    }

    function getSummaryRows(): AccTranType[] {
        const summary: AccTranType[] = []
        const acc: DecTranType = {
            autoRefNo: 'Summary',
            tranDate: currentFinYear?.startDate,
            debit: new Decimal(0),
            credit: new Decimal(0),
            opening: new Decimal(0),
            closing: new Decimal(0)
        }

        for (const item of meta.current.transactionsCopy as AccTranType[]) {
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
                tranDate: acc.tranDate || '',
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
        if (toShowReverse) {
            meta.current.transactions = _.orderBy(meta.current.transactions, ['index'], ['desc'])
            // Reindex
            meta.current.transactions.forEach((item: AccTranType, index: number) => item.index = index + 1)
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
        const rowData: AccTranType = args.data as any
        if (rowData.autoRefNo === 'Summary') {
            (args.row as HTMLElement).style.backgroundColor = '#ecf0f2';
            (args.row as HTMLElement).style.fontWeight = 'bold';
        }
    }
}

export type DecTranType = {
    tranDate?: string
    opening: Decimal
    closing: Decimal
    debit: Decimal
    credit: Decimal
    otherAccounts?: string
    instrNo?: string
    autoRefNo?: string
}

export type AccTranType = {
    branchCode?: string
    index?: number
    opening?: number
    closing?: number
    id?: string
    tranDate: string
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