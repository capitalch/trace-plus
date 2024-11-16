// import { useSelector } from "react-redux";
import _ from 'lodash'
import { useSelector } from "react-redux";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { GraphQLQueryArgsType } from "../../../../app/graphql/maps/graphql-queries-map";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook";
import { Utils } from "../../../../utils/utils";
import { RootStateType } from "../../../../app/store/store";
// import { SuperAdminDashBoardType } from "../../super-admin/dashboard/super-admin-dashboard-hook";
// import { RootStateType } from "../../../../app/store/store";

export function useAdminDashBoard() {
    const instance = DataInstancesMap.adminDashBoard
    const args: GraphQLQueryArgsType = {
        sqlId: SqlIdsMap.adminDashBoard,
        sqlArgs: {
            dbName: GLOBAL_SECURITY_DATABASE_NAME,
            clientId: Utils.getCurrentLoginInfo().userDetails?.clientId
        }
    }

    const { loadData, loading, } = useQueryHelper({
        getQueryArgs: () => args,
        instance: instance,
    })

    const selectedData: any = useSelector((state: RootStateType) => {
        return (state.queryHelper[instance]?.data)
    })

    const adminDashBoard: AdminDashBoardType = getAdminDashBoard()

    function getAdminDashBoard() {
        const dashBoard: AdminDashBoardType = {
            counts: {
                businessUnits: 0,
                roles: 0,
                businessUsers: 0
            }
        }
        let jsonResult: any = {}

        if (!_.isEmpty(selectedData)) {
            jsonResult = selectedData?.[0]?.jsonResult
            if (!_.isEmpty(jsonResult)) {
                populateDashBoard(dashBoard, jsonResult)
            }
        }
        return (dashBoard)
    }

    function setCounts(dashBoard: AdminDashBoardType, jsonResult: any) {
        dashBoard.counts.businessUnits = jsonResult.businessUnitsCount || 0
        dashBoard.counts.roles = jsonResult.rolesCount || 0
        dashBoard.counts.businessUsers = jsonResult.businessUsersCount || 0
    }

    function populateDashBoard(dashBoard: AdminDashBoardType, jsonResult: any) {
        if (_.isEmpty(jsonResult)) {
            return
        }
        setCounts(dashBoard, jsonResult)
    }
    return ({ loadData, adminDashBoard, loading })
}

export type AdminDashBoardType = {
    counts: {
        businessUnits: number
        roles: number
        businessUsers: number
    }
}