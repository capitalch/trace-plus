import { Aggregate, AggregateColumnDirective, AggregatesDirective, ColumnDirective, ColumnsDirective, ExcelExport, GridComponent, InfiniteScroll, Inject, PdfExport, Resize, Search, Toolbar } from "@syncfusion/ej2-react-grids"
import { FC, useRef } from "react"
import { GraphQLQueries, GraphQLQueryArgsType } from "../../app/graphql/graphql-queries"
import { useLazyQuery } from "@apollo/client"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../app/global-constants"
import { WidgetLoadingIndicator } from "../widgets/widget-loading-indicator"
import { Utils } from "../../utils/utils"

export function CompGenericSyncFusionGrid({
    aggregates,
    columns,
    height,
    // instance,
    sqlArgs,
    sqlId
}: CompGenericSyncFusionGridType) {
    const gridRef: any = useRef({})
    const args: GraphQLQueryArgsType = {
        sqlId: sqlId,
        sqlArgs: sqlArgs
    }

    const [getData, { loading, error, data }] = useLazyQuery(
        GraphQLQueries.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, args)
        , { notifyOnNetworkStatusChange: true }
    )

    getData()

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    if (error) {
        Utils.showErrorMessage(error)
    }

    return (<GridComponent
        allowPdfExport={true}
        allowExcelExport={true}
        allowResizing={true}
        allowSorting={true}
        allowSelection={true}
        allowTextWrap={true}
        dataSource={data}
        gridLines="Both"
        ref={gridRef}
        height={height}>
        <ColumnsDirective>
            {getColumnDirectives()}
        </ColumnsDirective>
        <AggregatesDirective>
            {getAggrColDirectives()}
        </AggregatesDirective>
        <Inject services={[Aggregate, ExcelExport, InfiniteScroll, PdfExport, Resize, Search, Selection, Toolbar,]} />

    </GridComponent>)

    function getAggrColDirectives() {
        const defaultFooterTemplate: FC = (props: any) => <span><b>{props.Sum}</b></span>
        let ds: any[] = []
        if (aggregates && aggregates.length > 0) {
            ds = aggregates.map((aggr: AggregateType, index: number) => {
                return (<AggregateColumnDirective
                    key={index}
                    field={aggr.field}
                    type={aggr.type}
                    footerTemplate={aggr.footerTemplate || defaultFooterTemplate}
                    format={aggr.format || 'N2'}
                />)
            })
        }
        return (ds)
    }

    function getColumnDirectives() {
        return columns.map((col: ColumnType, index: number) => {
            return (<ColumnDirective
                field={col.field}
                headerText={col.headerText}
                key={index}
                textAlign={col.textAlign}
                type={col.type}
                width={col.width}
                format={col.format}
            />)
        })
    }
}

type CompGenericSyncFusionGridType = {
    aggregates?: AggregateType[]
    columns: ColumnType[]
    height?: string
    instance: string
    sqlArgs: SqlArgsType
    sqlId: string
}

type AggregateType = {
    field: string
    type: 'Average' | 'Count' | 'Sum' | 'Min' | 'Max'
    footerTemplate?: FC
    format?: 'N2' | 'N0'
}

type ColumnType = {
    field: string
    format?: string
    headerText: string
    textAlign?: 'Center' | 'Justify' | 'Left' | 'Right'
    type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime'
    width?: number
}

type SqlArgsType = {
    [key: string]: string | number
}