import { useQuery } from "@apollo/client"
import { GraphQLQueries, GraphQLQueryArgsType } from "../../../app/graphql/graphql-queries"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../app/global-constants"
import { showGraphQlErrorMessage } from "../../../utils/util-methods/show-graphql-error-message"
import { showErrorMessage } from "../../../utils/util-methods/show-error-message"

export function useSuperAdminDashBoard() {
    const args: GraphQLQueryArgsType = {
        sqlId: 'get_super_admin_dashboard',
        dbName: 'traceAuth'
    }
    const { client, data, error, loading, refetch } = useQuery(
        GraphQLQueries.genericQuery(
            GLOBAL_SECURITY_DATABASE_NAME
            , args)
        , { notifyOnNetworkStatusChange: true }) // for each api call refresh client component

    if (error) {
        showErrorMessage(error)
    }
    if (data?.genericQuery?.error?.content) {
        showGraphQlErrorMessage(data.genericQuery.error.content)
    }
    let jsonResult: any = {}
    if (data) {
        jsonResult = data.genericQuery[0].jsonResult
    }

    console.log(JSON.stringify(jsonResult))

    return ({ client, data, error, loading, refetch })
}
