export enum UserTypesEnum {
  SuperAdmin = "S",
  Admin = "A",
  BusinessUser = "B",
}

export type TraceDataObjectType = {
  tableName?: string;
  fkeyName?: string;
  deletedIds?: string[] | number[];
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

// Table schemas
export type TranHType = {
  id?: number;
  tranDate: string;
  userRefNo?: string | null;
  remarks?: string | null;
  tags?: string | null;
  jData?: { [key: string]: string | null } | null;
  tranTypeId: number;
  finYearId: number;
  branchId: number;
  posId?: number | null;
  autoRefNo: string;
  timestamp?: string;
  contactsId?: number | null;
  checked?: boolean | null;
}

export type TranDType = {
  id?: number;
  accId: number;
  remarks?: string | null;
  dc: string;
  amount: number;
  tranHeaderId: number;
  lineRefNo?: string | null;
  instrNo?: string | null;
}

export type ExtGstTranDType = {
  id?: number;
  gstin?: string | null;
  rate?: number | null;
  cgst: number;
  sgst: number;
  igst: number;
  isInput?: boolean;
  tranDetailsId: number;
  hsn?: string | null;
}

export type SalePurchaseEditDataType = {
  tranH: TranHType;
  tranD: TranDType[];
  extGstTranD: ExtGstTranDType;
  salePurchaseDetails: SalePurchaseDetailsWithExtraType[];
  billTo: ContactsType | null;
  businessContacts: ExtBusinessContactsAccMType;
}

export type SalePurchaseDetailsType = {
  id: number;
    tranDetailsId: number;
    productId: number;
    qty?: number;
    price?: number;
    priceGst?: number;
    discount?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    amount?: number;
    jData?: { [key: string]: string | null } | null;
    hsn: number;
    gstRate?: number;
}

type SalePurchaseDetailsExtraType = {
  productCode?: string;
  upcCode?: string;
  label?: string;
  info?: string;
  remarks?: string;
  serialNumbers?: string;
  brandName?: string;
  catName?: string;
}

export type SalePurchaseDetailsWithExtraType = SalePurchaseDetailsType & SalePurchaseDetailsExtraType

export type ContactsType = {
  id?: number;
    contactName: string;
    mobileNumber?: string | null;
    otherMobileNumber?: string | null;
    landPhone?: string | null;
    email?: string | null;
    descr?: string | null;
    jData?: { [key: string]: string | null } | null;
    anniversaryDate?: string | null;
    address1: string;
    address2?: string | null;
    country: string;
    state?: string | null;
    city?: string | null;
    gstin?: string | null;
    pin: string;
    dateOfBirth?: string | null;
    stateCode?: number | null;
}

export type ExtBusinessContactsAccMType = {
  id?: number;
    contactName: string;
    contactCode: string;
    mobileNumber?: string | null;
    otherMobileNumber?: string | null;
    landPhone?: string | null;
    email?: string | null;
    otherEmail?: string | null;
    jAddress: { [key: string]: string | null } | null;
    descr?: string | null;
    accId?: number | null;
    jData?: { [key: string]: string | null } | null;
    gstin?: string | null;
    timestamp?: string | null;
    stateCode?: number | null;
}

