import { Aggregate, AggregatesDirective, ColumnsDirective, Selection, ExcelExport, GridComponent, InfiniteScroll, Inject, PdfExport, Resize, Search, Sort, Toolbar, AggregateDirective, AggregateColumnsDirective } from "@syncfusion/ej2-react-grids"
import { FC, useRef } from "react"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { useCompSyncFusionGrid } from "./comp-syncfusion-grid-hook"

export function CompSyncFusionGrid({
    aggregates,
    columns,
    height,
    isLoadOnInit = true,
    instance,
    sqlArgs,
    sqlId
}: CompSyncFusionGridType) {

    const { getAggrColDirectives, getColumnDirectives, loading, selectedData } = useCompSyncFusionGrid({ aggregates, columns, instance, isLoadOnInit, sqlId, sqlArgs, })

    const gridRef: any = useRef({})

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<GridComponent
        allowPdfExport={true}
        allowExcelExport={true}
        allowResizing={true}
        allowSorting={true}
        allowSelection={true}
        allowTextWrap={true}
        dataSource={selectedData?.genericQuery || []}
        gridLines="Both"
        ref={gridRef}
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

    </GridComponent>)

}

type CompSyncFusionGridType = {
    aggregates?: SyncFusionAggregateType[]
    columns: SyncFusionGridColumnType[]
    height?: string
    isLoadOnInit?: boolean
    instance: string
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


