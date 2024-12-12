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
    const selectedAccId: any = useSelector((state: RootStateType) => selectLedgerSubledgerFieldFn(state, instance, 'finalAccId'), shallowEqual)
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance), shallowEqual)
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

    // if (loading) {
    //     return (<WidgetLoadingIndicator />)
    // }

    return (<CompAccountsContainer >
        <div className="flex items-center mt-8">
            <div className="flex flex-col">
                <label className="text-lg font-medium text-primary-400">General ledger</label>
                {/* <label>Party     ffffffffffffffffffff ffffffffffff yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy fgggggggggggg</label> */}
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
            className="mr-6 mt-4"
            columns={getColumns()}
            dataSource={selectedData?.jsonResult?.transactions}
            hasIndexColumn={true}
            height="calc(100vh - 280px)"
            instance={instance}
            isLoadOnInit={false}
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
            }
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
            data: res?.[0]?.jsonResult?.transactions
        }))
    }

}