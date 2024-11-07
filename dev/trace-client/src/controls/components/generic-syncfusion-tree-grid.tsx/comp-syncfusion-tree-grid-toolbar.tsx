import { FC, useContext } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
// import { GlobalContext } from "../../../App"
import { RootStateType } from "../../../app/store/store"
import { TreeGridPdfExportProperties } from "@syncfusion/ej2-react-treegrid"
import { WidgetTooltip } from "../../widgets/widget-tooltip"
import { IconFilePdf } from "../../icons/icon-file-pdf"
import { IconFileExcel } from "../../icons/icon-file-excel"
import { IconFileCsv } from "../../icons/icon-file-csv"
import { WidgetButtonRefresh } from "../../widgets/widget-button-refresh"
import { Utils } from "../../../utils/utils"
import { CompSyncFusionTreeGridSearchBox } from "./comp-syncfusion-tree-grid-search-box"
import { WidgetTreeGridSwitch } from "../../widgets/widget-tree-grid-switch"
import clsx from "clsx"

export function CompSyncFusionTreeGridToolbar({
    className
    , CustomControl = undefined
    , instance = ''
    , isCsvExport = true
    , isExcelExport = true
    , isPdfExport = true
    , isPdfExportAsLandscape = false
    , isRefresh = true
    , isSearch = true

    , title
}: CompSyncFusionTreeGridToolbarType) {
    const context: GlobalContextType = useContext(GlobalContext)

    const pdfExportProperties: TreeGridPdfExportProperties = {
        fileName: 'trace-export.pdf',
        pageOrientation: isPdfExportAsLandscape ? 'Landscape' : 'Portrait',
        isCollapsedStatePersist: false
    }

    return (<div className={clsx("flex justify-between  align-middle", className)}>
        <h2 className="mt-0 text-lg font-medium text-primary-500">{title}</h2>
        <div className="flex items-center gap-2 flex-wrap" >
            {CustomControl && <CustomControl />}

            {/* Pdf export  */}
            {isPdfExport && <WidgetTooltip title="Pdf export">
                <button className="h-8 w-8 rounded-md bg-yellow-300 hover:bg-yellow-400" onClick={() => {
                    const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                    gridRef.current.pdfExport(pdfExportProperties)
                }}>
                    <IconFilePdf className="m-auto h-6 w-6 text-red-600" />
                </button>
            </WidgetTooltip>}

            {/* Excel export */}
            {isExcelExport && <WidgetTooltip title="Excel export">
                <button className="h-8 w-8 rounded-md bg-gray-200 hover:bg-gray-300" onClick={() => {
                    const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                    gridRef.current.excelExport()
                }}>
                    <IconFileExcel className="m-auto h-6 w-6 text-green-600" />
                </button>
            </WidgetTooltip>}

            {/* csv export */}
            {isCsvExport && <WidgetTooltip title="Csv export">
                <button className="h-8 w-8 rounded-md bg-red-100 hover:bg-red-200" onClick={() => {
                    const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                    gridRef.current.csvExport()
                }}>
                    <IconFileCsv className="m-auto h-6 w-6 text-blue-600" />
                </button>
            </WidgetTooltip>}

            {/* Expand / Collapse switch */}
            <WidgetTreeGridSwitch
                instance={instance}
                leftLabel="Collapse"
                rightLabel="Expand"
            />

            {/* Search */}
            {isSearch && <CompSyncFusionTreeGridSearchBox instance={instance} />}

            {/* Refresh */}
            {isRefresh && <WidgetTooltip title="Refresh">
                <WidgetButtonRefresh handleRefresh={async () => {
                    const loadData: any = context.
                        CompSyncFusionTreeGrid[instance].loadData
                    if (loadData) {
                        await loadData()
                    }
                    const state: RootStateType = Utils.getReduxState()
                    const searchString = state.queryHelper[instance].searchString
                    const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                    if (searchString) {
                        gridRef.current.search(searchString)
                    }
                }} />
            </WidgetTooltip>}
        </div>
    </div >)
}

type CompSyncFusionTreeGridToolbarType = {
    className: string
    CustomControl?: FC
    instance: string
    isCsvExport?: boolean
    isExcelExport?: boolean
    isLastNoOfRows?: boolean
    isPdfExport?: boolean
    isPdfExportAsLandscape?: boolean
    isRefresh?: boolean
    isSearch?: boolean
    title: string,
}