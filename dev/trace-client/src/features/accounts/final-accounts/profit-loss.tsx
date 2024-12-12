import { ChangeEvent, useEffect } from "react"
import { Decimal } from 'decimal.js'
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import { LoginType, UserDetailsType } from "../../login/login-slice"
import { Utils } from "../../../utils/utils"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { selectCompSwitchStateFn } from "../../../controls/redux-components/comp-slice"
import { AppDispatchType, RootStateType } from "../../../app/store/store"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { CompSwitch } from "../../../controls/redux-components/comp-switch"
import { WidgetButtonRefresh } from "../../../controls/widgets/widget-button-refresh"
import { GraphQLQueriesMap } from "../../../app/graphql/maps/graphql-queries-map"
import { setQueryHelperData } from "../../../app/graphql/query-helper-slice"
import { CompSyncFusionTreeGridToolbar } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { CompInstances } from "../../../controls/redux-components/comp-instances"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { CompSyncFusionTreeGridSearchBox } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-search-box"
import { useUtilsInfo } from "../../../utils/utils-info-hook"

export function ProfitLoss() {
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const dispatch: AppDispatchType = useDispatch()
    const profitLossInstance: string = DataInstancesMap.profitLoss
    const expensesInstance: string = DataInstancesMap.expenses
    const incomesInstance: string = DataInstancesMap.incomes
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, CompInstances.compSwitchProfitLoss), shallowEqual) || false

    const expensesData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[expensesInstance]?.data
        return (ret)
    })

    const incomesData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[incomesInstance]?.data
        return (ret)
    })
    const {
        branchId
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        , decFormatter
        , finYearId
        , intFormatter
    } = useUtilsInfo()

    useEffect(() => {
        loadData()
    }, [buCode, finYearId, branchId, isAllBranches])

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
                    buCode={buCode}
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
                    buCode={buCode}
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
            <CompSwitch className="ml-4 mt-1 mr-4" instance={CompInstances.compSwitchProfitLoss} leftLabel="All branches" />

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
