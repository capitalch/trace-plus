import { useLazyQuery } from "@apollo/client";
import {  GET_TEST_EXCEPTION } from "./apollo-graphql-queries";

export function ApolloGraphQL03112024() {
    const [getData, { loading, error, data }] = useLazyQuery(GET_TEST_EXCEPTION, {
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true
    })

    if (loading) { return (<div>Loading...</div>) }
    if (error) { return (<div>Error {error.message}</div>) }

    return (<div>
        <button onClick={
            () => getData()
        } className="ml-2 bg-slate-50 w-1/2">Get books</button>
        {data?.testException ? JSON.stringify(data.testException) : <></>}
        {/* {data?.books ? data.books.map((book: any,index:number) => {
            return (<div key={index}>
                <span>{book.title}</span>
                <span>{book.author}</span>
            </div>)
        }) : <></>} */}
    </div>)
}