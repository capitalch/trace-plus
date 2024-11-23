import { useLazyQuery } from '@apollo/client'
import {
  GraphQLQueriesMap,
  GraphQLQueryArgsType
} from './maps/graphql-queries-map'
import _ from 'lodash'
import { GLOBAL_SECURITY_DATABASE_NAME } from '../global-constants'
import { useEffect } from 'react'
import { Utils } from '../../utils/utils'
import { AppDispatchType } from '../store/store'
import { useDispatch } from 'react-redux'
import { resetQueryHelperData, setQueryHelperData } from './query-helper-slice'
// import { UserDetailsType } from '../../features/login/login-slice'

export function useQueryHelper({
  addUniqueKeyToJson = false,
  dbName = GLOBAL_SECURITY_DATABASE_NAME,
  getQueryArgs,
  instance,
  isExecQueryOnLoad = true
}: QueryHelperType) {
  const dispatch: AppDispatchType = useDispatch()
  // const userDetails: UserDetailsType | undefined = Utils.getCurrentLoginInfo().userDetails
  // const { dbName, dbParams, decodedDbParamsObject }: any = userDetails

  // console.log(dbName, dbParams, decodedDbParamsObject)
  const [getGenericQueryData, { error, loading }] = useLazyQuery(
    GraphQLQueriesMap.genericQuery(dbName, getQueryArgs()),
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

  async function loadData() {
    const result: any = await getGenericQueryData({ fetchPolicy: 'no-cache' })
    if (result?.data?.genericQuery?.error?.content) {
      Utils.showGraphQlErrorMessage(result.data.genericQuery.error.content)
    }
    const data = _.isEmpty(result?.data?.genericQuery) ? [] : result.data.genericQuery
    // console.log(JSON.stringify(data))
    if (addUniqueKeyToJson) {
      if (data?.[0]?.jsonResult) {
        data[0].jsonResult = Utils.addUniqueKeysToJson(data[0].jsonResult)
      }
      // data = Utils.addUniqueKeysToJson(data)
    }
    dispatch(
      setQueryHelperData({
        data: data, //_.isEmpty(result?.data?.genericQuery) ? [] : result.data.genericQuery,
        instance: instance
      })
    )
  }

  return { loadData, loading }
}

type QueryHelperType = {
  addUniqueKeyToJson?: boolean
  dbName?: string
  // dbParams?:{[key:string]: string}
  getQueryArgs: () => GraphQLQueryArgsType
  instance: string
  isExecQueryOnLoad?: boolean
}
