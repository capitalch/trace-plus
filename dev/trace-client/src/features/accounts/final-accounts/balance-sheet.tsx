import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
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
import { IconSettings } from "../../../controls/icons/icon-settings"
import Swal from "sweetalert2"
import { IconPreview1 } from "../../../controls/icons/icon-preview1"
import { useNavigate } from "react-router-dom"

export function BalanceSheet() {
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()
    const balanceSheetInstance: string = DataInstancesMap.balanceSheet
    const liabsInstance: string = DataInstancesMap.liabilities
    const assetsInstance: string = DataInstancesMap.assets
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, CompInstances.compSwitchBalanceSheet), shallowEqual) || false
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [maxNestLevel, setMaxNestLeval] = useState(3);

    const dateInputRef = useRef<HTMLInputElement>(null)

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

    const [appliedDate, setAppliedDate] = useState<string | null>(currentFinYear ? format(currentFinYear?.endDate, 'yyyy-MM-dd') : null)

    const lastDateOfYear = appliedDate
        ? format(parseISO(appliedDate), "do MMMM yyyy")
        : format(parseISO(currentFinYear?.endDate || ''), "do MMMM yyyy")
    const formattedBranchName = `${isAllBranches ? '' : 'Branch: '} ${isAllBranches ? '' : branchName}`

    const liabsData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[liabsInstance]?.data
        return (ret)
    })

    const assetsData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[assetsInstance]?.data
        return (ret)
    })

    useEffect(() => {
        const formattedDate = format(currentFinYear?.endDate || '', 'yyyy-MM-dd')
        setAppliedDate(formattedDate)
        if (dateInputRef.current) {
            dateInputRef.current.value = formattedDate
        }
    }, [buCode, finYearId, branchId, isAllBranches, currentFinYear])

    const loadData = useCallback(async () => {
        const queryName: string = GraphQLQueriesMapNames.balanceSheetProfitLoss;
        const q: any = GraphQLQueriesMap.balanceSheetProfitLoss(
            dbName || '',
            {
                buCode: loginInfo.currentBusinessUnit?.buCode,
                dbParams: decodedDbParamsObject,
                sqlArgs: {
                    branchId: isAllBranches ? null : loginInfo.currentBranch?.branchId,
                    finYearId: loginInfo.currentFinYear?.finYearId,
                    toDate: appliedDate
                },
            }
        );

        try {
            const res: any = await Utils.queryGraphQL(q, queryName);
            const jsonResult: any = res?.data?.[queryName]?.[0]?.jsonResult;

            const profitOrLoss = jsonResult?.profitOrLoss;
            jsonResult[liabsInstance] = jsonResult?.[liabsInstance] || [];
            jsonResult[assetsInstance] = jsonResult?.[assetsInstance] || [];

            if (profitOrLoss < 0) {
                jsonResult[assetsInstance].push({
                    accName: 'Loss for the year',
                    closing: Math.abs(profitOrLoss),
                    closing_dc: 'D',
                    parentId: null
                });
            } else {
                jsonResult[liabsInstance].push({
                    accName: 'Profit for the year',
                    closing: Math.abs(profitOrLoss),
                    closing_dc: 'C',
                    parentId: null
                });
            }

            const liabsDataWithKeys = Utils.addUniqueKeysToJson(jsonResult?.[liabsInstance])
            const assetsDataWithKeys = Utils.addUniqueKeysToJson(jsonResult?.[assetsInstance])

            dispatch(setQueryHelperData({
                instance: liabsInstance,
                data: liabsDataWithKeys,
            }));

            dispatch(setQueryHelperData({
                instance: assetsInstance,
                data: assetsDataWithKeys,
            }));

            const assetsClosing = customClosingAggregate(jsonResult[assetsInstance], 'closing', 'closing_dc');
            const liabsClosing = customClosingAggregate(jsonResult[liabsInstance], 'closing', 'closing_dc');

            if (assetsClosing !== liabsClosing) {
                Utils.showWarningMessage(Messages.messOpeningBalancesMismatch);
            }
        } catch (e: any) {
            console.error(e);
        }
    }, [
        dbName,
        loginInfo,
        decodedDbParamsObject,
        isAllBranches,
        liabsInstance,
        assetsInstance,
        dispatch,
        appliedDate
    ]);

    useEffect(() => {
        loadData()
    }, [buCode, finYearId, branchId, isAllBranches, loadData])

    // Restore scroll position after data loads
    useEffect(() => {
        if (liabsData && assetsData) {
            // Delay added to ensure grid is fully rendered and expanded nodes are restored
            // before attempting to restore scroll position (total delay: 100ms + 500ms internal)
            setTimeout(() => {
                Utils.treeGridUtils.restoreScrollPos(context, liabsInstance)
                Utils.treeGridUtils.restoreScrollPos(context, assetsInstance)
            }, 100)
        }
    }, [liabsData, assetsData, context, liabsInstance, assetsInstance])

    // Set main title for Balance Sheet
    useEffect(() => {
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: "Balance Sheet" }));
    }, [dispatch]);

    return (<CompAccountsContainer className="mr-6 lg:min-w-[1200px]" >
        {/* Header */}
        <CustomControl  />
        {/* Two grids - vertical on small/medium, horizontal on large */}
        <div className="flex flex-col lg:flex-row lg:items-center mt-2 gap-4 lg:gap-8" >

            {/* Liabilities */}
            <div className="flex flex-col w-full lg:w-1/2">
                <CompSyncFusionTreeGridToolbar className='mt-2'
                    isAllBranches={isAllBranches}
                    isLastNoOfRows={false}
                    isRefresh={false}
                    instance={liabsInstance}
                    isSearch={false}
                    title='Liabilities'
                />
                <CompSyncfusionTreeGrid
                    addUniqueKeyToJson={true}
                    aggregates={getAggregates()}
                    buCode={buCode}
                    childMapping="children"
                    className=""
                    dataSource={liabsData || []}
                    dbName={dbName}
                    dbParams={decodedDbParamsObject}
                    columns={getColumns('L')}
                    height="calc(100vh - 280px)"
                    instance={liabsInstance}
                    treeColumnIndex={0}
                    onZoomIn={handleOnZoomIn}
                    zoomInColumnWidth={30}
                />
            </div>

            {/* Assets */}
            <div className="flex flex-col w-full lg:w-1/2">
                <CompSyncFusionTreeGridToolbar className='mt-2'
                    isAllBranches={isAllBranches}
                    isLastNoOfRows={false}
                    isRefresh={false}
                    instance={assetsInstance}
                    isSearch={false}
                    title='Assets'
                />
                <CompSyncfusionTreeGrid
                    addUniqueKeyToJson={true}
                    aggregates={getAggregates()}
                    buCode={buCode}
                    childMapping="children"
                    className=""
                    dataSource={assetsData || []}
                    dbName={dbName}
                    dbParams={decodedDbParamsObject}
                    columns={getColumns('A')}
                    height="calc(100vh - 280px)"
                    instance={assetsInstance}
                    treeColumnIndex={0}
                    onZoomIn={handleOnZoomIn}
                    zoomInColumnWidth={30}
                />
            </div>
        </div>

        {/* Balance sheet preview */}
        <CustomModalDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            title="Balance Sheet"
            customControl={<NestingLevelSetupButton />}
            element={
                assetsData && liabsData && maxNestLevel > 0 ? (<PDFViewer style={{ width: "100%", height: "100%" }}>
                    <BalanceSheetProfitLossPdf
                        assets={assetsData}
                        liabilities={liabsData}
                        maxNestingLevel={maxNestLevel}
                        lastDateOfYear={lastDateOfYear}
                        branchName={formattedBranchName}
                    />
                </PDFViewer>) : <></>
            }
        />

    </CompAccountsContainer>)

    function assetsClosingColumnTemplate(props: any) {
        const ret = <div>
            <span>{props.closing_dc === 'C' ? '-' : ''}</span>
            <span>{decFormatter.format(props.closing)}</span>
        </div>
        return (ret)
    }

    function CustomControl() {
        return (
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-3 mt-2 justify-end">
            {/* All branches */}
            <div className="whitespace-nowrap">
                <CompSwitch instance={CompInstances.compSwitchBalanceSheet} leftLabel="All branches" />
            </div>

            {/* Date input with Apply button */}
            <div className="flex items-center gap-1.5">
                <label className="font-medium text-sm whitespace-nowrap">
                    As on Date:
                </label>
                <input
                    ref={dateInputRef}
                    type="date"
                    defaultValue={appliedDate || ''}
                    min={format(currentFinYear?.startDate || '', 'yyyy-MM-dd')}
                    max={format(currentFinYear?.endDate || '', 'yyyy-MM-dd')}
                    className="px-2 py-1 text-sm border rounded-md cursor-pointer"
                />
                <button
                    onClick={() => {
                        if (dateInputRef.current) {
                            const dateValue = dateInputRef.current.value
                            if (!dateValue) {
                                Utils.showAlertMessage('Error', Messages.errInvalidDate)
                                return
                            }

                            // Validate date is within financial year range
                            const minDate = format(currentFinYear?.startDate || '', 'yyyy-MM-dd')
                            const maxDate = format(currentFinYear?.endDate || '', 'yyyy-MM-dd')
                            if (dateValue < minDate || dateValue > maxDate) {
                                Utils.showAlertMessage('Error', Messages.errDateBeyondRange)
                                return
                            }

                            setAppliedDate(dateValue)
                        }
                    }}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 whitespace-nowrap"
                >
                    Apply
                </button>
            </div>

            {/* Search box */}
            <div>
                <CompSyncFusionTreeGridSearchBox instance={balanceSheetInstance} handleOnChange={handleOnChangeSearchText} />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
                {/* Preview Pdf balance sheet */}
                <TooltipComponent content='Preview' className="flex items-center">
                    <button onClick={async () => {
                        setIsDialogOpen(true)
                    }}>
                        <IconPreview1 className="w-8 h-8 text-blue-500" />
                    </button>
                </TooltipComponent>

                {/* Refresh */}
                <TooltipComponent content='Refresh' className="">
                    <WidgetButtonRefresh handleRefresh={doRefresh} />
                </TooltipComponent>
            </div>
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

    function liabsClosingColumnTemplate(props: any) {
        const ret = <div>
            <span>{props.closing_dc === 'D' ? '-' : ''}</span>
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
                template: type === 'L' ? liabsClosingColumnTemplate : assetsClosingColumnTemplate
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
        const gridRefLiabs: any = context.CompSyncFusionTreeGrid[liabsInstance].gridRef
        gridRefLiabs.current.search(event.target.value)

        const gridRefAssets: any = context.CompSyncFusionTreeGrid[assetsInstance].gridRef
        gridRefAssets.current.search(event.target.value)
    }

    function handleOnZoomIn(rowData: any) {
        if (!rowData?.id) {
            return
        }
        navigate('/general-ledger', {
            state: {
                accountId: rowData.id,
                returnPath: '/balance-sheet',
                reportName: 'Balance Sheet'
            }
        })
    }
}
