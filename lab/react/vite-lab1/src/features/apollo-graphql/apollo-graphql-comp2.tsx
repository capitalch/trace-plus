import { useQuery } from "@apollo/client"
import { GET_ALBUMS } from "./apollo-graphql-queries"

export function ApolloGraphQLComp2() {
    const { data, error, loading, refetch } = useQuery(GET_ALBUMS)

    if (loading) { return (<div>Loading...</div>) }
    if (error) { return (<div>Error {error.message}</div>) }

    return (<div className="ml-2 bg-slate-50 w-1/2">
        <button className="mb-2 rounded-md bg-slate-200 px-4 py-1" onClick={() => {
            // client.refetchQueries({})
            refetch()
        }}>Get albums</button>
        {data && data.albums && data.albums.data && data.albums.data.map((album: any) => (
            <div key={album.id}>{album.title}</div>
        ))}
    </div>)
}