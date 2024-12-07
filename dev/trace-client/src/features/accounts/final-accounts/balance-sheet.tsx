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
import { ReduxComponentsInstances } from "../../../controls/components/redux-components/redux-components-instances"

export function BalanceSheet() {
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const context: GlobalContextType = useContext(GlobalContext)
    // const instance: string = DataInstancesMap.balanceSheetProfitLoss
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const dispatch: AppDispatchType = useDispatch()
    const liabsInstance = DataInstancesMap.liabilities
    const { dbName, decodedDbParamsObject, } = userDetails

    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    const isAllBranches: boolean = useSelector((state: RootStateType) => reduxCompSwitchSelectorFn(state, ReduxComponentsInstances.reduxCompSwitchBalanceSheet), shallowEqual) || false
    const decFormatter = Utils.getDecimalFormatter()
    // const intFormatter = Utils.getIntegerFormatter()

    const selectedData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[liabsInstance]?.data
        return (ret)
    })

    useEffect(() => {
        loadData(liabsInstance)
    }, [currentBusinessUnit, currentFinYear, currentBranch, isAllBranches])


    return (<CompAccountsContainer>

        {/* Header */}
        <div className="flex items-center mt-5 justify-between">
            <label className="font-medium text-lg text-primary-500">Balance sheet</label>
            <div className="flex items-center">
                <ReduxCompSwitch className="mt-1 mr-6" instance={ReduxComponentsInstances.reduxCompSwitchBalanceSheet} leftLabel="This branch" rightLabel="All branches" />
                <WidgetTooltip title="Refresh">
                    <WidgetButtonRefresh handleRefresh={doRefresh} />
                </WidgetTooltip>
            </div>
        </div>

        {/* Two horizontal grids */}
        <div className="flex items-center">

            {/* Liabilities */}
            <div className="flex flex-col">
                <CompSyncFusionTreeGridToolbar className='mt-2'
                    // CustomControl={() => <ReduxCompSwitch instance={instance} className="mr-2" leftLabel="This branch" rightLabel="All branches" />}
                    title='Liabilities'
                    isLastNoOfRows={false}
                    isRefresh={false}
                    instance={liabsInstance}
                    isSearch={false}
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
                    isLoadOnInit={false}
                    columns={getColumns()}
                    height="calc(100vh - 260px)"
                    instance={liabsInstance}
                    minWidth='650px'
                    treeColumnIndex={0}
                />
            </div>

            {/* Assets */}

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

    async function doRefresh() {
        await loadData(liabsInstance)
        // const state: RootStateType = Utils.getReduxState()
        // const searchString = state.queryHelper[instance].searchString
        // const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        // if (searchString) {
        //     gridRef.current.search(searchString)
        // }
    }

    async function loadData(gridInstance: string) {
        const queryName: string = GraphQLQueriesMap.balanceSheetProfitLoss.name

        const q: any = GraphQLQueriesMap.balanceSheetProfitLoss(
            dbName || '',
            {
                buCode: loginInfo.currentBusinessUnit?.buCode,
                dbParams: decodedDbParamsObject,
                sqlArgs: {
                    branchId: isAllBranches ? null : loginInfo.currentBranch?.branchId,
                    finYearId: loginInfo.currentFinYear?.finYearId
                },
            }
        )
        try {
            setTimeout(() => {
                Utils.showAppLoader(true)
            }, 100);
            
            const res: any = await Utils.queryGraphQL(q, queryName)
            const jsonResult: any = res?.data[queryName][0]?.jsonResult
            dispatch(setQueryHelperData({
                instance: gridInstance,
                data: jsonResult?.[gridInstance]
            }))
            console.log(res)
        } catch (e: any) {
            console.log(e)
        } finally {
            Utils.showAppLoader(false)
        }
    }
}