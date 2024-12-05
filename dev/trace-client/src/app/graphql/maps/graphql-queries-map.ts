import { gql } from '@apollo/client'
import _ from 'lodash'
import { TraceDataObjectType } from '../../../utils/global-types-interfaces-enums'
import { GLOBAL_SECURITY_DATABASE_NAME } from '../../global-constants'
import { DocumentNode } from 'graphql'

export const GraphQLQueriesMap: GraphQLQueriesMapType = {
  balanceSheetProfitLoss: balanceSheetProfitLoss,
  changePwd: changePwd,
  changeUid: changeUid,
  createBu: createBu,
  decodeExtDbParams: decodeExtDbParams,
  genericQuery: genericQuery,
  genericUpdate: genericUpdate,
  importSecuredControls: importSecuredControls,
  trialBalance: trialBalance,
  updateClient: updateClient,
  updateUser: updateUser,
  hello: hello
}

function balanceSheetProfitLoss (
  dbName: string,
  val: GraphQLQueryArgsType
): DocumentNode {
  const value = encodeObj(val)
  return gql`
        query BalanceSheetProfitLoss {
          balanceSheetProfitLoss(dbName:"${dbName}", value:"${value}")
        }
    `
}

function changePwd (val: ChangePwdType): DocumentNode {
  const value = encodeObj(val)
  return gql`
        mutation ${GLOBAL_SECURITY_DATABASE_NAME} {
            changePwd(value:"${value}")
        }
    `
}

function changeUid (val: ChangeUidType): DocumentNode {
  const value = encodeObj(val)
  return gql`
        mutation ${GLOBAL_SECURITY_DATABASE_NAME} {
            changeUid(value:"${value}")
        }
    `
}

function createBu (dbName: string, val: TraceDataObjectType): DocumentNode {
  const value = encodeObj(val)
  return gql`
        mutation ${dbName} { 
            createBu(value:"${value}")
        }
    `
}

function decodeExtDbParams (val: string): DocumentNode {
  // does not hit database
  const q = gql`
    query  {
      decodeExtDbParams(value: "${val}")
    }`
  return q
}

function genericQuery (dbName: string, val: GraphQLQueryArgsType): DocumentNode {
  const value = encodeObj(val)
  return gql`
        query GenericQuery {
            genericQuery(dbName:"${dbName}", value:"${value}")
        }
    `
}

function genericUpdate (
  dbName: string,
  val: GraphQLUpdateArgsType
): DocumentNode {
  const value = encodeObj(val) // dbName below is transferred as operationName
  return gql`
        mutation GenericUpdate { 
            genericUpdate(dbName:"${dbName}", value:"${value}")
        }
    `
}

function importSecuredControls (
  dbName: string,
  val: GraphQLUpdateArgsType
): DocumentNode {
  const value = encodeObj(val)
  return gql`
        mutation ${dbName} { 
            importSecuredControls(value:"${value}")
        }
    `
}

function trialBalance (dbName: string, val: GraphQLQueryArgsType): DocumentNode {
  const value = encodeObj(val)
  return gql`
        query TrialBalance {
            trialBalance(dbName:"${dbName}", value:"${value}")
        }
    `
}

function updateClient (dbName: string, val: TraceDataObjectType): DocumentNode {
  const value = encodeObj(val)
  return gql`
        mutation ${dbName} {
            updateClient(value:"${value}")
        }
    `
}

function updateUser (dbName: string, val: TraceDataObjectType): DocumentNode {
  const value = encodeObj(val)
  return gql`
        mutation ${dbName} {
            updateUser(value:"${value}")
        }
    `
}

function hello (): DocumentNode {
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

export type ChangePwdType = {
  currentPwd: string
  pwd: string
  id: string | number | undefined
}

export type ChangeUidType = {
  currentUid: string
  uid: string
  id: string | number | undefined // id of userM
}

export type GraphQLQueryArgsType = {
  buCode?: string
  dbParams?: { [key: string]: any }
  [key: string]: any
  sqlId?: string
  sqlArgs?: { [key: string]: any }
}

export type GraphQLUpdateArgsType = {
  dbParams?: { [key: string]: any }
  [key: string]: any
  tableName?: string
  deletedIds?: [string]
}

export type GraphQLQueriesMapType = {
  balanceSheetProfitLoss: (
    dbName: string,
    val: GraphQLQueryArgsType
  ) => DocumentNode
  changePwd: (val: ChangePwdType) => DocumentNode
  changeUid: (val: ChangeUidType) => DocumentNode
  createBu: (dbName: string, val: TraceDataObjectType) => DocumentNode
  decodeExtDbParams: (val: string) => DocumentNode
  genericQuery: (dbName: string, val: GraphQLQueryArgsType) => DocumentNode
  genericUpdate: (dbName: string, val: GraphQLUpdateArgsType) => DocumentNode
  importSecuredControls: (
    dbName: string,
    val: GraphQLUpdateArgsType
  ) => DocumentNode
  trialBalance: (dbName: string, val: GraphQLQueryArgsType) => DocumentNode
  updateClient: (dbName: string, val: TraceDataObjectType) => DocumentNode
  updateUser: (dbName: string, val: TraceDataObjectType) => DocumentNode
  hello: () => DocumentNode
}
