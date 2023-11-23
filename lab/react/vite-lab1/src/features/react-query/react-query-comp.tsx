import { HttpLink, ApolloClient, InMemoryCache, gql } from "@apollo/client";
import axios from "axios"
import { useQuery } from "react-query"
import urlJoin from "url-join";

function ReactQueryComp() {
    const { data: posts,  isLoading: isLoadingPosts }: any = useQuery('posts', () => retrievePosts())
    const query = gql`
        query {
            hello
        }`
    const { data, error, isLoading, refetch }: any = useQuery('gqlQuery',
        () => queryGraphql(query), )

    if (isLoadingPosts) return <div>Fetching posts...</div>;
    if(isLoading) return <div>Fetching hello...</div>;
    if (error) return <div>An error occurred: {error.message}</div>;

    return (<div className="flex flex-col ml-2 bg-slate-50">
        <span>{data?.data?.hello?.status}</span>
        <button className="w-20 px-2 bg-slate-200" onClick={refetch}>Refetch</button>
        <div className="h-40 overflow-auto">
        {posts.map((post: any) => (
            <li key={post.id}>{post.title}</li>
        ))}
        </div>
    </div>)
}
export { ReactQueryComp }
{/* {posts.map((post: any) => (
            <li key={post.id}>{post.title}</li>
        ))} */}

async function retrievePosts() {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts')
    return (response.data)
}

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

