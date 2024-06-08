import { useLazyQuery } from "@apollo/client";
import { MapGraphQLQueries, GraphQLQueryArgsType } from "./maps/map-graphql-queries";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../global-constants";

export function useQueryHelper({databaseName=GLOBAL_SECURITY_DATABASE_NAME, instance = undefined, queryArgs }: QueryHelperType) {
    console.log(instance)
    const [getGenericQueryData, { loading, error }] = useLazyQuery(
        MapGraphQLQueries.genericQuery(databaseName, queryArgs)
        , { notifyOnNetworkStatusChange: true, fetchPolicy: 'network-only' }
    )

    return ({ getGenericQueryData, loading, error })

}

type QueryHelperType = {
    databaseName: string
    instance: string | undefined
    queryArgs: GraphQLQueryArgsType
}