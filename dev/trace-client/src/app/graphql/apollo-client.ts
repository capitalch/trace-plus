import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  NextLink,
  Operation
} from '@apollo/client'
import urlJoin from 'url-join'
import { Utils } from '../../utils/utils'

export function getApolloClient () {
  const token = Utils.getToken()
  const url = Utils.getHostUrl()
  const link = new HttpLink({
    uri: urlJoin(url, 'graphql/')
  })
  const authLink = new ApolloLink((operation: Operation, forward: NextLink) => {
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ''
      }
    })
    return forward(operation)
  })

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(link),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only'
      }
    },
    // credentials:'include'
  })
  return apolloClient
}
