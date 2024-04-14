import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, NextLink, Operation } from "@apollo/client";
import { getHostUrl, getToken } from "../../utils/util-methods/misc-methods";
import urlJoin from "url-join";

export function getApolloClient(){
    const token = getToken()
    const url = getHostUrl()
    const link = new HttpLink({
        uri: urlJoin(url, 'graphql/'),
    })
    const authLink = new ApolloLink(
        (operation:Operation, forward: NextLink)=>{
            operation.setContext({
                headers: {
                    authorization: token ? `Bearer ${token}` : ''
                  }
            })
            return(forward(operation))
        }
    )
    
    const apolloClient = new ApolloClient({
        cache: new InMemoryCache(),
        link: authLink.concat(link),
        defaultOptions: {
            query: {
                fetchPolicy: 'network-only'
            }
        }
    })
    return(apolloClient)
}