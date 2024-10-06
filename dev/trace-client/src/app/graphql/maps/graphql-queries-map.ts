import { gql } from '@apollo/client'
import _ from 'lodash'
import { TraceDataObjectType } from '../../../utils/global-types-interfaces-enums'

export const GraphQLQueriesMap = {
  decodeExtDbParams: decodeExtDbParams,
  genericQuery: genericQuery,
  updateClient: updateClient,
  hello: hello
}

function decodeExtDbParams (val: string) {
  // does not hit database
  const q = gql`
    query  {
      decodeExtDbParams(value: "${val}")
    }`
  return q
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

function hello () {
  return gql`
    query hello
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
