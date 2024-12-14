import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
// import { Utils } from "../../../utils/utils"
// import { BranchType, BusinessUnitType, FinYearType, UserDetailsType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn } from "../../login/login-slice"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { LedgerSubledger } from "../../../controls/redux-components/ledger-subledger"
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map"
import { CompSwitch } from "../../../controls/redux-components/comp-switch"
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { selectCompSwitchStateFn, selectLedgerSubledgerFieldFn } from "../../../controls/redux-components/comp-slice"
import { AppDispatchType, RootStateType } from "../../../app/store/store"
import { useUtilsInfo } from "../../../utils/utils-info-hook"
import { useQueryHelper } from "../../../app/graphql/query-helper-hook"
import { WidgetLoadingIndicator } from "../../../controls/widgets/widget-loading-indicator"
import { useEffect } from "react"
import { CompInstances } from "../../../controls/redux-components/comp-instances"
import { CompSyncFusionGridToolbar } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { Utils } from "../../../utils/utils"
import { setQueryHelperData } from "../../../app/graphql/query-helper-slice"

export function GeneralLedger() {
    const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.generalLedger
    const selectedAccId: any = useSelector((state: RootStateType) => selectLedgerSubledgerFieldFn(state, instance, 'finalAccId'))
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance))
    const selectedData: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.data, shallowEqual)

    const {
        branchId
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        // , decFormatter
        , finYearId
        // , intFormatter
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
    }, [selectedAccId, isAllBranches])

    return (<CompAccountsContainer >
        <div className="flex items-center mt-6">
            <div className="flex flex-col w-72">
                <label className="text-lg font-medium text-primary-400">General ledger</label>
                <label className="text-blue-500 font-medium">{selectedData?.accName}</label>
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
            className="mr-6 mt-4 w-[2000px]"
            columns={getColumns()}
            dataSource={selectedData?.transactions}
            hasIndexColumn={true}
            // height="calc(100vh - 280px)"
            height="calc(100vh - 320px)"
            instance={instance}
            isLoadOnInit={false}
            // minWidth="2000"
        />
    </CompAccountsContainer>)

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: "tranDate",
                headerText: "Date",
                width: 50,
                textAlign: 'Left'
            },
            {
                field: "autoRefNo",
                headerText: "Ref no",
                width: 50,
                textAlign: 'Left'
            },
            {
                field: "debit",
                headerText: "Debits",
                width: 50,
                format:'N2',
                textAlign: 'Right'
            },
            {
                field: "credit",
                headerText: "Credits",
                width: 50,
                format: 'N2',
                textAlign: 'Right'
            },
            {
                field: "otherAccounts",
                headerText: "Other accounts",
                width: 100,
                textAlign: 'Left'
            },
            {
                field: "instrNo",
                headerText: "Instrument",
                width: 70,
                textAlign: 'Left'
            },
            {
                field: "userRefNo",
                headerText: "User ref",
                width: 50,
                textAlign: 'Left'
            },
            {
                field: "remarks",
                headerText: "Remarks",
                width: 150,
                textAlign: 'Left'
            },
            {
                field: "lineRefNo",
                headerText: "Line ref",
                width: 100,
                textAlign: 'Left'
            },
            {
                field: "lineRemarks",
                headerText: "Line remarks",
                width: 100,
                textAlign: 'Left'
            },
            {
                field: "branchName",
                headerText: "Branch",
                width: 70,
                textAlign: 'Left'
            },
            {
                field: "id",
                headerText: "Id",
                width: 50,
                textAlign: 'Left'
            },
        ])
    }

    async function loadData() {
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject || {},
            sqlArgs: {
                accId: selectedAccId,
                finYearId: finYearId,
                branchId: isAllBranches ? null : branchId
            },
            sqlId: SqlIdsMap.getAccountLedger
        })
        dispatch(setQueryHelperData({
            instance: instance,
            data: res?.[0]?.jsonResult
        }))
    }
}

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