import { useSelector } from "react-redux";
import { GraphQLQueryArgsType } from "../../../app/graphql/maps/graphql-queries-map";
import { useQueryHelper } from "../../../app/graphql/query-helper-hook";
import { CompSyncfusionTreeGridType, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "./comp-syncfusion-tree-grid";
import { RootStateType } from "../../../app/store/store";
import { AggregateColumnDirective, ColumnDirective } from "@syncfusion/ej2-react-treegrid";

export function useCompSyncfusionTreeGrid({
    addUniqueKeyToJson
    , aggregates
    , buCode
    , columns
    , dbName
    , dbParams
    , graphQlQueryFromMap
    , instance
    , isLoadOnInit
    , sqlId
    , sqlArgs
}: CompSyncfusionTreeGridType) {

    const args: GraphQLQueryArgsType = {
        buCode: buCode,
        dbParams: dbParams,
        sqlId: sqlId,
        sqlArgs: sqlArgs,
    }

    const { loadData, loading, } = useQueryHelper({
        addUniqueKeyToJson: addUniqueKeyToJson,
        dbName: dbName,
        getQueryArgs: () => args,
        graphQlQueryFromMap: graphQlQueryFromMap,
        instance: instance,
        isExecQueryOnLoad: isLoadOnInit,
    })

    const selectedData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[instance]?.data?.[0]?.jsonResult
        return (ret)
    })

    function getAggregateColumnDirectives() {
        const aggrColDirectives: any[] | undefined = aggregates?.map((aggr: SyncFusionTreeGridAggregateColumnType, index: number) => {
            return (
                <AggregateColumnDirective
                    customAggregate={aggr.customAggregate}
                    columnName={aggr.columnName}
                    field={aggr.field}
                    footerTemplate={aggr.footerTemplate}
                    format={aggr.format}
                    type={aggr.type}
                    key={index}
                />
            )
        })
        return(aggrColDirectives)
    }

    function getColumnDirectives() {
        const colDirectives: any[] = columns.map((col: SyncFusionTreeGridColumnType, index: number) => {
            return (<ColumnDirective
                field={col.field}
                clipMode="EllipsisWithTooltip"
                headerText={col.headerText}
                isPrimaryKey={col.isPrimaryKey}
                key={index}
                textAlign={col.textAlign}
                template={col.template}
                type={col.type}
                width={col.width}
                format={col.format}
                visible={col.visible}
            />)
        })
        if (addUniqueKeyToJson) {
            colDirectives.push(<ColumnDirective
                field="pkey"
                isPrimaryKey={true}
                visible={false}
                key='P'
            />)
        }
        return (colDirectives)
    }

    return ({getAggregateColumnDirectives, getColumnDirectives, loading, loadData, selectedData })
}