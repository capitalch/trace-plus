import { Aggregate, AggregatesDirective, ColumnsDirective, Selection, ExcelExport, GridComponent, InfiniteScroll, Inject, PdfExport, Resize, Search, Sort, Toolbar, AggregateDirective, AggregateColumnsDirective, SearchSettingsModel } from "@syncfusion/ej2-react-grids"
import { FC, useContext, useEffect, useRef } from "react"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { useCompSyncFusionGrid } from "./comp-syncfusion-grid-hook"
import { GlobalContextType } from "../../../app/global-context"
import { GlobalContext } from "../../../App"
import { RootStateType } from "../../../app/store/store"
import { Utils } from "../../../utils/utils"

export function CompSyncFusionGrid({
    aggregates,
    className = '',
    columns,
    hasIndexColumn = false,
    height,
    isLoadOnInit = true,
    instance,
    onDelete = undefined,
    onEdit = undefined,
    onPreview = undefined,
    rowHeight = 30,
    sqlArgs,
    sqlId
}: CompSyncFusionGridType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const { getAggrColDirectives, getColumnDirectives, loading, loadData, selectedData } = useCompSyncFusionGrid({ aggregates, columns, instance, hasIndexColumn, isLoadOnInit, onDelete, onEdit, onPreview, sqlId, sqlArgs, })

    const gridRef: any = useRef({})

    useEffect(() => { // make them available globally
        if (!context.CompSyncFusionGrid[instance]) {
            context.CompSyncFusionGrid[instance] = { loadData: undefined, gridRef: undefined }
        }
        context.CompSyncFusionGrid[instance].loadData = loadData
        context.CompSyncFusionGrid[instance].gridRef = gridRef
        return(()=>{
            console.log('Syncfusion cleanup')
        })
    }, [])

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    const searchOptions: SearchSettingsModel = {
        ignoreAccent: true,
        ignoreCase: true,
        operator: 'contains'
    }

    return (
        //The div container is important. The minWidth works with style only
        <div style={{minWidth:'1200px'}}> 
            <GridComponent
                clipMode="EllipsisWithTooltip"
                enablePersistence={false}
                allowPdfExport={true}
                allowExcelExport={true}
                allowResizing={true}
                allowSorting={true}
                allowSelection={true}
                allowTextWrap={true}
                className={className}
                created={onCreated} //?.genericQuery
                dataSource={selectedData || []}
                gridLines="Both"
                ref={gridRef}
                // width='90vw'
                rowHeight={rowHeight}
                searchSettings={searchOptions}
                height={height}>
                <ColumnsDirective>
                    {getColumnDirectives()}
                </ColumnsDirective>
                <AggregatesDirective>
                    <AggregateDirective>
                        <AggregateColumnsDirective>
                            {getAggrColDirectives()}
                        </AggregateColumnsDirective>
                    </AggregateDirective>
                </AggregatesDirective>
                <Inject services={[
                    Aggregate
                    , ExcelExport
                    , InfiniteScroll
                    , PdfExport
                    , Resize
                    , Search
                    , Selection
                    , Sort
                    , Toolbar
                ]} />

            </GridComponent>
        </div>
    )

    function onCreated() {
        const state: RootStateType = Utils.getReduxState()
        const searchString = state.queryHelper[instance]?.searchString
        if (searchString && gridRef.current) {
            gridRef.current.search(searchString)
        }
    }
}

export type CompSyncFusionGridType = {
    aggregates?: SyncFusionAggregateType[]
    className?: string
    columns: SyncFusionGridColumnType[]
    hasIndexColumn?: boolean
    height?: string
    instance: string
    isLoadOnInit?: boolean
    onDelete?: (id: string) => void
    onEdit?: (args: any) => void
    onPreview?: (args: any) => void
    rowHeight?: number
    sqlArgs: SqlArgsType
    sqlId: string
}

export type SyncFusionAggregateType = {
    field: string
    type?: 'Average' | 'Count' | 'Sum' | 'Min' | 'Max'
    footerTemplate?: FC
    format?: 'N2' | 'N0'
}

export type SyncFusionGridColumnType = {
    field: string
    format?: string
    headerText: string
    template?: any
    textAlign?: 'Center' | 'Justify' | 'Left' | 'Right'
    type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime'
    width?: number
}

export type SqlArgsType = {
    [key: string]: string | number
}


