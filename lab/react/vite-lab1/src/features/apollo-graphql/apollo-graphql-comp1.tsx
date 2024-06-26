// Mock graphql server is https://graphqlzero.almansi.me/api
// Query is 
// query getAlbums {
//     albums {
//       data{
//         id,
//         title,
//         user {
//           id,
//           name,
//           username,
//           email
//         }
//       }
//     }
//   }

import { useLazyQuery, } from "@apollo/client"
import { GET_ALL_TODOS } from "./apollo-graphql-queries"

// }
export function ApolloGraphQLComp1() {
  const [getData, { loading, error, data }] = useLazyQuery(GET_ALL_TODOS, 
    {
      fetchPolicy: 'cache-first',
      // notifyOnNetworkStatusChange: true,
      onCompleted: () => {
        console.log('completed')
      }
    })
  // const { data, error, loading, refetch, client } = useQuery(
  //   GET_ALL_TODOS, 
  //   {
  //     fetchPolicy: 'cache-first',
  //     skip: true,
  //     // notifyOnNetworkStatusChange: true,
  //     onCompleted: () => {
  //       console.log('completed')
  //     }
  //   })
  if (loading) { return (<div>Loading...</div>) }
  if (error) { return (<div>Error {error.message}</div>) }
  return (
    <div className="ml-2 bg-slate-50 w-1/2">
      <button className="mb-2 rounded-md bg-slate-200 px-4 py-1" onClick={() => {
        // client.refetchQueries({})
        getData()
        // refetch()
      }}>Get TODOs</button>
      {data && data.allTodos && data.allTodos.map((todo: any) => (
        <div key={todo.id}>{todo.status} {todo.title}</div>
      ))}
    </div>)
}

