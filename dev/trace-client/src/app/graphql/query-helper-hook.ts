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

export function useQueryHelper ({
  databaseName = GLOBAL_SECURITY_DATABASE_NAME,
  getQueryArgs,
  instance,
  isExecQueryOnLoad = true
}: QueryHelperType) {
  const dispatch: AppDispatchType = useDispatch()

  const [getGenericQueryData, { error, loading }] = useLazyQuery(
    GraphQLQueriesMap.genericQuery(databaseName, getQueryArgs()),
    { notifyOnNetworkStatusChange: true, fetchPolicy: 'network-only' }
  )

  useEffect(() => {
    if (isExecQueryOnLoad) {
      loadData()
    }
    return () => {
      // Cleanup data. Otherwise syncfusion grid loads the old data
      console.log('Cleanup')
      dispatch(resetQueryHelperData({ instance: instance}))
    }
  }, [])

  if (error) {
    Utils.showErrorMessage(error)
  }

  async function loadData () {
    const result: any = await getGenericQueryData({ fetchPolicy: 'no-cache' })
    if (result?.data?.genericQuery?.error?.content) {
      Utils.showGraphQlErrorMessage(result.data.genericQuery.error.content)
    }
    // const dta = result?.data?.genericQuery ? result.data.genericQuery : []
    dispatch(
      setQueryHelperData({
        data: _.isEmpty(result?.data?.genericQuery) ? [] : result.data.genericQuery,
        instance: instance
      })
    )
  }

  return { loadData, loading }
}

type QueryHelperType = {
  databaseName?: string
  getQueryArgs: () => GraphQLQueryArgsType
  instance: string
  isExecQueryOnLoad?: boolean
}
