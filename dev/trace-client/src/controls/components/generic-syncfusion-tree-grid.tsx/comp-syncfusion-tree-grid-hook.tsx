import { useSelector } from "react-redux";
import _ from 'lodash'
import { GraphQLQueryArgsType } from "../../../app/graphql/maps/graphql-queries-map";
import { useQueryHelper } from "../../../app/graphql/query-helper-hook";
import { CompSyncfusionTreeGridType, SyncFusionTreeGridColumnType } from "./comp-syncfusion-tree-grid";
import { RootStateType } from "../../../app/store/store";
import { ColumnDirective } from "@syncfusion/ej2-react-treegrid";
// import { Utils } from "../../../utils/utils";

export function useCompSyncfusionTreeGrid({
    addUniqueKeyToJson, columns, instance, isLoadOnInit, sqlId, sqlArgs
}: CompSyncfusionTreeGridType) {
    const args: GraphQLQueryArgsType = {
        sqlId: sqlId,
        sqlArgs: sqlArgs
    }

    const { loadData, loading, } = useQueryHelper({
        addUniqueKeyToJson: addUniqueKeyToJson,
        getQueryArgs: () => args,
        instance: instance,
        isExecQueryOnLoad: isLoadOnInit
    })

    const selectedData: any = useSelector((state: RootStateType) => {
        let ret: any = state.queryHelper[instance]?.data?.[0]?.jsonResult
        // if(!_.isEmpty(ret)){
        //     const dta = {...ret}
        //     console.log(dta)
        // }
        return (ret)
    })

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
        return (colDirectives)
    }

    return ({ getColumnDirectives, loading, loadData, selectedData })
}