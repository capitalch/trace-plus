import { FC, } from "react"
import { GraphQLQueryArgsType, } from "../../../app/graphql/maps/map-graphql-queries";
import { SyncFusionAggregateType, SyncFusionGridColumnType } from "./comp-syncfusion-grid";
import { AggregateColumnDirective, ColumnDirective } from "@syncfusion/ej2-react-grids";
import { useQueryHelper } from "../../../app/graphql/query-helper-hook";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../app/store/store";

export function useCompSyncFusionGrid({ aggregates, columns, instance, isLoadOnInit, sqlId, sqlArgs, }: any) {

    const args: GraphQLQueryArgsType = {
        sqlId: sqlId,
        sqlArgs: sqlArgs
    }

    const { loading, } = useQueryHelper({
        getQueryArgs: () => args,
        instance: instance,
        isExecQueryOnLoad: isLoadOnInit
    })

    const selectedData: any = useSelector((state: RootStateType) => state.queryHelper[instance])

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

    return ({ getAggrColDirectives, getColumnDirectives, loading, selectedData })
}
