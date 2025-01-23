export enum UserTypesEnum {
  SuperAdmin = 'S',
  Admin = 'A',
  BusinessUser = 'B'
}

export type TraceDataObjectType = {
  tableName?: string
  fkeyName?: string
  deletedIds?: [string]
  xData?: XDataObjectType[] | XDataObjectType
}

export type XDataObjectType = {
  id?: number
  isIdInsert?: boolean
  [key: string]: string | number | boolean | any
  details?: TraceDataObjectType[]
}
