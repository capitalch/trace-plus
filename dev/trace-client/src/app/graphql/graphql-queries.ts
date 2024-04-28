import { gql } from '@apollo/client'
import _ from 'lodash'

export const GraphQLQueries = {
  genericQuery: genericQuery
}

function genericQuery (dbName: string, val: any) {
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

export type GraphQLQueryType = {
  sqlId: string
  [key: string]: any
}
