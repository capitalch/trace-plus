import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import _ from 'lodash'
import Decimal, { } from 'decimal.js'
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { LedgerSubledger } from "../../../controls/redux-components/ledger-subledger"
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map"
import { CompSwitch } from "../../../controls/redux-components/comp-switch"
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { compAppLoaderVisibilityFn, selectCompCheckBoxStateFn, selectCompSwitchStateFn, selectLedgerSubledgerFieldFn } from "../../../controls/redux-components/comp-slice"
import { AppDispatchType, RootStateType } from "../../../app/store/store"
import { useUtilsInfo } from "../../../utils/utils-info-hook"
import { useEffect, useRef, useState } from "react"
import { CompSyncFusionGridToolbar } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { Utils } from "../../../utils/utils"
import { setQueryHelperData } from "../../../app/graphql/query-helper-slice"
import { CompAppLoader } from "../../../controls/redux-components/comp-app-loader"
import { CompCheckBox } from "../../../controls/redux-components/comp-checkbox"
import { CompInstances } from "../../../controls/redux-components/comp-instances"

export function GeneralLedger() {
    const [,setRefresh] = useState({})
    const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.generalLedger
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, instance))
    const selectedAccId: any = useSelector((state: RootStateType) => selectLedgerSubledgerFieldFn(state, instance, 'finalAccId'))
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance))
    
    const toShowBalance: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, CompInstances.compCheckBoxBalanceLedger))
    const toShowReverse: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, CompInstances.compCheckBoxReverseLedger))
    const toShowSummaryRow: boolean = useSelector((state: RootStateType) => selectCompCheckBoxStateFn(state, CompInstances.compCheckBoxSummaryLedger))
    
    const selectedData: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.data, shallowEqual)
   
    const meta: any = useRef({
        transactions: []
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
            const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
            if (gridRef?.current) {
                gridRef.current.dataSource = []
            }
        }
    }, [selectedAccId, isAllBranches,])

    useEffect(()=>{
        formatTransactionData()
        setRefresh({})
    },[toShowBalance, toShowReverse, toShowSummaryRow])

    return (
        <CompAccountsContainer>
            <div className="flex items-center mt-6 min-w-[1200px]">
                <div className="flex flex-col w-72">
                    <label className="text-lg font-medium text-primary-400">General ledger</label>
                    <label className="text-blue-500 font-medium">{selectedData?.accName}</label>
                </div>
                <div className="flex flex-col items-end flex-wrap mr-8 min-w-[150px]">
                    <CompCheckBox label="Show balance" instance={CompInstances.compCheckBoxBalanceLedger} />
                    <CompCheckBox label="Show reverse" instance={CompInstances.compCheckBoxReverseLedger} />
                    <CompCheckBox label="Show summary" instance={CompInstances.compCheckBoxSummaryLedger} />
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
            />
            {/* Separate instance of appLoader is needed otherwise it clashes with global appLoader with instance compAppLoader */}
            {isVisibleAppLoader && <CompAppLoader />}

        </CompAccountsContainer>
    )

    function calculateClosing(props: any) {
        const debits: Decimal = new Decimal(props?.aggregates?.['debit - sum'] || 0)
        const credits: Decimal = new Decimal(props?.aggregates?.['credit - sum'] || 0)

        const closing: any = debits.minus(credits).toNumber()
        const clos: any = `${decFormatter.format(Math.abs(closing))} ${(closing < 0) ? 'Cr' : 'Dr'}`
        return (clos)
    }

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'autoRefNo',
                field: 'autoRefNo',
                format: 'N2',
                type: 'Count',
                footerTemplate: (props: any) => <span>Count:{` ${props?.Count || 0}`}</span>
            },
            {
                columnName: 'debit',
                field: 'debit',
                format: 'N2',
                type: 'Sum',
                footerTemplate: (props: any) => <span>{`${props?.Sum || 0}`}</span>
            },
            {
                columnName: 'credit',
                field: 'credit',
                format: 'N2',
                type: 'Sum',
                footerTemplate: (props: any) => <span>{`${props?.Sum || 0}`}</span>
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
                field: "tranType",
                headerText: "Type",
                width: 80,
                textAlign: 'Left'
            },
            {
                field: "instrNo",
                headerText: "Instrument",
                width: 200,
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

    function formatTransactionData() {
        if(_.isEmpty(meta?.current?.transactions)){
            return
        }
        formatBalanceData()
        doReverseSortOnTranDate()
    }

    function showSummaryRow(){

    }

    function doReverseSortOnTranDate(){
        const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
        const toShowReverse: boolean = Utils.getReduxState().reduxComp.compCheckBox[CompInstances.compCheckBoxReverseLedger] || false
        if(toShowReverse){
            gridRef.current.sortColumn('tranDate', 'Descending')
        } else {
            gridRef.current.sortColumn('tranDate', 'Ascending')
        }
    }

    function formatBalanceData(){
        const transactions: any = meta?.current?.transactions
        // console.log(JSON.stringify(transactions))
        const toShowBalance: boolean = Utils.getReduxState().reduxComp.compCheckBox[CompInstances.compCheckBoxBalanceLedger] || false
        let bal: Decimal = new Decimal(0)
        const clonedTransactions = transactions.map((x:any)=>({...x}))
        if (toShowBalance) {
            clonedTransactions.forEach((tran: any) => {
                tran.balance = bal.plus(tran.debit).minus(tran.credit).toNumber();
                bal = new Decimal(tran.balance);
            });
        } else {
            clonedTransactions.forEach((tran: any) => {
                tran.balance = '';
            });
        }
        
        meta.current.transactions = clonedTransactions
    }

    async function loadData() {
        const finalAccId: number = Utils.getReduxState().reduxComp.ledgerSubledger[instance].finalAccId || 0
        const hasAllBranches: boolean = Utils.getReduxState().reduxComp.compSwitch[instance] || false
        if (!finalAccId) {
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
            "tranDate": "2024-04-01"
        }))

        if (jsonResult?.transactions) {
            jsonResult.transactions.unshift(...formattedOpBals)
        } else {
            jsonResult.transactions = formattedOpBals
        }        
        meta.current.transactions = _.cloneDeep(jsonResult.transactions)
        formatTransactionData()
        dispatch(setQueryHelperData({
            instance: instance,
            data: jsonResult
        }))
    }
}

// jsonResult.transactions.forEach((tran: any) => {
            //     tran.debit = (tran.debit === 0) ? '' : tran.debit
            //     tran.credit = (tran.credit === 0) ? '' : tran.credit
            // })
            
// const { loading, loadData } = useQueryHelper({
//     instance: instance,
//     isExecQueryOnLoad: false,
//     dbName: dbName,
//     getQueryArgs: () => ({
//         buCode: buCode,
//         dbParams: decodedDbParamsObject,
//         sqlId: SqlIdsMap.getAccountLedger,
//         sqlArgs: {
//             finYearId: finYearId,
//             branchId: isAllBranches ? undefined : branchId,
//             accId: selectedAccId
//         }
//     })
// })

// if (loading) {
//     return (<WidgetLoadingIndicator />)
// }