import { FC, useContext } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
import { RootStateType } from "../../../app/store"
import { TreeGridPdfExportProperties } from "@syncfusion/ej2-react-treegrid"
import { IconFilePdf } from "../../icons/icon-file-pdf"
import { IconFileExcel } from "../../icons/icon-file-excel"
import { IconFileCsv } from "../../icons/icon-file-csv"
import { WidgetButtonRefresh } from "../../widgets/widget-button-refresh"
import { Utils } from "../../../utils/utils"
import { CompSyncFusionTreeGridSearchBox } from "./comp-syncfusion-tree-grid-search-box"
import clsx from "clsx"
import { CompSwitch } from "../../redux-components/comp-switch"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"

export function CompSyncFusionTreeGridToolbar({
    className
    , CustomControl = undefined
    , instance = ''
    , isAllBranches = false
    , isCsvExport = true
    , isExcelExport = true
    , isPdfExport = true
    , isPdfExportAsLandscape = false
    , isRefresh = true
    , isSearch = true
    , isTitleVisible = true
    , minWidth
    , title
    , width
}: CompSyncFusionTreeGridToolbarType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const pdfExportProperties: TreeGridPdfExportProperties = {
        fileName: `${title}-${Utils.getCompanyName()}-${isAllBranches ? 'All branches' : Utils.getCurrentLoginInfo().currentBranch?.branchName || ''}-${Utils.getCurrentFinYearFormattedDateRange()}.pdf`,
        header: {
            fromTop: 0,
            height: 50,
            contents: [
                {
                    type: 'Text',
                    value: `${Utils.getCompanyName()}, Branch: ${isAllBranches ? 'All branches' : Utils.getCurrentLoginInfo().currentBranch?.branchName || ''}`,
                    position: { x: 0, y: 0 },
                    style: { textBrushColor: '#000000', fontSize: 16 }
                },
                {
                    type: 'Text',
                    value: `${title}: (${Utils.getCurrentFinYearFormattedDateRange()})`,
                    position: { x: 0, y: 20 },
                    style: { textBrushColor: '#000000', fontSize: 14 }
                }
            ]
        },
        isCollapsedStatePersist: false,
        pageOrientation: isPdfExportAsLandscape ? 'Landscape' : 'Portrait',
    }

    return (<div className={clsx("flex justify-between items-center", className)} style={{ minWidth: `${minWidth}`, width: `${width}` }}>
        {<label className="text-lg font-medium text-primary-500 mb-1">{isTitleVisible ? title : ''}</label>}
        <div className="flex items-center gap-2 flex-wrap" >
            {CustomControl && <CustomControl />}

            {/* Pdf export  */}
            {isPdfExport && <TooltipComponent content="Pdf export">
                <button type="button" title="Pdf export" className="h-8 w-8 rounded-md bg-yellow-300 hover:bg-yellow-400" onClick={() => {
                    const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                    gridRef.current.pdfExport(pdfExportProperties)
                }}>
                    <IconFilePdf className="m-auto h-6 w-6 text-red-600" />
                </button>
            </TooltipComponent>}

            {/* Excel export */}
            {isExcelExport && <TooltipComponent content="Excel export">
                <button type="button" title="Excel export" className="h-8 w-8 rounded-md bg-gray-200 hover:bg-gray-300" onClick={() => {
                    const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                    gridRef.current.excelExport()
                }}>
                    <IconFileExcel className="m-auto h-6 w-6 text-green-600" />
                </button>
            </TooltipComponent>}

            {/* csv export */}
            {isCsvExport && <TooltipComponent content="Csv export">
                <button type="button" title="Csv export" className="h-8 w-8 rounded-md bg-red-100 hover:bg-red-200" onClick={() => {
                    const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                    gridRef.current.csvExport()
                }}>
                    <IconFileCsv className="m-auto h-6 w-6 text-blue-600" />
                </button>
            </TooltipComponent>}

            {/* Expand / Collapse switch */}
            {/* <WidgetTreeGridSwitch
                className="mr-2"
                instance={instance}
                leftLabel="Expand"
            /> */}

            {/* Expand / Collapse redux switch */}
            <CompSwitch className="mr-2" instance={instance} leftLabel="Expand" />

            {/* Search */}
            {isSearch && <CompSyncFusionTreeGridSearchBox instance={instance} />}

            {/* Refresh */}
            {isRefresh && <TooltipComponent content="Refresh">
                <WidgetButtonRefresh handleRefresh={async () => {
                    const loadData: any = context.
                        CompSyncFusionTreeGrid[instance].loadData
                    if (loadData) {
                        await loadData()
                    }
                    const state: RootStateType = Utils.getReduxState()
                    const searchString = state.queryHelper?.[instance]?.searchString
                    const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                    if (searchString) {
                        gridRef.current.search(searchString)
                    }
                }} />
            </TooltipComponent>}
        </div>
    </div >)
}

type CompSyncFusionTreeGridToolbarType = {
    className: string
    CustomControl?: FC
    instance: string
    isAllBranches?: boolean
    isCsvExport?: boolean
    isExcelExport?: boolean
    isLastNoOfRows?: boolean
    isPdfExport?: boolean
    isPdfExportAsLandscape?: boolean
    isRefresh?: boolean
    isTitleVisible?: boolean
    isSearch?: boolean
    minWidth?: string
    title: string,
    width?: string
}