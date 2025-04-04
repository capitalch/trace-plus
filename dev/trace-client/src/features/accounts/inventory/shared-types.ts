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