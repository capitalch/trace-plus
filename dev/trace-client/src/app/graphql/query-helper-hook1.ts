import { DocumentNode, useLazyQuery } from '@apollo/client'
import {
  GraphQLQueriesMap,
  GraphQLQueriesMapNames,
  GraphQLQueryArgsType
} from './maps/graphql-queries-map'
import _ from 'lodash'
import { GLOBAL_SECURITY_DATABASE_NAME } from '../global-constants'
import { useEffect } from 'react'
import { Utils } from '../../utils/utils'
import { AppDispatchType } from '../store/store'
import { useDispatch } from 'react-redux'
import { resetQueryHelperData, setQueryHelperData } from './query-helper-slice'

export function useQueryHelper1 ({
  addUniqueKeyToJson = false,
  dataPath,
  dbName = GLOBAL_SECURITY_DATABASE_NAME,
  getQueryArgs,
  graphQlQueryFromMap = GraphQLQueriesMap.genericQuery,
  graphQlQueryName = GraphQLQueriesMapNames.genericQuery,
  instance,
  isExecQueryOnLoad = true
}: QueryHelperType) {
  const dispatch: AppDispatchType = useDispatch()
  const [getQueryData, { error, loading }] = useLazyQuery(
    graphQlQueryFromMap(dbName, getQueryArgs()),
    { notifyOnNetworkStatusChange: true, fetchPolicy: 'network-only' }
  )

  useEffect(() => {
    if (isExecQueryOnLoad) {
      loadData()
    }
    return () => {
      // Cleanup data. Otherwise syncfusion grid loads the old data
      dispatch(resetQueryHelperData({ instance: instance }))
    }
  }, [])

  if (error) {
    Utils.showErrorMessage(error)
  }

  async function loadData () {
    const queryName = graphQlQueryName
    const result: any = await getQueryData({ fetchPolicy: 'no-cache' })
    if (result?.data?.[queryName]?.error?.content) {
      Utils.showGraphQlErrorMessage(result.data[queryName].error.content)
    }
    const data = _.isEmpty(result?.data?.[queryName])
      ? []
      : result.data[queryName]
    if (addUniqueKeyToJson) { // Creates persistence of expanded rows by adding unique pkey to each record
      if (data?.[0]?.jsonResult) {
        if (dataPath) {
          Utils.addUniqueKeysToJson(data[0].jsonResult[dataPath])
        } else {
          Utils.addUniqueKeysToJson(data[0].jsonResult)
        }
      }
    }
    dispatch(
      setQueryHelperData({
        data: data,
        instance: instance
      })
    )
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
