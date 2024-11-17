import { gql } from '@apollo/client'
import _ from 'lodash'
import { TraceDataObjectType } from '../../../utils/global-types-interfaces-enums'
import { GLOBAL_SECURITY_DATABASE_NAME } from '../../global-constants'

export const GraphQLQueriesMap = {
  changePwd: changePwd,
  changeUid: changeUid,
  createBu: createBu,
  decodeExtDbParams: decodeExtDbParams,
  genericQuery: genericQuery,
  genericUpdate: genericUpdate,
  importSecuredControls: importSecuredControls,
  updateClient: updateClient,
  updateUser: updateUser,
  hello: hello
}

function changePwd(val: ChangePwdType) {
  const value = encodeObj(val)
  return gql`
        mutation ${GLOBAL_SECURITY_DATABASE_NAME} {
            changePwd(value:"${value}")
        }
    `
}

function changeUid(val: ChangeUidType) {
  const value = encodeObj(val)
  return gql`
        mutation ${GLOBAL_SECURITY_DATABASE_NAME} {
            changeUid(value:"${value}")
        }
    `
}

function createBu(dbName: string, val: TraceDataObjectType) {
  const value = encodeObj(val)
  return gql`
        mutation ${dbName} { 
            createBu(value:"${value}")
        }
    `
}

function decodeExtDbParams(val: string) {
  // does not hit database
  const q = gql`
    query  {
      decodeExtDbParams(value: "${val}")
    }`
  return q
}

// function genericQuery1(dbName: string, val: GraphQLQueryArgsType) {
//   const value = encodeObj(val)
//   return gql`
//         query ${dbName} {
//             genericQuery(value:"${value}")
//         }
//     `
// }

function genericQuery(dbName: string, val: GraphQLQueryArgsType) {
  const value = encodeObj(val)
  return gql`
        query GenericQuery {
            genericQuery(dbName:"${dbName}", value:"${value}")
        }
    `
}

function genericUpdate(dbName: string, val: GraphQLUpdateArgsType) {
  const value = encodeObj(val) // dbName below is transferred as operationName
  return gql`
        mutation ${dbName} { 
            genericUpdate(value:"${value}")
        }
    `
}

function importSecuredControls(dbName: string, val: GraphQLUpdateArgsType) {
  const value = encodeObj(val)
  return gql`
        mutation ${dbName} { 
            importSecuredControls(value:"${value}")
        }
    `
}

function updateClient(dbName: string, val: TraceDataObjectType) {
  const value = encodeObj(val)
  return gql`
        mutation ${dbName} {
            updateClient(value:"${value}")
        }
    `
}

function updateUser(dbName: string, val: TraceDataObjectType) {
  const value = encodeObj(val)
  return gql`
        mutation ${dbName} {
            updateUser(value:"${value}")
        }
    `
}

function hello() {
  return gql`
    query hello
  `
}

function encodeObj(obj: any) {
  let ret = ''
  if (!_.isEmpty(obj)) {
    ret = encodeURI(JSON.stringify(obj))
  }
  return ret
}

export type ChangePwdType = {
  currentPwd: string
  pwd: string
  id: string | number |undefined
}

export type ChangeUidType = {
  currentUid: string
  uid: string
  id: string | number | undefined // id of userM
}

export type GraphQLQueryArgsType = {
  buCode?: string
  dbParams?: { [key: string]: string | number }
  [key: string]: any
  sqlId: string
  sqlArgs?: { [key: string]: any }
}

export type GraphQLUpdateArgsType = {
  dbParams?: { [key: string]: any }
  [key: string]: any
  tableName?: string
  deletedIds?: [string]
}
