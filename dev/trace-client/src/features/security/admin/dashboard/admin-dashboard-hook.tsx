// import { useSelector } from "react-redux";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { GraphQLQueryArgsType } from "../../../../app/graphql/maps/graphql-queries-map";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook";
import { Utils } from "../../../../utils/utils";
// import { RootStateType } from "../../../../app/store/store";

export function useAdminDashBoard(){
    const instance = DataInstancesMap.adminDashBoard
    const args: GraphQLQueryArgsType = {
        sqlId: SqlIdsMap.adminDashBoard,
        sqlArgs: {
            dbName: GLOBAL_SECURITY_DATABASE_NAME,
            clientId: Utils.getCurrentLoginInfo().clientId
        }
    }

    const { loadData, loading, } = useQueryHelper({
        getQueryArgs: () => args,
        instance: instance,
    })

    // const selectedData: any = useSelector((state: RootStateType) => {
    //     return (state.queryHelper[instance]?.data)
    // })

    const adminDashBoard: AdminDashBoardType = getAdminDashBoard()

    function getAdminDashBoard(){
        const dashBoard: AdminDashBoardType = {
            misc: {
                databasesCount: 0,
                securedControlsCount: 0
            }
        }
        return(dashBoard)
    }
    return ({ loadData, adminDashBoard, loading })
}

export type AdminDashBoardType = {
    misc: {
        databasesCount: number
        securedControlsCount: number
    }
}