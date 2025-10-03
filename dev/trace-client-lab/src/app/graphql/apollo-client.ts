import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import urlJoin from 'url-join'
import { Utils } from '../../utils/utils'
export function getApolloClient () {
  const url = Utils.getHostUrl()
  const link = new HttpLink({
    uri: urlJoin(url, 'graphql/'),
    // credentials: 'include' // not working
  })
  const authLink = new ApolloLink((operation, forward) => {
    const token = Utils.getToken()
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
      mutate:{
        fetchPolicy: 'no-cache',
      },
      query: {
        fetchPolicy: 'no-cache',
      },
      watchQuery:{
        fetchPolicy: 'no-cache',
      }
    },
    // credentials:'include'
  })
  return apolloClient
}
