import { Aggregate, AggregatesDirective, ColumnsDirective, Selection, ExcelExport, GridComponent, InfiniteScroll, Inject, PdfExport, Resize, Search, Sort, Toolbar, AggregateDirective, AggregateColumnsDirective, SearchSettingsModel, RowDD } from "@syncfusion/ej2-react-grids"
import { FC, useContext, useEffect, useRef } from "react"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { useCompSyncFusionGrid } from "./comp-syncfusion-grid-hook"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
// import { GlobalContext } from "../../../App"
import { RootStateType } from "../../../app/store/store"
import { Utils } from "../../../utils/utils"
import { GraphQLQueryArgsType } from "../../../app/graphql/maps/graphql-queries-map"

export function CompSyncFusionGrid({
    aggregates,
    className = '',
    // clipMode = undefined,
    columns,
    gridDragAndDropSettings,
    hasCheckBoxSelection = false,
    hasIndexColumn = false,
    height,
    isLoadOnInit = true,
    instance,
    minWidth = '1200px',
    onDelete = undefined,
    onEdit = undefined,
    onPreview = undefined,
    rowHeight = 30,
    sqlArgs,
    sqlId
}: CompSyncFusionGridType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const { getAggrColDirectives, getColumnDirectives, loading, loadData, selectedData } = useCompSyncFusionGrid({ aggregates, columns, instance, hasCheckBoxSelection, hasIndexColumn, isLoadOnInit, onDelete, onEdit, onPreview, sqlId, sqlArgs, })

    const gridRef: any = useRef({})

    useEffect(() => { // make them available globally
        if (!context.CompSyncFusionGrid[instance]) {
            context.CompSyncFusionGrid[instance] = { 
                gridRef: undefined,
                loadData: undefined, 
            }
        }
        context.CompSyncFusionGrid[instance].loadData = loadData
        context.CompSyncFusionGrid[instance].gridRef = gridRef
        return (() => {
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

    // const rowDropOptions: RowDropSettingsModel = { targetID: gridDragAndDropSettings?.targetId }

    return (
        //The div container is important. The minWidth works with style only
        <div style={{ minWidth: `${minWidth}` }}>
            <GridComponent
                allowRowDragAndDrop={gridDragAndDropSettings?.allowRowDragAndDrop}
                // clipMode={clipMode}
                allowPdfExport={true}
                allowExcelExport={true}
                allowResizing={true}
                allowSorting={true}
                allowSelection={true}
                allowTextWrap={true}
                className={className}
                created={onCreated}
                dataSource={selectedData || []}
                enablePersistence={false}
                gridLines="Both"
                height={height}
                id={instance}
                ref={gridRef}
                // rowDataBound={onRowDataBound}
                rowDragStart={gridDragAndDropSettings?.onRowDragStart}
                rowDragStartHelper={gridDragAndDropSettings?.onRowDragStartHelper}
                rowDrop={gridDragAndDropSettings?.onRowDrop}
                rowDropSettings={{
                    targetID: gridDragAndDropSettings?.targetId || undefined,

                }}
                rowHeight={rowHeight}
                searchSettings={searchOptions}
                selectionSettings={{ type: gridDragAndDropSettings?.selectionType || 'Single', }}
            >

                <ColumnsDirective>
                    {getColumnDirectives()}
                </ColumnsDirective>
                {aggregates && <AggregatesDirective>
                    <AggregateDirective>
                        <AggregateColumnsDirective>
                            {getAggrColDirectives()}
                        </AggregateColumnsDirective>
                    </AggregateDirective>
                </AggregatesDirective>}
                <Inject services={[
                    Aggregate
                    , ExcelExport
                    , InfiniteScroll
                    , PdfExport
                    , Resize
                    , RowDD
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

    // function onRowDataBound(args: any) {
    //     // args.row.querySelector('td.e-rowdragdropcell').style.display = 'none';
    // }
}

type GridDragAndDropSettingsType = {
    allowRowDragAndDrop?: boolean
    onRowDragStart?: (args: any) => void
    onRowDragStartHelper?: (args: any) => void
    onRowDrop?: (args: any) => void
    selectionType?: 'Multiple' | "Single"
    targetId?: string
}

export type CompSyncFusionGridType = {
    aggregates?: SyncFusionAggregateType[]
    className?: string
    // clipMode?: 'Clip' | 'Ellipsis' | 'EllipsisWithTooltip' | undefined
    columns: SyncFusionGridColumnType[]
    gridDragAndDropSettings?: GridDragAndDropSettingsType
    hasCheckBoxSelection?: boolean
    hasIndexColumn?: boolean
    height?: string
    instance: string
    isLoadOnInit?: boolean
    minWidth?: string
    onDelete?: (id: string) => void
    onEdit?: (args: any) => void
    onPreview?: (args: any) => void
    rowHeight?: number
    sqlArgs: GraphQLQueryArgsType // SqlArgsType
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


