import { HttpLink, ApolloClient, InMemoryCache, gql } from "@apollo/client";
// import axios from "axios"
import { useQuery } from "react-query"
import urlJoin from "url-join";

function ReactQueryComp() {
    // const { data: posts, error, isLoading }: any = useQuery('posts', () => retrievePosts())
    const query = gql`
        query {
            hello
        }`
    const { data, error, isLoading }: any = useQuery('gqlQuery', () => queryGraphql(query))

    if (isLoading) return <div>Fetching posts...</div>;
    if (error) return <div>An error occurred: {error.message}</div>;

    return (<ul className="ml-2 bg-slate-100 overflow-auto h-60">
        {data.data.hello.status}
        {/* {posts.map((post: any) => (
            <li key={post.id}>{post.title}</li>
        ))} */}
    </ul>)
}
export { ReactQueryComp }

// async function retrievePosts() {
//     const response = await axios.get('https://jsonplaceholder.typicode.com/posts')
//     return (response.data)
// }

function getClient() {
    const link = new HttpLink({
        uri: urlJoin('http://localhost:8000', 'graphql/')
    })

    const client = new ApolloClient({
        cache: new InMemoryCache,
        link: link,
        defaultOptions: {
            query: {
                fetchPolicy: 'network-only'
            }
        }
    })
    return (client)
}

async function queryGraphql(q: any) {
    const client = getClient()
    let ret: any
    try {
        ret = await client.query({
            query: q
        })
    } catch (error: any) {
        if (error.networkError) {
            console.log(error)
        } else {
            console.log(error)
        }
    }
    return ret
}

