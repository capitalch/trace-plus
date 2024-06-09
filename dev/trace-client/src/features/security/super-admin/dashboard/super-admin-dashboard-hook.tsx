import { GraphQLQueryArgsType, } from "../../../../app/graphql/maps/map-graphql-queries"
import _ from "lodash"
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook"
import { MapDataInstances } from "../../../../app/graphql/maps/map-data-instances"
import { useSelector } from "react-redux"
import { RootStateType } from "../../../../app/store/store"
import { MapSqlIds } from "../../../../app/graphql/maps/map-sql-ids"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants"

export function useSuperAdminDashBoard() {
    const instance = MapDataInstances.superAdminDashBoard
    const args: GraphQLQueryArgsType = {
        sqlId: MapSqlIds.superAdminDashBoard,
        sqlArgs: {
            dbName: GLOBAL_SECURITY_DATABASE_NAME
        }
    }

    const { loadData, loading, } = useQueryHelper({
        getQueryArgs: () => args,
        instance: instance,
    })

    const selectedData: any = useSelector((state: RootStateType) => {
        return (state.queryHelper[instance])
    })

    const superAdminDashBoard: SuperAdminDashBoardType = getSuperAdminDashBoard()

    function getSuperAdminDashBoard(): SuperAdminDashBoardType {
        const dashBoard: SuperAdminDashBoardType = {
            dbConnections: {
                active: 0,
                idle: 0,
                total: 0
            },
            clients: {
                active: 0,
                inactive: 0,
                total: 0
            },
            adminUsers: {
                active: 0,
                inactive: 0,
                total: 0
            },
            nonAdminUsers: {
                active: 0,
                inactive: 0,
                total: 0
            },
            roles: {
                admin: 0,
                superAdmin: 0,
                total: 0
            },
            misc: {
                databasesCount: 0,
                securedControlsCount: 0
            }
        }

        let jsonResult: any = {}

        if (!_.isEmpty(selectedData)) {
            jsonResult = selectedData?.genericQuery[0]?.jsonResult
            if (!_.isEmpty(jsonResult)) {
                populateDashBoard(dashBoard, jsonResult)
            }
        }
        return (dashBoard)
    }

    function setDbConnections(dashboard: SuperAdminDashBoardType, jsonResult: any) {
        const connections: any[] = jsonResult.connections
        for (const conn of connections) {
            if (conn.state === 'active') {
                dashboard.dbConnections.active = conn.count
            } else {
                dashboard.dbConnections.idle = conn.count
            }
        }
        dashboard.dbConnections.total = (dashboard.dbConnections.active || 0) + (dashboard.dbConnections.idle || 0)
    }

    function setClients(dashBoard: SuperAdminDashBoardType, jsonResult: any) {
        const clients: any = jsonResult.clients
        for (const client of clients) {
            if (client.isActive) {
                dashBoard.clients.active = client.count
            } else {
                dashBoard.clients.inactive = client.count
            }
        }
        dashBoard.clients.total = (dashBoard.clients.active || 0) + (dashBoard.clients.inactive || 0)
    }

    function setUsers(dashBoard: SuperAdminDashBoardType, jsonResult: any) {
        const adminUsers: any[] = jsonResult.users.filter((user: any) =>
            !user.roleId
        )
        const nonAdminUsers: any[] = jsonResult.users.filter((user: any) => user.roleId)

        for (const user of adminUsers) {
            if (!user.roleId) {
                dashBoard.adminUsers.active = user.count
            } else {
                dashBoard.adminUsers.inactive = user.count
            }
        }
        dashBoard.adminUsers.total = (dashBoard.adminUsers.active || 0) + (dashBoard.adminUsers.inactive || 0)

        for (const user of nonAdminUsers) {
            if (user.roleId) {
                dashBoard.nonAdminUsers.active = user.count
            } else {
                dashBoard.nonAdminUsers.inactive = user.count
            }
        }
        dashBoard.nonAdminUsers.total = (dashBoard.nonAdminUsers.active || 0) + (dashBoard.nonAdminUsers.inactive || 0)
    }

    function setRoles(dashBoard: SuperAdminDashBoardType, jsonResult: any) {
        for (const role of jsonResult.roles) {
            if (role.clientId) {
                dashBoard.roles.admin = role.count
            } else {
                dashBoard.roles.superAdmin = role.count
            }
        }
        dashBoard.roles.total = (dashBoard.roles.admin || 0) + (dashBoard.roles.superAdmin)
    }

    function setMisc(dashBoard: SuperAdminDashBoardType, jsonResult: any) {
        dashBoard.misc.databasesCount = jsonResult.dbCount
        dashBoard.misc.securedControlsCount = jsonResult.securedControlsCount || 0
    }

    function populateDashBoard(dashBoard: SuperAdminDashBoardType, jsonResult: any) {
        if (_.isEmpty(jsonResult)) {
            return
        }
        setDbConnections(dashBoard, jsonResult)
        setClients(dashBoard, jsonResult)
        setUsers(dashBoard, jsonResult)
        setRoles(dashBoard, jsonResult)
        setMisc(dashBoard, jsonResult)
    }

    return ({ loadData, superAdminDashBoard, loading })
}

export type SuperAdminDashBoardType = {
    dbConnections: {
        active: number
        idle: number
        total: number
    }
    clients: {
        active: number
        inactive: number
        total: number
    }
    adminUsers: {
        active: number
        inactive: number
        total: number
    }
    nonAdminUsers: {
        active: number
        inactive: number
        total: number
    }
    roles: {
        admin: number
        superAdmin: number
        total: number
    }
    misc: {
        databasesCount: number
        securedControlsCount: number
    }
}
// const { data, error, loading, refetch } = useQuery(
//     MapGraphQLQueries.genericQuery(
//         GLOBAL_SECURITY_DATABASE_NAME
//         , args)
//     , { notifyOnNetworkStatusChange: true, fetchPolicy: 'network-only' }) // for each api call refresh client component

// if (error) {
//     Utils.showErrorMessage(error)
// }

// if (data?.genericQuery?.error?.content) {
//     Utils.showGraphQlErrorMessage(data.genericQuery.error.content)
// }