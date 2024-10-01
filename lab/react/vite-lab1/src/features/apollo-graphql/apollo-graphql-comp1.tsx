// Mock graphql server is https://graphqlzero.almansi.me/api
import { useLazyQuery, } from "@apollo/client"
import { GET_ALBUMS } from "./apollo-graphql-queries"

// }
export function ApolloGraphQLComp1() {
  const [getData, { loading, error, data }] = useLazyQuery(GET_ALBUMS, 
    {
      fetchPolicy: 'cache-first',
      // notifyOnNetworkStatusChange: true,
      onCompleted: () => {
        console.log('completed')
      }
    })
  
  if (loading) { return (<div>Loading...</div>) }
  if (error) { return (<div>Error {error.message}</div>) }
  return (
    <div className="ml-2 bg-slate-50 w-1/2">
      <button className="mb-2 rounded-md bg-slate-200 px-4 py-1" onClick={() => {
        // client.refetchQueries({})
        getData()
        // refetch()
      }}>Get Albums</button>
      {data && data.albums && data.albums.data && data.albums.data.map((album: any) => (
        <div key={album.id}>{album.title}</div>
      ))}
    </div>)
}

