import { ChangeEvent, useContext, useEffect } from "react"
import { Decimal } from 'decimal.js'
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import { BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, LoginType, UserDetailsType } from "../../login/login-slice"
import { Utils } from "../../../utils/utils"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { reduxCompSwitchSelectorFn } from "../../../controls/redux-components/redux-comp-slice"
import { AppDispatchType, RootStateType } from "../../../app/store/store"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { ReduxCompSwitch } from "../../../controls/redux-components/redux-comp-switch"
import { WidgetButtonRefresh } from "../../../controls/widgets/widget-button-refresh"
import { GraphQLQueriesMap } from "../../../app/graphql/maps/graphql-queries-map"
import { setQueryHelperData } from "../../../app/graphql/query-helper-slice"
import { CompSyncFusionTreeGridToolbar } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { ReduxComponentsInstances } from "../../../controls/redux-components/redux-components-instances"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { CompSyncFusionTreeGridSearchBox } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-search-box"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"

export function ProfitLoss() {
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const context: GlobalContextType = useContext(GlobalContext)
    const dispatch: AppDispatchType = useDispatch()
    const profitLossInstance: string = DataInstancesMap.profitLoss
    const expensesInstance: string = DataInstancesMap.expenses
    const incomesInstance: string = DataInstancesMap.incomes
    const { dbName, decodedDbParamsObject, } = userDetails

    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    const isAllBranches: boolean = useSelector((state: RootStateType) => reduxCompSwitchSelectorFn(state, ReduxComponentsInstances.reduxCompSwitchBalanceSheet), shallowEqual) || false
    const decFormatter = Utils.getDecimalFormatter()
    const intFormatter = Utils.getIntegerFormatter()

    const expensesData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[expensesInstance]?.data
        return (ret)
    })

    const incomesData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[incomesInstance]?.data
        return (ret)
    })

    useEffect(() => {
        loadData()
    }, [currentBusinessUnit, currentFinYear, currentBranch, isAllBranches])

    return (<CompAccountsContainer className="mr-6 min-w-[1200px]" CustomControl={CustomControl}>

        {/* Two horizontal grids */}
        <div className="flex items-center mt-2 gap-8" >

            {/* Liabilities */}
            <div className="flex flex-col">
                <CompSyncFusionTreeGridToolbar className='mt-2'
                    isAllBranches={isAllBranches}
                    isLastNoOfRows={false}
                    isRefresh={false}
                    instance={expensesInstance}
                    isSearch={false}
                    title='Expenses'
                />
                <CompSyncfusionTreeGrid
                    aggregates={getAggregates()}
                    buCode={currentBusinessUnit.buCode}
                    childMapping="children"
                    className=""
                    dataSource={expensesData}
                    dbName={dbName}
                    dbParams={decodedDbParamsObject}
                    isLoadOnInit={false}
                    columns={getColumns('L')}
                    height="calc(100vh - 260px)"
                    instance={expensesInstance}
                    treeColumnIndex={0}
                />
            </div>

            {/* Assets */}
            <div className="flex flex-col">
                <CompSyncFusionTreeGridToolbar className='mt-2'
                    isAllBranches={isAllBranches}
                    isLastNoOfRows={false}
                    isRefresh={false}
                    instance={incomesInstance}
                    isSearch={false}
                    title='Income'
                />
                <CompSyncfusionTreeGrid
                    aggregates={getAggregates()}
                    buCode={currentBusinessUnit.buCode}
                    childMapping="children"
                    className=""
                    dataSource={incomesData}
                    dbName={dbName}
                    dbParams={decodedDbParamsObject}
                    isLoadOnInit={false}
                    columns={getColumns('A')}
                    height="calc(100vh - 260px)"
                    instance={incomesInstance}
                    treeColumnIndex={0}
                />
            </div>

        </div>
    </CompAccountsContainer>)

    function incomesClosingColumnTemplate(props: any) {
        const ret = <div>
            <span>{props.closing_dc === 'D' ? '-' : ''}</span>
            <span>{decFormatter.format(props.closing)}</span>
        </div>
        return (ret)
    }

    function CustomControl() {
        return (<div className="flex items-center justify-between">
            <label className="font-medium text-xl text-primary-300">Profit & Loss</label>

            {/* All branches */}
            <ReduxCompSwitch className="ml-4 mt-1 mr-4" instance={ReduxComponentsInstances.reduxCompSwitchBalanceSheet} leftLabel="All branches" />

            <CompSyncFusionTreeGridSearchBox instance={profitLossInstance} handleOnChange={handleOnChangeSearchText} />
            {/* Refresh */}
            <TooltipComponent content='Refresh' className="ml-2">
                <WidgetButtonRefresh handleRefresh={doRefresh} />
            </TooltipComponent>

        </div>)
    }

    function expensesClosingColumnTemplate(props: any) {
        const ret = <div>
            <span>{props.closing_dc === 'C' ? '-' : ''}</span>
            <span>{decFormatter.format(props.closing)}</span>
        </div>
        return (ret)
    }

    function customClosingAggregate(data: any, colType: string, dcColName: string) {
        const res: Decimal = (data?.result || data) // when you pdf or excel export then figures are available in data and not in data.result
            .filter((item: any) => !item?.parentId) // Filter only top-level rows
            .reduce((acc: Decimal, current: any) => {
                const multiplier = current[dcColName] === 'C' ? -1 : 1; // Determine the multiplier based on condition
                return acc.plus(new Decimal(multiplier).times(new Decimal(current[colType] || 0))); // Multiply and add with Decimal
            }, new Decimal(0)); // Initialize accumulator as Decimal
        return (res.abs().toNumber()); // Get the absolute value and convert back to a number
    }

    async function doRefresh() {
        await loadData()
    }

    function getColumns(type: string): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'accName',
                headerText: 'Account Name',
                width: 70,
                textAlign: 'Left'
            },
            {
                field: 'closing',
                headerText: 'Closing',
                width: 20,
                textAlign: 'Right',
                format: 'N2',
                template: type === 'L' ? expensesClosingColumnTemplate : incomesClosingColumnTemplate
            },
        ])
    }

    function getAggregates(): SyncFusionTreeGridAggregateColumnType[] {
        return ([
            {
                columnName: 'accName',
                field: 'accName',
                format: 'N2',
                type: 'Count',
                footerTemplate: (props: any) => <span className="mr-3 h-20 font-semibold">{`Count: ${intFormatter.format(props.Count)}`}</span>,
            },
            {
                columnName: 'closing',
                customAggregate: (data: any) => customClosingAggregate(data, 'closing', 'closing_dc'),
                field: 'closing',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{decFormatter.format(props.Custom)}</span>,
                type: 'Custom',
            }
        ])
    }

    function handleOnChangeSearchText(event: ChangeEvent<HTMLInputElement>): void {
        const gridRefLiabs: any = context.CompSyncFusionTreeGrid[expensesInstance].gridRef
        gridRefLiabs.current.search(event.target.value)

        const gridRefAssets: any = context.CompSyncFusionTreeGrid[incomesInstance].gridRef
        gridRefAssets.current.search(event.target.value)
    }

    async function loadData() {
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
            const res: any = await Utils.queryGraphQL(q, queryName)
            const jsonResult: any = res?.data[queryName][0]?.jsonResult
            const profitOrLoss = jsonResult?.profitOrLoss
            if (profitOrLoss < 0) {
                jsonResult[incomesInstance].push({ accName: 'Loss for the year', closing: Math.abs(profitOrLoss), closing_dc: 'C', parentId: null })
            } else {
                jsonResult[expensesInstance].push({ accName: 'Profit for the year', closing: Math.abs(profitOrLoss), closing_dc: 'D', parentId: null })
            }
            dispatch(setQueryHelperData({
                instance: expensesInstance,
                data: jsonResult?.[expensesInstance]
            }))
            dispatch(setQueryHelperData({
                instance: incomesInstance,
                data: jsonResult?.[incomesInstance]
            }))
        } catch (e: any) {
            console.log(e)
        }
    }
}
