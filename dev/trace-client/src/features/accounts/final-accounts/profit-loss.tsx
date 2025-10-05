import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { Decimal } from 'decimal.js'
import { DataInstancesMap } from "../../../app/maps/data-instances-map"
import { LoginType } from "../../login/login-slice"
import { Utils } from "../../../utils/utils"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { selectCompSwitchStateFn, setCompAccountsContainerMainTitle } from "../../../controls/redux-components/comp-slice"
import { AppDispatchType, RootStateType } from "../../../app/store"
import { CompAccountsContainer } from "../../../controls/redux-components/comp-accounts-container"
import { CompSwitch } from "../../../controls/redux-components/comp-switch"
import { WidgetButtonRefresh } from "../../../controls/widgets/widget-button-refresh"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../app/maps/graphql-queries-map"
import { setQueryHelperData } from "../../../app/graphql/query-helper-slice"
import { CompSyncFusionTreeGridToolbar } from "../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { CompInstances } from "../../../controls/redux-components/comp-instances"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { CompSyncFusionTreeGridSearchBox } from "../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-search-box"
import { useUtilsInfo } from "../../../utils/utils-info-hook"
import { Messages } from "../../../utils/messages"
import { CustomModalDialog } from "../../../controls/components/custom-modal-dialog"
import { PDFViewer } from "@react-pdf/renderer"
import { BalanceSheetProfitLossPdf } from "./BalanceSheetProfitLossPdf"
import { format, parseISO } from "date-fns"
import Swal from "sweetalert2"
import { IconSettings } from "../../../controls/icons/icon-settings"
import { IconPreview1 } from "../../../controls/icons/icon-preview1"
import { useNavigate } from "react-router-dom"

export function ProfitLoss() {
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()
    const profitLossInstance: string = DataInstancesMap.profitLoss
    const expensesInstance: string = DataInstancesMap.expenses
    const incomesInstance: string = DataInstancesMap.incomes
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, CompInstances.compSwitchProfitLoss), shallowEqual) || false
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [maxNestLevel, setMaxNestLeval] = useState(3);

    const {
        branchId
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        , decFormatter
        , finYearId
        , intFormatter
        , currentFinYear
        , branchName
    } = useUtilsInfo()
    const formattedBranchName = `${isAllBranches ? '' : 'Branch: '} ${isAllBranches ? '' : branchName}`
    const lastDateOfYear = format(parseISO(currentFinYear?.endDate || ''), "do MMMM yyyy")

    const expensesData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[expensesInstance]?.data
        return (ret)
    })

    const incomesData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[incomesInstance]?.data
        return (ret)
    })

    const loadData = useCallback(async () => {
        const queryName: string = GraphQLQueriesMapNames.balanceSheetProfitLoss
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
            jsonResult[expensesInstance] = jsonResult?.expenses || []
            jsonResult[incomesInstance] = jsonResult?.incomes || []
            if (profitOrLoss < 0) {
                jsonResult[incomesInstance].push({ accName: 'Loss for the year', closing: Math.abs(profitOrLoss), closing_dc: 'C', parentId: null })
            } else {
                jsonResult[expensesInstance].push({ accName: 'Profit for the year', closing: Math.abs(profitOrLoss), closing_dc: 'D', parentId: null })
            }

            const expensesDataWithKeys = Utils.addUniqueKeysToJson(jsonResult?.[expensesInstance])
            const incomesDataWithKeys = Utils.addUniqueKeysToJson(jsonResult?.[incomesInstance])

            dispatch(setQueryHelperData({
                instance: expensesInstance,
                data: expensesDataWithKeys
            }))
            dispatch(setQueryHelperData({
                instance: incomesInstance,
                data: incomesDataWithKeys
            }))
            const incomesClosing = customClosingAggregate(jsonResult[incomesInstance], 'closing', 'closing_dc')
            const expensesClosing = customClosingAggregate(jsonResult[expensesInstance], 'closing', 'closing_dc')
            if (incomesClosing !== expensesClosing) {
                Utils.showWarningMessage(Messages.messOpeningBalancesMismatch)
            }
        } catch (e: any) {
            console.log(e)
        }
    }, [
        dbName,
        loginInfo,
        decodedDbParamsObject,
        isAllBranches,
        expensesInstance,
        incomesInstance,
        dispatch
    ])

    useEffect(() => {
        loadData()
    }, [buCode, finYearId, branchId, isAllBranches, loadData])

    // Restore scroll position after data loads
    useEffect(() => {
        if (expensesData && incomesData) {
            // Delay added to ensure grid is fully rendered and expanded nodes are restored
            // before attempting to restore scroll position (total delay: 100ms + 500ms internal)
            setTimeout(() => {
                Utils.treeGridUtils.restoreScrollPos(context, expensesInstance)
                Utils.treeGridUtils.restoreScrollPos(context, incomesInstance)
            }, 100)
        }
    }, [expensesData, incomesData, context, expensesInstance, incomesInstance])

    // Set main title for Profit & Loss
    useEffect(() => {
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: "Profit & Loss" }));
    }, [dispatch]);

    return (<CompAccountsContainer className="mr-6 min-w-[1200px]" CustomControl={CustomControl}>

        {/* Two horizontal grids */}
        <div className="flex items-center mt-2 gap-8" >

            {/* Expenses */}
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
                    addUniqueKeyToJson={true}
                    aggregates={getAggregates()}
                    buCode={buCode}
                    childMapping="children"
                    className=""
                    dataSource={expensesData}
                    dbName={dbName}
                    dbParams={decodedDbParamsObject}
                    // isLoadOnInit={false}
                    columns={getColumns('L')}
                    height="calc(100vh - 245px)"
                    instance={expensesInstance}
                    treeColumnIndex={0}
                    onZoomIn={handleOnZoomIn}
                    zoomInColumnWidth={30}
                />
            </div>

            {/* Income */}
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
                    addUniqueKeyToJson={true}
                    aggregates={getAggregates()}
                    buCode={buCode}
                    childMapping="children"
                    className=""
                    dataSource={incomesData}
                    dbName={dbName}
                    dbParams={decodedDbParamsObject}
                    columns={getColumns('A')}
                    height="calc(100vh - 245px)"
                    instance={incomesInstance}
                    treeColumnIndex={0}
                    onZoomIn={handleOnZoomIn}
                    zoomInColumnWidth={30}
                />
            </div>
        </div>

        {/* Profit and Loss preview */}
        <CustomModalDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            title="Profit and Loss"
            customControl={<NestingLevelSetupButton />}
            element={
                expensesData && incomesData && maxNestLevel > 0 ? (<PDFViewer style={{ width: "100%", height: "100%" }}>
                    <BalanceSheetProfitLossPdf
                        income={incomesData}
                        expenses={expensesData}
                        maxNestingLevel={maxNestLevel}
                        showProfitAndLoss={true}
                        lastDateOfYear={lastDateOfYear}
                        branchName={formattedBranchName}
                    />
                </PDFViewer>) : <></>
            }
        />
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
            {/* All branches */}
            <CompSwitch className="mt-1 mr-4 ml-4" instance={CompInstances.compSwitchProfitLoss} leftLabel="All branches" />

            <CompSyncFusionTreeGridSearchBox instance={profitLossInstance} handleOnChange={handleOnChangeSearchText} />

            {/* Pdf profit and loss */}
            <TooltipComponent content='Preview' className="flex items-center ml-4">
                <button onClick={() => { setIsDialogOpen(true) }}>
                    <IconPreview1 className="w-8 h-8 text-blue-500" />
                </button>
            </TooltipComponent>

            {/* Refresh */}
            <TooltipComponent content='Refresh' className="">
                <WidgetButtonRefresh handleRefresh={doRefresh} />
            </TooltipComponent>
        </div>)
    }

    function NestingLevelSetupButton() {
        const handleDoSettings = async () => {
            const { value: level } = await Swal.fire({
                title: "Set Maximum Nesting Level",
                input: "number",
                inputLabel: "Enter a value between 1 and 10",
                inputValue: maxNestLevel,
                inputAttributes: {
                    min: "1",
                    max: "10",
                    step: "1"
                },
                confirmButtonText: "Apply",
                cancelButtonText: "Cancel",
                showCancelButton: true,
                inputValidator: (value) => {
                    const num = Number(value);
                    if (!value || isNaN(num)) return "Please enter a valid number";
                    if (num < 1 || num > 10) return "Value must be between 1 and 10";
                    return null;
                },
                customClass: {
                    popup: "z-[11000]" // ensures it appears above modal
                }
            });

            if (level !== null && level !== "") {
                const parsed = parseInt(level, 10);
                setMaxNestLeval(parsed);
                // Reopen the PDF modal to reflect new nesting
                setIsDialogOpen(false);
                setTimeout(() => setIsDialogOpen(true), 100);
            }
        };

        return (
            <TooltipComponent content="Set Nesting Level" position="TopCenter" className="mr-2">
                <button
                    onClick={handleDoSettings}
                    className="flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 ring-blue-300 rounded transition duration-150 hover:bg-blue-100 active:ring-2 gap-2"
                >
                    <IconSettings className="w-6 h-6 text-blue-500" />
                    <span className="font-medium text-blue-700 text-sm whitespace-nowrap">
                        Nesting: {maxNestLevel}
                    </span>
                </button>
            </TooltipComponent>
        );
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
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{Utils.toDecimalFormat(props.Custom)}</span>,
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

    function handleOnZoomIn(rowData: any) {
        if (!rowData?.id) {
            return
        }
        navigate('/general-ledger', {
            state: {
                accountId: rowData.id,
                returnPath: '/profit-loss'
            }
        })
    }
}
