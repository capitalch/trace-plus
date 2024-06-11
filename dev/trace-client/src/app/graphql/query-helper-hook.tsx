import { useLazyQuery } from "@apollo/client";
import { MapGraphQLQueries, GraphQLQueryArgsType } from "./maps/map-graphql-queries";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../global-constants";
import { useEffect } from "react";
import { Utils } from "../../utils/utils";
import { AppDispatchType } from "../store/store";
import { useDispatch } from "react-redux";
import { setQueryHelperDataR } from "./query-helper-slice";

export function useQueryHelper({
    databaseName = GLOBAL_SECURITY_DATABASE_NAME
    , getQueryArgs
    , instance
    , isExecQueryOnLoad = true
}: QueryHelperType) {
    const queryArgs = getQueryArgs()
    console.log(queryArgs)
    const dispatch: AppDispatchType = useDispatch()
    const [getGenericQueryData, { error, loading }] = useLazyQuery(
        MapGraphQLQueries.genericQuery(databaseName, getQueryArgs())
        , { notifyOnNetworkStatusChange: true, fetchPolicy: 'network-only' }
    )

    useEffect(() => {
        if (isExecQueryOnLoad) {
            loadData()
        }
    }, [])

    if (error) {
        Utils.showErrorMessage(error)
    }

    async function loadData() {
        const result: any = await getGenericQueryData()
        if (result?.data?.genericQuery?.error?.content) {
            Utils.showGraphQlErrorMessage(result.data.genericQuery.error.content)
        }
        dispatch(setQueryHelperDataR({ data: result?.data, instance: instance }))
    }

    return ({ loadData, loading })
}

type QueryHelperType = {
    databaseName?: string
    getQueryArgs: () => GraphQLQueryArgsType
    instance: string
    isExecQueryOnLoad?: boolean

}