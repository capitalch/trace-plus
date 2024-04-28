import { useQuery } from "@apollo/client"
import { GraphQLQueries, GraphQLQueryArgsType } from "../../../app/graphql/graphql-queries"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../app/global-constants"
// import { showErrorMessage } from "../../../utils/util-methods/show-error-message"
import { showGraphQlErrorMessage } from "../../../utils/util-methods/show-graphql-error-message"
import { showErrorMessage } from "../../../utils/util-methods/show-error-message"
// import { LoadingIndicator } from "../../../components/widgets/loading-indicator"

export function useSuperAdminDashBoard() {
    const args: GraphQLQueryArgsType = {
        sqlId: 'get_super_admin_dashboard'
    }
    const { client, data, error, loading, refetch } = useQuery(
        GraphQLQueries.genericQuery(
            GLOBAL_SECURITY_DATABASE_NAME
            , args)
        , { notifyOnNetworkStatusChange: true })

    

    if (error) {
        showErrorMessage(error)
    }
    if (data?.genericQuery?.error?.content) {
        showGraphQlErrorMessage(data.genericQuery.error.content)
        // showErrorMessage(data.genericQuery.error)
    }

    console.log(data)

    return ({ client, data, error, loading, refetch })
}
