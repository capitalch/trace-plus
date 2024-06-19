// import { useMutation } from '@apollo/client'
// import { GLOBAL_SECURITY_DATABASE_NAME } from '../global-constants'
// import {
//   GraphQLQueryArgsType,
//   MapGraphQLQueries
// } from './maps/map-graphql-queries'

import { Utils } from '../../utils/utils'
import { getApolloClient } from './apollo-client'

export function useMutationHelper () {
    async function mutateGraphQL(q:any, queryName:string){
        const client = getApolloClient()
        const result: any = await client.mutate({
            mutation: q
        })
        const error: any = result?.data?.[queryName]?.error?.content
        if(error){
            Utils.showGraphQlErrorMessage(error)
        }
        return(result)
    }
    return({mutateGraphQL})
}

// type MutationHelperType = {
//   databaseName?: string
//   mutationName: string
//   mutationArgs: GraphQLQueryArgsType
// }
