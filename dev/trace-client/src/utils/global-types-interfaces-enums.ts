export enum UserTypesEnum {
  SuperAdmin = "S",
  Admin = "A",
  BusinessUser = "B",
}

export type TraceDataObjectType = {
  tableName?: string;
  fkeyName?: string;
  deletedIds?: [string];
  xData?: XDataObjectType[] | XDataObjectType;
};

export type XDataObjectType = {
  id?: number | string;
  isIdInsert?: boolean;
  [key: string]: string | number | boolean | any;
  details?: TraceDataObjectType[] | TraceDataObjectType;
};

export type VourcherType = 'Contra' | 'Journal' | 'Payment' | 'Receipt'
export const voucherTypes = ["Payment", "Receipt", "Contra", "Journal"];
export type TranType = 'Journal' | 'Payment' | 'Receipt' | 'Sales' | 'Purchase' | 'Contra' | 'DebitNote' | 'CreditNote' | 'SaleReturn' | 'PurchaseReturn' | 'StockJournal' | 'StockTransfer';
export const TranTypeMap: { [key: string]: number } = {
  Journal: 1,
  Payment: 2,
  Receipt: 3,
  Sales: 4,
  Purchase: 5,
  Contra: 6,
  DebitNote: 7,
  CreditNote: 8,
  SaleReturn: 9,
  PurchaseReturn: 10,
  StockJournal: 11,
  StockTransfer: 12
}
export const TranTypeReverseMap: { [key: number]: TranType } = {
  1: 'Journal',
  2: 'Payment',
  3: 'Receipt',
  4: 'Sales',
  5: 'Purchase',
  6: 'Contra',
  7: 'DebitNote',
  8: 'CreditNote',
  9: 'SaleReturn',
  10: 'PurchaseReturn',
  11: 'StockJournal',
  12: 'StockTransfer'
}

export type TranHeaderType = {
  autoRefNo: string | null;
  branchId: number;
  finYearId: number;
  id?: number;
  posId?: number;
  remarks: string | null;
  tranDate: string;
  tranTypeId: number;
  userRefNo: string | null;
  [key: string]: any;
};