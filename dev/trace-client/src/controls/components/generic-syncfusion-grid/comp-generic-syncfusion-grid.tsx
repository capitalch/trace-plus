import { Aggregate, AggregateColumnDirective, AggregatesDirective, ColumnDirective, ColumnsDirective, Selection, ExcelExport, GridComponent, InfiniteScroll, Inject, PdfExport, Resize, Search, Sort, Toolbar, AggregateDirective, AggregateColumnsDirective } from "@syncfusion/ej2-react-grids"
import { FC, useEffect, useRef } from "react"
import { MapGraphQLQueries, GraphQLQueryArgsType } from "../../../app/graphql/maps/map-graphql-queries"
import { useLazyQuery, } from "@apollo/client"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../app/global-constants"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { Utils } from "../../../utils/utils"

export function CompGenericSyncFusionGrid({
    aggregates,
    columns,
    height,
    isLoadOnInit = true,
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
        MapGraphQLQueries.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, args)
        , { notifyOnNetworkStatusChange: true, fetchPolicy: 'network-only' } // network-only fetches data from server every time the query is called
    )

    useEffect(() => {
        if (isLoadOnInit) {
            // getData()
            loadData();
        }
    }, [])

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    if (error) {
        Utils.showErrorMessage(error)
    }

    if (data?.genericQuery?.error?.content) {
        Utils.showGraphQlErrorMessage(data.genericQuery.error.content)
    }

    return (<GridComponent
        allowPdfExport={true}
        allowExcelExport={true}
        allowResizing={true}
        allowSorting={true}
        allowSelection={true}
        allowTextWrap={true}
        dataSource={data?.genericQuery || []}
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

    async function loadData() {
        const dt: any = await getData();
        console.log(dt);
    }

    function getAggrColDirectives() {
        const defaultFooterTemplate: FC = (props: any) => <span><b>{props.Sum}</b></span>
        let ds: any[] = []
        if (aggregates && aggregates.length > 0) {
            ds = aggregates.map((aggr: SyncFusionAggregateType, index: number) => {
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
        return columns.map((col: SyncFusionGridColumnType, index: number) => {
            return (<ColumnDirective
                field={col.field}
                headerText={col.headerText}
                key={index}
                textAlign={col.textAlign}
                template={col.template}
                type={col.type}
                width={col.width}
                format={col.format}
            />)
        })
    }
}

type CompGenericSyncFusionGridType = {
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

type SqlArgsType = {
    [key: string]: string | number
}