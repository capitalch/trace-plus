export enum UserTypesEnum {
  SuperAdmin = 'S',
  Admin = 'A',
  BusinessUser = 'B'
}

export type TraceDataObjectType = {
  tableName?: string
  fkeyName?: string
  xData: XDataObjectType[] | XDataObjectType
}

type XDataObjectType = {
  [key: string]: string | number | boolean | any
  details?: TraceDataObjectType[]
}
