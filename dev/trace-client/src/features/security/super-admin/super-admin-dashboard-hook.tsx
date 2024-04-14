import { useQuery } from "@apollo/client"
import { GraphQLQueries, GraphQLQueryType } from "../../../app/graphql/graphql-queries"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../app/global-constants"

export function useSuperAdminDashBoard() {
    const args: GraphQLQueryType = {
        sqlId: 'get_super_admin_dashboard'
    }
    const { data, loading, error } = useQuery(GraphQLQueries.genericQuery(GLOBAL_SECURITY_DATABASE_NAME, args))
    if (loading) {
        console.log('Loading')
    }

    if (error) {
        console.log(error)
    }

    return ({ data })
}
