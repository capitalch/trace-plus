import { FC, useContext, } from "react"
import { CompSyncFusionGridSearchBox } from "./comp-syncfusion-grid-search-box"
import { WidgetButtonRefresh } from "../../widgets/widget-button-refresh"
import { GlobalContextType } from "../../../app/global-context"
import { GlobalContext } from "../../../App"
import { AppDispatchType, RootStateType } from "../../../app/store/store"
import { useDispatch, useSelector } from "react-redux"
import { setLastNoOfRowsR } from '../../../app/graphql/query-helper-slice'
import { IconFilePdf } from "../../icons/icon-file-pdf"
import { WidgetTooltip } from "../../widgets/widget-tooltip"
import { IconFileExcel } from "../../icons/icon-file-excel"
import { IconFileCsv } from "../../icons/icon-file-csv"
import { Utils } from "../../../utils/utils"

export function CompSyncFusionGridToolbar({
    CustomControl = undefined
    , instance = ''
    , isCsvExport = true
    , isExcelExport = true
    , isLastNoOfRows = false
    , isPdfExport = true
    , isRefresh = true
    , isSearch = true

    , title
}: CompSyncFusionGridToolbarType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const dispatch: AppDispatchType = useDispatch()
    const selectedLastNoOfRows: string = useSelector((state: RootStateType) => state.queryHelper[instance]?.lastNoOfRows)
    let lastNoOfRows: string = selectedLastNoOfRows
    if (selectedLastNoOfRows === undefined) {
        lastNoOfRows = '100'
    }

    // const columns: any[] = [
    //     { field: 'id', textAlign: 'Right', width: 120 },
    //     { field: 'clientName', width: 100 },
    // ]
    // const excelExportProperties: ExcelExportProperties = {
    //     fileName: 'trace-export.xlsx',
    //     columns: columns
    // }

    return (<div className="flex items-center justify-between">
        <h2 className="mt-0 text-lg font-medium text-primary-500">{title}</h2>
        <div className="flex items-center gap-2 flex-wrap" >
            {CustomControl && <CustomControl />}

            {/* last no of rows */}
            {isLastNoOfRows && <select value={lastNoOfRows}
                className="rounded-md h-9 border border-none bg-slate-200 text-sm focus:border-none focus:outline-none"
                onChange={handleOnChangeLastNoOfRows}>
                <option value="100">Last 100 rows</option>
                <option value="500">Last 500 rows</option>
                <option value="1000">Last 1000 rows</option>
                <option value="">All rows</option>
            </select>}

            {/* Pdf export  */}
            {isPdfExport && <WidgetTooltip title="Pdf export">
                <button className="h-8 w-8 rounded-md bg-yellow-300 hover:bg-yellow-400" onClick={() => {
                    const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
                    gridRef.current.pdfExport()
                }}>
                    <IconFilePdf className="m-auto h-6 w-6 text-red-600" />
                </button>
            </WidgetTooltip>}

            {/* Excel export */}
            {isExcelExport && <WidgetTooltip title="Excel export">
                <button className="h-8 w-8 rounded-md bg-gray-200 hover:bg-gray-300" onClick={() => {
                    const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
                    gridRef.current.excelExport()
                }}>
                    <IconFileExcel className="m-auto h-6 w-6 text-green-600" />
                </button>
            </WidgetTooltip>}

            {/* csv export */}
            {isCsvExport && <WidgetTooltip title="Csv export">
                <button className="h-8 w-8 rounded-md bg-red-100 hover:bg-red-200" onClick={() => {
                    const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
                    gridRef.current.csvExport()
                }}>
                    <IconFileCsv className="m-auto h-6 w-6 text-blue-600" />
                </button>
            </WidgetTooltip>}

            {/* Search */}
            {isSearch && <CompSyncFusionGridSearchBox instance={instance} />}

            {/* Refresh */}
            {isRefresh && <WidgetTooltip title="Refresh">
                <WidgetButtonRefresh handleRefresh={async () => {
                    const loadData: any = context.
                        CompSyncFusionGrid[instance].loadData
                    loadData && await loadData()
                    const state: RootStateType = Utils.getReduxState()
                    const searchString = state.queryHelper[instance].searchString
                    const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
                    if (searchString) {
                        gridRef.current.search(searchString)
                    }
                }} />
            </WidgetTooltip>}

        </div>
    </div >)

    function handleOnChangeLastNoOfRows(e: any) {
        dispatch(setLastNoOfRowsR({
            instance: instance,
            lastNoOfRows: e.target.value
        }))
    }
}

type CompSyncFusionGridToolbarType = {
    CustomControl?: FC
    instance: string

    isCsvExport?: boolean
    isExcelExport?: boolean
    isLastNoOfRows?: boolean
    isPdfExport?: boolean
    isRefresh?: boolean
    isSearch?: boolean

    title: string,
}