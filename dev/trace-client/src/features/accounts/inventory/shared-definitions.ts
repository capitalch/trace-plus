export const ageOptions: AgeType[] = [
  { label: "All", value: "null" },
  { label: "Age >= 90 days", value: "90" },
  { label: "Age >= 180 days", value: "180" },
  { label: "Age >= 270 days", value: "270" },
  { label: "Age >= 360 days", value: "360" },
];

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
