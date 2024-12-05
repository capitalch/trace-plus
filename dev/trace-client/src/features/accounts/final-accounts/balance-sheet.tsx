import { useContext, useEffect } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import { BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, LoginType, UserDetailsType } from "../../login/login-slice"
import { Utils } from "../../../utils/utils"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { reduxCompSwitchSelectorFn } from "../../../controls/components/redux-components/redux-comp-slice"
import { AppDispatchType, RootStateType } from "../../../app/store/store"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { ReduxCompSwitch } from "../../../controls/components/redux-components/redux-comp-switch"
import { WidgetTooltip } from "../../../controls/widgets/widget-tooltip"
import { WidgetButtonRefresh } from "../../../controls/widgets/widget-button-refresh"
import { GraphQLQueriesMap } from "../../../app/graphql/maps/graphql-queries-map"
import { setQueryHelperData } from "../../../app/graphql/query-helper-slice"
import { CompSyncFusionTreeGridToolbar } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"

export function BalanceSheet() {
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const context: GlobalContextType = useContext(GlobalContext)
    const instance: string = DataInstancesMap.balanceSheetProfitLoss
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const dispatch: AppDispatchType = useDispatch()
    const liabsInstance = DataInstancesMap.liabilities
    const { dbName, decodedDbParamsObject, } = userDetails

    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    const isAllBranches: boolean = useSelector((state: RootStateType) => reduxCompSwitchSelectorFn(state, instance), shallowEqual) || false
    const decFormatter = Utils.getDecimalFormatter()
    // const intFormatter = Utils.getIntegerFormatter()

    const selectedData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[liabsInstance]?.data
        return (ret)
    })

    useEffect(() => {
        loadData()
    }, [currentBusinessUnit, currentFinYear, currentBranch, isAllBranches])


    return (<CompAccountsContainer>
        {/* Header */}
        <div className="flex items-center mt-5 justify-between">
            <label className="font-medium text-lg text-primary-500">Balance sheet</label>
            {/* <ReduxCompSwitch className="mt-1 mr-6" instance={DataInstancesMap.balanceSheet} leftLabel="This branch" rightLabel="All branches" /> */}
        </div>
        <div className="flex flex-col">
            <CompSyncFusionTreeGridToolbar className='mt-2'
                // CustomControl={() => <ReduxCompSwitch instance={instance} className="mr-2" leftLabel="This branch" rightLabel="All branches" />}
                title='Liabilities'
                isLastNoOfRows={false}
                instance={liabsInstance}
                width="calc(100vw - 250px)" // This stops unnecessary flickers
            />
            <CompSyncfusionTreeGrid
                // aggregates={getTrialBalanceAggregates()}
                buCode={currentBusinessUnit.buCode}
                childMapping="children"
                className=""
                dataSource={selectedData}
                dbName={dbName}
                dbParams={decodedDbParamsObject}
                // graphQlQueryFromMap={GraphQLQueriesMap.trialBalance}
                isLoadOnInit={false}
                sqlArgs={{
                    branchId: isAllBranches ? null : currentBranch?.branchId || 0,
                    finYearId: currentFinYear?.finYearId || 1900,
                }}
                columns={getColumns()}
                height="calc(100vh - 260px)"
                instance={liabsInstance}
                minWidth='950px'
                treeColumnIndex={0}
            />
        </div>
    </CompAccountsContainer>)

    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'accName',
                headerText: 'Acc Name',
                width: 250,
                textAlign: 'Left'
            },
            {
                field: 'closing',
                headerText: 'Closing',
                width: 90,
                textAlign: 'Right',
                format: 'N2',
                template: closingColumnTemplate
            },
        ])
    }

    function closingColumnTemplate(props: any) {
        const ret = <div>
            <span>{props.closing_dc === 'D' ? '-' : ''}</span>
            <span>{decFormatter.format(props.closing)}</span>
        </div>
        return (ret)
    }

    async function loadData() {
        const queryName: string = GraphQLQueriesMap.balanceSheetProfitLoss.name

        const q: any = GraphQLQueriesMap.balanceSheetProfitLoss(
            Utils.getUserDetails()?.dbName || '',
            {
                buCode: loginInfo.currentBusinessUnit?.buCode,
                dbParams: loginInfo.userDetails?.decodedDbParamsObject,
                sqlArgs: {
                    branchId: loginInfo.currentBranch?.branchId,
                    finYearId: loginInfo.currentFinYear?.finYearId
                },
            }
        )
        try {
            const res: any = await Utils.queryGraphQL(q, queryName)
            const jsonResult: any = res?.data[queryName][0]?.jsonResult
            // const liabilities: any[] = jsonResult?.liabilities
            dispatch(setQueryHelperData({
                instance: 'liabilities',
                data: jsonResult?.liabilities
            }))
            console.log(res)
        } catch (e: any) {
            console.log(e)
        }
    }
}