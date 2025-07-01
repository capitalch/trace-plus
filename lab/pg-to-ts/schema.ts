/* tslint:disable */
/* eslint-disable */


export type Json = unknown;

// Table AccClassM
export interface AccClassM {
  id: number;
  accClass: string;
}
export interface AccClassMInput {
  id: number;
  accClass: string;
}
const AccClassM = {
  tableName: 'AccClassM',
  columns: ['id', 'accClass'],
  requiredForInsert: ['id', 'accClass'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as AccClassM,
  $input: null as unknown as AccClassMInput
} as const;

// Table AccM
export interface AccM {
  id: number;
  accCode: string;
  accName: string;
  accType: string;
  parentId: number | null;
  accLeaf: string;
  isPrimary: boolean;
  classId: number;
  timestamp: string | null;
}
export interface AccMInput {
  id?: number;
  accCode: string;
  accName: string;
  accType: string;
  parentId?: number | null;
  accLeaf?: string;
  isPrimary?: boolean;
  classId: number;
  timestamp?: string | null;
}
const AccM = {
  tableName: 'AccM',
  columns: ['id', 'accCode', 'accName', 'accType', 'parentId', 'accLeaf', 'isPrimary', 'classId', 'timestamp'],
  requiredForInsert: ['accCode', 'accName', 'accType', 'classId'],
  primaryKey: 'id',
  foreignKeys: { parentId: { table: 'AccM', column: 'id', $type: null as unknown as AccM }, },
  $type: null as unknown as AccM,
  $input: null as unknown as AccMInput
} as const;

// Table AccOpBal
export interface AccOpBal {
  id: number;
  accId: number;
  finYearId: number;
  amount: number;
  dc: string;
  timestamp: string;
  branchId: number;
}
export interface AccOpBalInput {
  id?: number;
  accId: number;
  finYearId: number;
  amount: number;
  dc: string;
  timestamp?: string;
  branchId: number;
}
const AccOpBal = {
  tableName: 'AccOpBal',
  columns: ['id', 'accId', 'finYearId', 'amount', 'dc', 'timestamp', 'branchId'],
  requiredForInsert: ['accId', 'finYearId', 'amount', 'dc', 'branchId'],
  primaryKey: 'id',
  foreignKeys: {
    accId: { table: 'AccM', column: 'id', $type: null as unknown as AccM },
    finYearId: { table: 'FinYearM', column: 'id', $type: null as unknown as FinYearM },
    branchId: { table: 'BranchM', column: 'id', $type: null as unknown as BranchM },
  },
  $type: null as unknown as AccOpBal,
  $input: null as unknown as AccOpBalInput
} as const;

// Table audit_table
export interface AuditTable {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  old_data: Json | null;
  new_data: Json | null;
  table_name: string | null;
  altered_columns: Json | null;
  table_id: number | null;
}
export interface AuditTableInput {
  id?: number;
  user: string;
  action: string;
  timestamp?: string;
  old_data?: Json | null;
  new_data?: Json | null;
  table_name?: string | null;
  altered_columns?: Json | null;
  table_id?: number | null;
}
const audit_table = {
  tableName: 'audit_table',
  columns: ['id', 'user', 'action', 'timestamp', 'old_data', 'new_data', 'table_name', 'altered_columns', 'table_id'],
  requiredForInsert: ['user', 'action'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as AuditTable,
  $input: null as unknown as AuditTableInput
} as const;

// Table AutoSubledgerCounter
export interface AutoSubledgerCounter {
  id: number;
  finYearId: number;
  branchId: number;
  accId: number;
  lastNo: number;
}
export interface AutoSubledgerCounterInput {
  id: number;
  finYearId: number;
  branchId: number;
  accId: number;
  lastNo: number;
}
const AutoSubledgerCounter = {
  tableName: 'AutoSubledgerCounter',
  columns: ['id', 'finYearId', 'branchId', 'accId', 'lastNo'],
  requiredForInsert: ['id', 'finYearId', 'branchId', 'accId', 'lastNo'],
  primaryKey: 'id',
  foreignKeys: {
    finYearId: { table: 'FinYearM', column: 'id', $type: null as unknown as FinYearM },
    branchId: { table: 'BranchM', column: 'id', $type: null as unknown as BranchM },
    accId: { table: 'AccM', column: 'id', $type: null as unknown as AccM },
  },
  $type: null as unknown as AutoSubledgerCounter,
  $input: null as unknown as AutoSubledgerCounterInput
} as const;

// Table BankOpBal
export interface BankOpBal {
  id: number;
  accId: number;
  amount: number;
  dc: string;
  finYearId: number;
  timestamp: string | null;
}
export interface BankOpBalInput {
  id?: number;
  accId: number;
  amount?: number;
  dc: string;
  finYearId: number;
  timestamp?: string | null;
}
const BankOpBal = {
  tableName: 'BankOpBal',
  columns: ['id', 'accId', 'amount', 'dc', 'finYearId', 'timestamp'],
  requiredForInsert: ['accId', 'dc', 'finYearId'],
  primaryKey: 'id',
  foreignKeys: {
    accId: { table: 'AccM', column: 'id', $type: null as unknown as AccM },
    finYearId: { table: 'FinYearM', column: 'id', $type: null as unknown as FinYearM },
  },
  $type: null as unknown as BankOpBal,
  $input: null as unknown as BankOpBalInput
} as const;

// Table BranchM
export interface BranchM {
  id: number;
  branchName: string;
  remarks: string | null;
  jData: Json | null;
  branchCode: string;
  timestamp: string | null;
}
export interface BranchMInput {
  id?: number;
  branchName: string;
  remarks?: string | null;
  jData?: Json | null;
  branchCode: string;
  timestamp?: string | null;
}
const BranchM = {
  tableName: 'BranchM',
  columns: ['id', 'branchName', 'remarks', 'jData', 'branchCode', 'timestamp'],
  requiredForInsert: ['branchName', 'branchCode'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as BranchM,
  $input: null as unknown as BranchMInput
} as const;

// Table BranchTransfer
export interface BranchTransfer {
  id: number;
  tranHeaderId: number;
  productId: number;
  qty: number;
  lineRemarks: string | null;
  lineRefNo: string | null;
  jData: Json | null;
  price: number;
  destBranchId: number;
  timestamp: string;
}
export interface BranchTransferInput {
  id: number;
  tranHeaderId: number;
  productId: number;
  qty?: number;
  lineRemarks?: string | null;
  lineRefNo?: string | null;
  jData?: Json | null;
  price?: number;
  destBranchId: number;
  timestamp?: string;
}
const BranchTransfer = {
  tableName: 'BranchTransfer',
  columns: ['id', 'tranHeaderId', 'productId', 'qty', 'lineRemarks', 'lineRefNo', 'jData', 'price', 'destBranchId', 'timestamp'],
  requiredForInsert: ['id', 'tranHeaderId', 'productId', 'destBranchId'],
  primaryKey: 'id',
  foreignKeys: {
    tranHeaderId: { table: 'TranH', column: 'id', $type: null as unknown as TranH },
    productId: { table: 'ProductM', column: 'id', $type: null as unknown as ProductM },
    destBranchId: { table: 'BranchM', column: 'id', $type: null as unknown as BranchM },
  },
  $type: null as unknown as BranchTransfer,
  $input: null as unknown as BranchTransferInput
} as const;

// Table BrandM
export interface BrandM {
  id: number;
  brandName: string;
  remarks: string | null;
  jData: Json | null;
  timestamp: string | null;
}
export interface BrandMInput {
  id?: number;
  brandName: string;
  remarks?: string | null;
  jData?: Json | null;
  timestamp?: string | null;
}
const BrandM = {
  tableName: 'BrandM',
  columns: ['id', 'brandName', 'remarks', 'jData', 'timestamp'],
  requiredForInsert: ['brandName'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as BrandM,
  $input: null as unknown as BrandMInput
} as const;

// Table CategoryM
export interface CategoryM {
  id: number;
  catName: string;
  parentId: number | null;
  isLeaf: boolean;
  descr: string | null;
  timestamp: string | null;
  hsn: number | null;
  tagId: number | null;
}
export interface CategoryMInput {
  id?: number;
  catName: string;
  parentId?: number | null;
  isLeaf?: boolean;
  descr?: string | null;
  timestamp?: string | null;
  hsn?: number | null;
  tagId?: number | null;
}
const CategoryM = {
  tableName: 'CategoryM',
  columns: ['id', 'catName', 'parentId', 'isLeaf', 'descr', 'timestamp', 'hsn', 'tagId'],
  requiredForInsert: ['catName'],
  primaryKey: 'id',
  foreignKeys: { parentId: { table: 'CategoryM', column: 'id', $type: null as unknown as CategoryM }, },
  $type: null as unknown as CategoryM,
  $input: null as unknown as CategoryMInput
} as const;

// Table Contacts
export interface Contacts {
  id: number;
  contactName: string;
  mobileNumber: string | null;
  otherMobileNumber: string | null;
  landPhone: string | null;
  email: string | null;
  descr: string | null;
  jData: Json | null;
  anniversaryDate: string | null;
  address1: string;
  address2: string | null;
  country: string;
  state: string | null;
  city: string | null;
  gstin: string | null;
  pin: string;
  dateOfBirth: string | null;
  stateCode: number | null;
  timestamp: string | null;
}
export interface ContactsInput {
  id?: number;
  contactName: string;
  mobileNumber?: string | null;
  otherMobileNumber?: string | null;
  landPhone?: string | null;
  email?: string | null;
  descr?: string | null;
  jData?: Json | null;
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
  timestamp?: string | null;
}
const Contacts = {
  tableName: 'Contacts',
  columns: ['id', 'contactName', 'mobileNumber', 'otherMobileNumber', 'landPhone', 'email', 'descr', 'jData', 'anniversaryDate', 'address1', 'address2', 'country', 'state', 'city', 'gstin', 'pin', 'dateOfBirth', 'stateCode', 'timestamp'],
  requiredForInsert: ['contactName', 'address1', 'country', 'pin'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as Contacts,
  $input: null as unknown as ContactsInput
} as const;

// Table Employees
export interface Employees {
  ID: number;
  Name: string;
  Title: string | null;
  ManagerID: number | null;
}
export interface EmployeesInput {
  ID?: number;
  Name: string;
  Title?: string | null;
  ManagerID?: number | null;
}
const Employees = {
  tableName: 'Employees',
  columns: ['ID', 'Name', 'Title', 'ManagerID'],
  requiredForInsert: ['Name'],
  primaryKey: 'ID',
  foreignKeys: { ManagerID: { table: 'Employees', column: 'ID', $type: null as unknown as Employees }, },
  $type: null as unknown as Employees,
  $input: null as unknown as EmployeesInput
} as const;

// Table ExtBankReconTranD
export interface ExtBankReconTranD {
  id: number;
  clearDate: string | null;
  clearRemarks: string | null;
  tranDetailsId: number;
  timestamp: string | null;
}
export interface ExtBankReconTranDInput {
  id?: number;
  clearDate?: string | null;
  clearRemarks?: string | null;
  tranDetailsId: number;
  timestamp?: string | null;
}
const ExtBankReconTranD = {
  tableName: 'ExtBankReconTranD',
  columns: ['id', 'clearDate', 'clearRemarks', 'tranDetailsId', 'timestamp'],
  requiredForInsert: ['tranDetailsId'],
  primaryKey: 'id',
  foreignKeys: { tranDetailsId: { table: 'TranD', column: 'id', $type: null as unknown as TranD }, },
  $type: null as unknown as ExtBankReconTranD,
  $input: null as unknown as ExtBankReconTranDInput
} as const;

// Table ExtBusinessContactsAccM
export interface ExtBusinessContactsAccM {
  id: number;
  contactName: string;
  contactCode: string;
  mobileNumber: string | null;
  otherMobileNumber: string | null;
  landPhone: string | null;
  email: string | null;
  otherEmail: string | null;
  jAddress: Json;
  descr: string | null;
  accId: number | null;
  jData: Json | null;
  gstin: string | null;
  timestamp: string | null;
  stateCode: number | null;
}
export interface ExtBusinessContactsAccMInput {
  id?: number;
  contactName: string;
  contactCode: string;
  mobileNumber?: string | null;
  otherMobileNumber?: string | null;
  landPhone?: string | null;
  email?: string | null;
  otherEmail?: string | null;
  jAddress: Json;
  descr?: string | null;
  accId?: number | null;
  jData?: Json | null;
  gstin?: string | null;
  timestamp?: string | null;
  stateCode?: number | null;
}
const ExtBusinessContactsAccM = {
  tableName: 'ExtBusinessContactsAccM',
  columns: ['id', 'contactName', 'contactCode', 'mobileNumber', 'otherMobileNumber', 'landPhone', 'email', 'otherEmail', 'jAddress', 'descr', 'accId', 'jData', 'gstin', 'timestamp', 'stateCode'],
  requiredForInsert: ['contactName', 'contactCode', 'jAddress'],
  primaryKey: 'id',
  foreignKeys: { accId: { table: 'AccM', column: 'id', $type: null as unknown as AccM }, },
  $type: null as unknown as ExtBusinessContactsAccM,
  $input: null as unknown as ExtBusinessContactsAccMInput
} as const;

// Table ExtGstTranD
export interface ExtGstTranD {
  id: number;
  gstin: string | null;
  rate: number | null;
  cgst: number;
  sgst: number;
  igst: number;
  isInput: boolean;
  tranDetailsId: number;
  hsn: string | null;
  timestamp: string | null;
}
export interface ExtGstTranDInput {
  id?: number;
  gstin?: string | null;
  rate?: number | null;
  cgst: number;
  sgst: number;
  igst: number;
  isInput?: boolean;
  tranDetailsId: number;
  hsn?: string | null;
  timestamp?: string | null;
}
const ExtGstTranD = {
  tableName: 'ExtGstTranD',
  columns: ['id', 'gstin', 'rate', 'cgst', 'sgst', 'igst', 'isInput', 'tranDetailsId', 'hsn', 'timestamp'],
  requiredForInsert: ['cgst', 'sgst', 'igst', 'tranDetailsId'],
  primaryKey: 'id',
  foreignKeys: { tranDetailsId: { table: 'TranD', column: 'id', $type: null as unknown as TranD }, },
  $type: null as unknown as ExtGstTranD,
  $input: null as unknown as ExtGstTranDInput
} as const;

// Table ExtMiscAccM
export interface ExtMiscAccM {
  id: number;
  accId: number;
  isAutoSubledger: boolean;
}
export interface ExtMiscAccMInput {
  id: number;
  accId: number;
  isAutoSubledger?: boolean;
}
const ExtMiscAccM = {
  tableName: 'ExtMiscAccM',
  columns: ['id', 'accId', 'isAutoSubledger'],
  requiredForInsert: ['id', 'accId'],
  primaryKey: 'id',
  foreignKeys: { accId: { table: 'AccM', column: 'id', $type: null as unknown as AccM }, },
  $type: null as unknown as ExtMiscAccM,
  $input: null as unknown as ExtMiscAccMInput
} as const;

// Table FinYearM
export interface FinYearM {
  startDate: string;
  endDate: string | null;
  id: number;
}
export interface FinYearMInput {
  startDate: string;
  endDate?: string | null;
  id: number;
}
const FinYearM = {
  tableName: 'FinYearM',
  columns: ['startDate', 'endDate', 'id'],
  requiredForInsert: ['startDate', 'id'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as FinYearM,
  $input: null as unknown as FinYearMInput
} as const;

// Table GodownM
export interface GodownM {
  id: number;
  godCode: string;
  remarks: string | null;
  jData: Json | null;
  timestamp: string | null;
}
export interface GodownMInput {
  id?: number;
  godCode: string;
  remarks?: string | null;
  jData?: Json | null;
  timestamp?: string | null;
}
const GodownM = {
  tableName: 'GodownM',
  columns: ['id', 'godCode', 'remarks', 'jData', 'timestamp'],
  requiredForInsert: ['godCode'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as GodownM,
  $input: null as unknown as GodownMInput
} as const;

// Table Notes
export interface Notes {
  id: number;
  remarks: string;
  jData: Json | null;
  notesDate: string;
  branchId: number;
}
export interface NotesInput {
  id: number;
  remarks: string;
  jData?: Json | null;
  notesDate: string;
  branchId: number;
}
const Notes = {
  tableName: 'Notes',
  columns: ['id', 'remarks', 'jData', 'notesDate', 'branchId'],
  requiredForInsert: ['id', 'remarks', 'notesDate', 'branchId'],
  primaryKey: 'id',
  foreignKeys: { branchId: { table: 'BranchM', column: 'id', $type: null as unknown as BranchM }, },
  $type: null as unknown as Notes,
  $input: null as unknown as NotesInput
} as const;

// Table PosM
export interface PosM {
  id: number;
  posName: string;
  prefix: string | null;
  jData: Json | null;
  branchId: number | null;
}
export interface PosMInput {
  id?: number;
  posName: string;
  prefix?: string | null;
  jData?: Json | null;
  branchId?: number | null;
}
const PosM = {
  tableName: 'PosM',
  columns: ['id', 'posName', 'prefix', 'jData', 'branchId'],
  requiredForInsert: ['posName'],
  primaryKey: 'id',
  foreignKeys: { branchId: { table: 'BranchM', column: 'id', $type: null as unknown as BranchM }, },
  $type: null as unknown as PosM,
  $input: null as unknown as PosMInput
} as const;

// Table ProductM
export interface ProductM {
  id: number;
  catId: number;
  hsn: number | null;
  brandId: number;
  info: string | null;
  unitId: number;
  label: string;
  jData: Json | null;
  productCode: string;
  upcCode: string | null;
  gstRate: number;
  salePrice: number;
  saleDiscount: number;
  isActive: boolean;
  maxRetailPrice: number;
  dealerPrice: number;
  salePriceGst: number;
  purPriceGst: number;
  purPrice: number;
  purDiscount: number;
  purDiscountRate: number;
  saleDiscountRate: number;
}
export interface ProductMInput {
  id?: number;
  catId: number;
  hsn?: number | null;
  brandId: number;
  info?: string | null;
  unitId?: number;
  label: string;
  jData?: Json | null;
  productCode: string;
  upcCode?: string | null;
  gstRate?: number;
  salePrice?: number;
  saleDiscount?: number;
  isActive?: boolean;
  maxRetailPrice?: number;
  dealerPrice?: number;
  salePriceGst?: number;
  purPriceGst?: number;
  purPrice?: number;
  purDiscount?: number;
  purDiscountRate?: number;
  saleDiscountRate?: number;
}
const ProductM = {
  tableName: 'ProductM',
  columns: ['id', 'catId', 'hsn', 'brandId', 'info', 'unitId', 'label', 'jData', 'productCode', 'upcCode', 'gstRate', 'salePrice', 'saleDiscount', 'isActive', 'maxRetailPrice', 'dealerPrice', 'salePriceGst', 'purPriceGst', 'purPrice', 'purDiscount', 'purDiscountRate', 'saleDiscountRate'],
  requiredForInsert: ['catId', 'brandId', 'label', 'productCode'],
  primaryKey: 'id',
  foreignKeys: {
    catId: { table: 'CategoryM', column: 'id', $type: null as unknown as CategoryM },
    brandId: { table: 'BrandM', column: 'id', $type: null as unknown as BrandM },
    unitId: { table: 'UnitM', column: 'id', $type: null as unknown as UnitM },
  },
  $type: null as unknown as ProductM,
  $input: null as unknown as ProductMInput
} as const;

// Table ProductOpBal
export interface ProductOpBal {
  id: number;
  productId: number;
  branchId: number;
  finYearId: number;
  qty: number;
  openingPrice: number;
  lastPurchaseDate: string;
  jData: Json | null;
  timestamp: string;
}
export interface ProductOpBalInput {
  id: number;
  productId: number;
  branchId: number;
  finYearId: number;
  qty?: number;
  openingPrice?: number;
  lastPurchaseDate: string;
  jData?: Json | null;
  timestamp?: string;
}
const ProductOpBal = {
  tableName: 'ProductOpBal',
  columns: ['id', 'productId', 'branchId', 'finYearId', 'qty', 'openingPrice', 'lastPurchaseDate', 'jData', 'timestamp'],
  requiredForInsert: ['id', 'productId', 'branchId', 'finYearId', 'lastPurchaseDate'],
  primaryKey: null,
  foreignKeys: {
    productId: { table: 'ProductM', column: 'id', $type: null as unknown as ProductM },
    branchId: { table: 'BranchM', column: 'id', $type: null as unknown as BranchM },
    finYearId: { table: 'FinYearM', column: 'id', $type: null as unknown as FinYearM },
  },
  $type: null as unknown as ProductOpBal,
  $input: null as unknown as ProductOpBalInput
} as const;

// Table SalePurchaseDetails
export interface SalePurchaseDetails {
  id: number;
  tranDetailsId: number;
  productId: number;
  qty: number;
  price: number;
  priceGst: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  amount: number;
  jData: Json | null;
  hsn: number;
  gstRate: number;
  timestamp: string | null;
}
export interface SalePurchaseDetailsInput {
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
  jData?: Json | null;
  hsn: number;
  gstRate?: number;
  timestamp?: string | null;
}
const SalePurchaseDetails = {
  tableName: 'SalePurchaseDetails',
  columns: ['id', 'tranDetailsId', 'productId', 'qty', 'price', 'priceGst', 'discount', 'cgst', 'sgst', 'igst', 'amount', 'jData', 'hsn', 'gstRate', 'timestamp'],
  requiredForInsert: ['id', 'tranDetailsId', 'productId', 'hsn'],
  primaryKey: 'id',
  foreignKeys: {
    tranDetailsId: { table: 'TranD', column: 'id', $type: null as unknown as TranD },
    productId: { table: 'ProductM', column: 'id', $type: null as unknown as ProductM },
  },
  $type: null as unknown as SalePurchaseDetails,
  $input: null as unknown as SalePurchaseDetailsInput
} as const;

// Table Settings
export interface Settings {
  id: number;
  key: string;
  textValue: string | null;
  jData: Json | null;
  intValue: number;
  timestamp: string | null;
}
export interface SettingsInput {
  id: number;
  key: string;
  textValue?: string | null;
  jData?: Json | null;
  intValue?: number;
  timestamp?: string | null;
}
const Settings = {
  tableName: 'Settings',
  columns: ['id', 'key', 'textValue', 'jData', 'intValue', 'timestamp'],
  requiredForInsert: ['id', 'key'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as Settings,
  $input: null as unknown as SettingsInput
} as const;

// Table StockJournal
export interface StockJournal {
  id: number;
  tranHeaderId: number;
  productId: number;
  qty: number;
  dc: string;
  lineRemarks: string | null;
  lineRefNo: string | null;
  timestamp: string;
  jData: Json | null;
  price: number | null;
}
export interface StockJournalInput {
  id: number;
  tranHeaderId: number;
  productId: number;
  qty?: number;
  dc?: string;
  lineRemarks?: string | null;
  lineRefNo?: string | null;
  timestamp?: string;
  jData?: Json | null;
  price?: number | null;
}
const StockJournal = {
  tableName: 'StockJournal',
  columns: ['id', 'tranHeaderId', 'productId', 'qty', 'dc', 'lineRemarks', 'lineRefNo', 'timestamp', 'jData', 'price'],
  requiredForInsert: ['id', 'tranHeaderId', 'productId'],
  primaryKey: 'id',
  foreignKeys: {
    tranHeaderId: { table: 'TranH', column: 'id', $type: null as unknown as TranH },
    productId: { table: 'ProductM', column: 'id', $type: null as unknown as ProductM },
  },
  $type: null as unknown as StockJournal,
  $input: null as unknown as StockJournalInput
} as const;

// Table TagsM
export interface TagsM {
  id: number;
  tagName: string;
}
export interface TagsMInput {
  id: number;
  tagName: string;
}
const TagsM = {
  tableName: 'TagsM',
  columns: ['id', 'tagName'],
  requiredForInsert: ['id', 'tagName'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as TagsM,
  $input: null as unknown as TagsMInput
} as const;

// Table TestM
export interface TestM {
  id: number;
  accCode: string;
  accName: string;
  accType: string;
  parentId: number | null;
  accLeaf: string;
  isPrimary: boolean;
  classId: number;
  timestamp: string | null;
}
export interface TestMInput {
  id?: number;
  accCode: string;
  accName: string;
  accType: string;
  parentId?: number | null;
  accLeaf?: string;
  isPrimary?: boolean;
  classId: number;
  timestamp?: string | null;
}
const TestM = {
  tableName: 'TestM',
  columns: ['id', 'accCode', 'accName', 'accType', 'parentId', 'accLeaf', 'isPrimary', 'classId', 'timestamp'],
  requiredForInsert: ['accCode', 'accName', 'accType', 'classId'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as TestM,
  $input: null as unknown as TestMInput
} as const;

// Table TranCounter
export interface TranCounter {
  id: number;
  finYearId: number;
  branchId: number;
  tranTypeId: number;
  lastNo: number;
}
export interface TranCounterInput {
  id?: number;
  finYearId: number;
  branchId: number;
  tranTypeId: number;
  lastNo: number;
}
const TranCounter = {
  tableName: 'TranCounter',
  columns: ['id', 'finYearId', 'branchId', 'tranTypeId', 'lastNo'],
  requiredForInsert: ['finYearId', 'branchId', 'tranTypeId', 'lastNo'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as TranCounter,
  $input: null as unknown as TranCounterInput
} as const;

// Table TranD
export interface TranD {
  id: number;
  accId: number;
  remarks: string | null;
  dc: string;
  amount: number;
  tranHeaderId: number;
  lineRefNo: string | null;
  instrNo: string | null;
  timestamp: string | null;
}
export interface TranDInput {
  id?: number;
  accId: number;
  remarks?: string | null;
  dc: string;
  amount: number;
  tranHeaderId: number;
  lineRefNo?: string | null;
  instrNo?: string | null;
  timestamp?: string | null;
}
const TranD = {
  tableName: 'TranD',
  columns: ['id', 'accId', 'remarks', 'dc', 'amount', 'tranHeaderId', 'lineRefNo', 'instrNo', 'timestamp'],
  requiredForInsert: ['accId', 'dc', 'amount', 'tranHeaderId'],
  primaryKey: 'id',
  foreignKeys: {
    accId: { table: 'AccM', column: 'id', $type: null as unknown as AccM },
    tranHeaderId: { table: 'TranH', column: 'id', $type: null as unknown as TranH },
  },
  $type: null as unknown as TranD,
  $input: null as unknown as TranDInput
} as const;

// Table TranH
export interface TranH {
  id: number;
  tranDate: string;
  userRefNo: string | null;
  remarks: string | null;
  tags: string | null;
  jData: Json | null;
  tranTypeId: number;
  finYearId: number;
  branchId: number;
  posId: number | null;
  autoRefNo: string;
  timestamp: string;
  contactsId: number | null;
  checked: boolean | null;
}
export interface TranHInput {
  id?: number;
  tranDate: string;
  userRefNo?: string | null;
  remarks?: string | null;
  tags?: string | null;
  jData?: Json | null;
  tranTypeId: number;
  finYearId: number;
  branchId: number;
  posId?: number | null;
  autoRefNo: string;
  timestamp?: string;
  contactsId?: number | null;
  checked?: boolean | null;
}
const TranH = {
  tableName: 'TranH',
  columns: ['id', 'tranDate', 'userRefNo', 'remarks', 'tags', 'jData', 'tranTypeId', 'finYearId', 'branchId', 'posId', 'autoRefNo', 'timestamp', 'contactsId', 'checked'],
  requiredForInsert: ['tranDate', 'tranTypeId', 'finYearId', 'branchId', 'autoRefNo'],
  primaryKey: 'id',
  foreignKeys: {
    tranTypeId: { table: 'TranTypeM', column: 'id', $type: null as unknown as TranTypeM },
    finYearId: { table: 'FinYearM', column: 'id', $type: null as unknown as FinYearM },
    branchId: { table: 'BranchM', column: 'id', $type: null as unknown as BranchM },
    posId: { table: 'PosM', column: 'id', $type: null as unknown as PosM },
    contactsId: { table: 'Contacts', column: 'id', $type: null as unknown as Contacts },
  },
  $type: null as unknown as TranH,
  $input: null as unknown as TranHInput
} as const;

// Table TranTypeM
export interface TranTypeM {
  id: number;
  tranType: string;
  tranCode: string;
}
export interface TranTypeMInput {
  id: number;
  tranType: string;
  tranCode: string;
}
const TranTypeM = {
  tableName: 'TranTypeM',
  columns: ['id', 'tranType', 'tranCode'],
  requiredForInsert: ['id', 'tranType', 'tranCode'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as TranTypeM,
  $input: null as unknown as TranTypeMInput
} as const;

// Table UnitM
export interface UnitM {
  id: number;
  unitName: string;
  jData: Json | null;
  symbol: string | null;
}
export interface UnitMInput {
  id: number;
  unitName: string;
  jData?: Json | null;
  symbol?: string | null;
}
const UnitM = {
  tableName: 'UnitM',
  columns: ['id', 'unitName', 'jData', 'symbol'],
  requiredForInsert: ['id', 'unitName'],
  primaryKey: 'id',
  foreignKeys: {},
  $type: null as unknown as UnitM,
  $input: null as unknown as UnitMInput
} as const;


export interface TableTypes {
  AccClassM: {
    select: AccClassM;
    input: AccClassMInput;
  };
  AccM: {
    select: AccM;
    input: AccMInput;
  };
  AccOpBal: {
    select: AccOpBal;
    input: AccOpBalInput;
  };
  audit_table: {
    select: AuditTable;
    input: AuditTableInput;
  };
  AutoSubledgerCounter: {
    select: AutoSubledgerCounter;
    input: AutoSubledgerCounterInput;
  };
  BankOpBal: {
    select: BankOpBal;
    input: BankOpBalInput;
  };
  BranchM: {
    select: BranchM;
    input: BranchMInput;
  };
  BranchTransfer: {
    select: BranchTransfer;
    input: BranchTransferInput;
  };
  BrandM: {
    select: BrandM;
    input: BrandMInput;
  };
  CategoryM: {
    select: CategoryM;
    input: CategoryMInput;
  };
  Contacts: {
    select: Contacts;
    input: ContactsInput;
  };
  Employees: {
    select: Employees;
    input: EmployeesInput;
  };
  ExtBankReconTranD: {
    select: ExtBankReconTranD;
    input: ExtBankReconTranDInput;
  };
  ExtBusinessContactsAccM: {
    select: ExtBusinessContactsAccM;
    input: ExtBusinessContactsAccMInput;
  };
  ExtGstTranD: {
    select: ExtGstTranD;
    input: ExtGstTranDInput;
  };
  ExtMiscAccM: {
    select: ExtMiscAccM;
    input: ExtMiscAccMInput;
  };
  FinYearM: {
    select: FinYearM;
    input: FinYearMInput;
  };
  GodownM: {
    select: GodownM;
    input: GodownMInput;
  };
  Notes: {
    select: Notes;
    input: NotesInput;
  };
  PosM: {
    select: PosM;
    input: PosMInput;
  };
  ProductM: {
    select: ProductM;
    input: ProductMInput;
  };
  ProductOpBal: {
    select: ProductOpBal;
    input: ProductOpBalInput;
  };
  SalePurchaseDetails: {
    select: SalePurchaseDetails;
    input: SalePurchaseDetailsInput;
  };
  Settings: {
    select: Settings;
    input: SettingsInput;
  };
  StockJournal: {
    select: StockJournal;
    input: StockJournalInput;
  };
  TagsM: {
    select: TagsM;
    input: TagsMInput;
  };
  TestM: {
    select: TestM;
    input: TestMInput;
  };
  TranCounter: {
    select: TranCounter;
    input: TranCounterInput;
  };
  TranD: {
    select: TranD;
    input: TranDInput;
  };
  TranH: {
    select: TranH;
    input: TranHInput;
  };
  TranTypeM: {
    select: TranTypeM;
    input: TranTypeMInput;
  };
  UnitM: {
    select: UnitM;
    input: UnitMInput;
  };
}

export const tables = {
  AccClassM,
  AccM,
  AccOpBal,
  audit_table,
  AutoSubledgerCounter,
  BankOpBal,
  BranchM,
  BranchTransfer,
  BrandM,
  CategoryM,
  Contacts,
  Employees,
  ExtBankReconTranD,
  ExtBusinessContactsAccM,
  ExtGstTranD,
  ExtMiscAccM,
  FinYearM,
  GodownM,
  Notes,
  PosM,
  ProductM,
  ProductOpBal,
  SalePurchaseDetails,
  Settings,
  StockJournal,
  TagsM,
  TestM,
  TranCounter,
  TranD,
  TranH,
  TranTypeM,
  UnitM,
}
