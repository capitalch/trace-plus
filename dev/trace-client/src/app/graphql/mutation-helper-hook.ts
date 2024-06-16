// import { useMutation } from '@apollo/client'
// import { GLOBAL_SECURITY_DATABASE_NAME } from '../global-constants'
// import {
//   GraphQLQueryArgsType,
//   MapGraphQLQueries
// } from './maps/map-graphql-queries'

import { getApolloClient } from './apollo-client'

export function useMutationHelper () {
    async function mutateGraphQL(q:any){
        const client = getApolloClient()
        const ret: any = await client.mutate(q)
        return(ret)
    }
    return({mutateGraphQL})
}

// type MutationHelperType = {
//   databaseName?: string
//   mutationName: string
//   mutationArgs: GraphQLQueryArgsType
// }
