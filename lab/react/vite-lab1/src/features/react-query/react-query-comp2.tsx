import { useQuery, } from "@tanstack/react-query";

export function ReactQueryComp2() {
    const userData: any = useQuery({
        queryKey: ['users']
    })
    // const queryClient: QueryClient = useQueryClient()
    // const data: any[] | undefined = queryClient.getQueryData(['users']);
    // const queryState: QueryState | undefined = queryClient.getQueryState(['users'])
    // const queryStatus: QueryStatus | undefined = queryState?.status
    // const data1 = queryState?.data
    // console.log(data1)

    const { isFetching, isLoading, isError, data } = userData
    if (isLoading) {
        return (<div>Loading...</div>)
    }
    if (isFetching) {
        return (<div>Fetching...</div>)
    }
    if (isError) {
        return (<div>Error</div>)
    }
    return (<div>
        {(data && data.length > 0) && data.map((user: any) => (
            <div key={user.id}>{user.name}</div>
        ))}
    </div>)
}
