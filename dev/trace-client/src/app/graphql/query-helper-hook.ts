import { DocumentNode } from '@apollo/client'
import { useLazyQuery } from '@apollo/client/react'
import {
  GraphQLQueriesMap,
  GraphQLQueriesMapNames,
  GraphQLQueryArgsType
} from '../maps/graphql-queries-map'
import _ from 'lodash'
import { GLOBAL_SECURITY_DATABASE_NAME } from '../global-constants'
import { useCallback, useEffect } from 'react'
import { Utils } from '../../utils/utils'
import { AppDispatchType } from '../store'
import { useDispatch } from 'react-redux'
import { resetQueryHelperData, setQueryHelperData } from './query-helper-slice'

export function useQueryHelper({
  addUniqueKeyToJson = false,
  dataPath,
  dbName = GLOBAL_SECURITY_DATABASE_NAME,
  getQueryArgs,
  graphQlQueryFromMap = GraphQLQueriesMap.genericQuery,
  graphQlQueryName = GraphQLQueriesMapNames.genericQuery,
  instance,
  isExecQueryOnLoad = false
}: QueryHelperType) {
  const dispatch: AppDispatchType = useDispatch()

  const [getQueryData, { error, loading, data: queryResult }] = useLazyQuery(
    graphQlQueryFromMap(dbName, getQueryArgs()),
    { notifyOnNetworkStatusChange: true, fetchPolicy: 'network-only' }
  )

  const loadData = useCallback(() => {
    getQueryData()
  }, [getQueryData])

  // Handle the query result when data is available
  useEffect(() => {
    if (queryResult) {
      const queryName = graphQlQueryName
      const result:any = { data: queryResult }
      
      if (result?.data?.[queryName]?.error?.content) {
        Utils.showGraphQlErrorMessage(result.data[queryName].error.content)
      }
      let data = _.isEmpty(result?.data?.[queryName])
        ? []
        : result.data[queryName]
      if (addUniqueKeyToJson) { // Creates persistence of expanded rows by adding unique pkey to each record
        if (data?.[0]?.jsonResult) {
          if (dataPath) {
            const processedData = Utils.addUniqueKeysToJson(data[0].jsonResult[dataPath])
            data = [{
              ...data[0],
              jsonResult: {
                ...data[0].jsonResult,
                [dataPath]: processedData
              }
            }]
          } else {
            const processedJsonResult = 
            Utils.addUniqueKeysToJson(data[0].jsonResult)
            data = [{
              ...data[0],
              jsonResult: processedJsonResult
            }]
          }
        }
      }
      // Dispatch the data to the store after a short delay to ensure UI updates correctly
      setTimeout(() => dispatch(
        setQueryHelperData({
          data: data,
          instance: instance
        })
      ), 100)
    }
  }, [queryResult, graphQlQueryName, addUniqueKeyToJson, dataPath, dispatch, instance])

  useEffect(() => {
    if (isExecQueryOnLoad) {
      loadData()
    }
    return () => {
      // Cleanup data. Otherwise syncfusion grid loads the old data
      dispatch(resetQueryHelperData({ instance: instance }))
    }
  }, [dispatch, instance, isExecQueryOnLoad, loadData])

  if (error) {
    Utils.showErrorMessage(error)
  }
  return { loadData, loading }
}

type QueryHelperType = {
  addUniqueKeyToJson?: boolean
  dataPath?: string
  dbName?: string
  getQueryArgs: () => GraphQLQueryArgsType
  graphQlQueryFromMap?: (
    dbName: string,
    val: GraphQLQueryArgsType
  ) => DocumentNode
  graphQlQueryName?: string
  instance: string
  isExecQueryOnLoad?: boolean
}