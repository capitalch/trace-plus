import { FC, useContext } from "react"
import { CompAppGridSearchBox } from "./comp-app-grid-search-box"
// import { IconIconRefresh } from "../../icons/icon-icon-refresh"
import { WidgetButtonRefresh } from "../../widgets/widget-button-refresh"
import { GlobalContextType } from "../../../app/global-context"
import { GlobalContext } from "../../../App"
// import { Utils } from "../../../utils/utils"
// import { MapDataInstances } from "../../../app/graphql/maps/map-data-instances"
import { AppDispatchType, RootStateType } from "../../../app/store/store"
import { useDispatch, useSelector } from "react-redux"
import { setLastNoOfRowsR } from '../../../app/graphql/query-helper-slice'

export function CompAppGridToolbar({ CustomControl = undefined, isLastNoOfRows = false, instance = '', title }: CompAppGridToolbarType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const dispatch: AppDispatchType = useDispatch()
    // const state: RootStateType = Utils.getReduxState()
    let lastNoOfRows: string = ''
    const selectedLastNoOfRows: string = useSelector((state: RootStateType) => state.queryHelper[instance]?.lastNoOfRows)
    if (selectedLastNoOfRows === undefined) {
        lastNoOfRows = '100'
    } else {
        lastNoOfRows = selectedLastNoOfRows
    }

    return (<div className="flex justify-between items-center">
        <h2 className="mt-0 text-primary-500 text-lg font-medium">{title}</h2>
        <div className="flex gap-2 items-center" >
            {CustomControl && <CustomControl />}
            {isLastNoOfRows && <select value={lastNoOfRows}
                className="h-8 border border-none bg-slate-200  text-sm rounded-xs focus:outline-none focus:border-none" 
                onChange={handleOnChangeLastNoOfRows}>
                <option value="100">Last 100 rows</option>
                <option value="500">Last 500 rows</option>
                <option value="1000">Last 1000 rows</option>
                <option value="">All rows</option>
            </select>}
            <CompAppGridSearchBox />
            <button className="bg-slate-200" onClick={() => {
                const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
                gridRef.current.search('ext')
            }}>Search</button>
            <button className="bg-slate-200" onClick={() => {
                const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
                gridRef.current.pdfExport()
            }}>PDF</button>
            <button className="bg-slate-200" onClick={() => {
                const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
                gridRef.current.excelExport()
            }}>Excel</button>
            <button onClick={() => {
                const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
                gridRef.current.csvExport()
            }}>
                <span className="bg-slate-200">Csv</span>
            </button>
            <WidgetButtonRefresh handleRefresh={() => {
                const loadData: any = context.
                    CompSyncFusionGrid[instance].loadData
                loadData && loadData()
            }} />
            {/* <button className="bg-slate-100 hover:bg-slate-200">
                <IconIconRefresh className='w-10 h-10 text-primary-400 hover:text-primary-600'/>
            </button> */}
        </div>
    </div>)

    function handleOnChangeLastNoOfRows(e: any) {
        dispatch(setLastNoOfRowsR({
            instance: instance,
            lastNoOfRows: e.target.value
        }))
    }
}

type CompAppGridToolbarType = {
    CustomControl?: FC
    instance: string
    isLastNoOfRows?: boolean
    // loadData?: (() => void) | undefined
    title: string,
}