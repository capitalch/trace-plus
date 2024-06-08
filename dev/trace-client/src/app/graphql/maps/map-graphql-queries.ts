import { gql } from '@apollo/client'
import _ from 'lodash'

export const MapGraphQLQueries = {
  genericQuery: genericQuery
}

function genericQuery (dbName: string, val: GraphQLQueryArgsType) {
  const value = encodeObj(val)
  return gql`
        query ${dbName} {
            genericQuery(value:"${value}")
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
  dbParams?: string
  [key: string]: any
  sqlId: string
  sqlArgs?: { [key: string]: string | number }
}
