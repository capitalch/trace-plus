import { useQuery } from "@tanstack/react-query";
import axios from "axios";
// import { useState } from "react";

export function ReactQueryComp1() {

    // queryClient.getQueryData(['users'])
    // const qs: any = queryClient.getQueryState(['users'])
    // const status: QueryStatus = qs.status

    const userData = useQuery(
        {
            queryKey: ['users'],
            queryFn: queryFunction
        }
    )
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
    return (<div className="ml-2">

        <button className="mb-2 rounded-md bg-slate-200 px-4 py-1" onClick={() => userData.refetch()}>Get users</button>
        {(data && data.length > 0) && data.map((user: any) => (
            <div key={user.id}>{user.name}</div>
        ))}

    </div>)

    async function queryFunction() {
        // const response: any = await fetch('https://jsonplaceholder.typicode.com/users')
        // const ret = response.json()
        const ret1: any = await axios.get('https://jsonplaceholder.typicode.com/users')
        const data: any[] = ret1.data
        // data.push({ id: '100', name: 'new user' })
        // ret1.data.push({})
        return (data)
    }
}