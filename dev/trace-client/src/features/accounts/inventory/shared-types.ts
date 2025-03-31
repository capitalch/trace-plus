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