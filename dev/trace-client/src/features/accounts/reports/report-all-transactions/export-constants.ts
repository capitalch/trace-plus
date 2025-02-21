export const transactionTypes: {
  [key: string]: { name: string; value: number | null };
} = {
  all: { name: "All", value: null },
  contra: { name: "Contra", value: 6 },
  journal: { name: "Journal", value: 1 },
  payment: { name: "Payment", value: 2 },
  receipt: { name: "Receipt", value: 3 },
  sales: { name: "Sales", value: 4 },
  purchase: { name: "Purchase", value: 5 },
  debitNote: { name: "Debit note", value: 7 },
  creditNote: { name: "Credit note", value: 8 },
  salesReturn: { name: "Sales return", value: 9 },
  purchaseReturn: { name: "Purchase return", value: 10 },
  stockJournal: { name: "Stock journal", value: 11 },
  branchTransfer: { name: "Branch transfer", value: 12 },
};
