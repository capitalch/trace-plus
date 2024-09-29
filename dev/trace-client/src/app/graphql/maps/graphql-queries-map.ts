import { gql } from '@apollo/client'
import _ from 'lodash'
import { TraceDataObjectType } from '../../../utils/global-types-interfaces-enums'

export const GraphQLQueriesMap = {
  genericQuery: genericQuery,
  updateClient: updateClient
}

function genericQuery (dbName: string, val: GraphQLQueryArgsType) {
  const value = encodeObj(val)
  return gql`
        query ${dbName} {
            genericQuery(value:"${value}")
        }
    `
}

function updateClient (dbName: string, val: TraceDataObjectType) {
  const value = encodeObj(val)
  return gql`
        mutation ${dbName} {
            updateClient(value:"${value}")
        }
    `
}

function encodeObj (obj: any) {
  let ret = ''
  if (!_.isEmpty(obj)) {
    ret = encodeURI(JSON.stringify(obj))
  }
  return ret
}

export type GraphQLQueryArgsType = {
  dbParams?: { [key: string]: string | number }
  [key: string]: any
  sqlId: string
  sqlArgs?: { [key: string]: string | number }
}
