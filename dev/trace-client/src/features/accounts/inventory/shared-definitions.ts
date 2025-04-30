export const ageOptions: AgeType[] = [
  { label: "All", value: null },
  { label: "Age >= 90 days", value: "90" },
  { label: "Age >= 180 days", value: "180" },
  { label: "Age >= 270 days", value: "270" },
  { label: "Age >= 360 days", value: "360" },
];

export const dateRangeOptions: { label: string; value: any }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Current financial year', value: 'finYear' },
  { label: 'Prev day', value: 'prevDay' },
  { label: 'last 3 days', value: 'last3Days' },
  { label: 'This week', value: 'thisWeek' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'Prev month', value: 'prevMonth' },
  { label: 'Last 3 months', value: 'last3Months' },
  { label: 'Qtr1', value: 'qtr1' },
  { label: 'Qtr2', value: 'qtr2' },
  { label: 'Qtr3', value: 'qtr3' },
  { label: 'Qtr4', value: 'qtr4' },
  { label: 'H1', value: 'h1' },
  { label: 'H2', value: 'h2' },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12, },
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 }
]

export type AgeType = {
  value: string | null;
  label: string;
};

export type BrandType = { id: number | null; brandName: string };

export type CategoryNodeType = {
  id: string | number;
  catName: string;
  parentId: string | null;
  isLeaf?: boolean;
  hasChild?: boolean;
};

export type CategoryType = {
  id: string;
  catName: string;
};

export type DateRangeType = {
  label: string;
  value: string | number | null;
}

export type ProductLineItem = {
  id?: number | string;
  amount?: number;
  jData?: { [key: string]: any };
  lineRefNo?: string | null;
  lineRemarks?: string | null;
  price: number;
  productCode?: string | null;
  productDetails?: string | null;
  productId?: number;
  qty: number;
  serialNumbers: string | null;
  tranHeaderId?: number;
  upcCode?: string | null;
};

export type ProductType = {
  brandName: string;
  catName: string;
  gstRate: number;
  hsn: number;
  info: string;
  label: string;
  lastPurchasePrice: number;
  productCode: string;
  productId: number;
  upcCode: string;
};

export type TagType = { id: number | null; tagName: string };

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
