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
  debitNote: { name: "Debit Note", value: 7 },
  creditNote: { name: "Credit Note", value: 8 },
  salesReturn: { name: "Sales Return", value: 9 },
  purchaseReturn: { name: "Purchase Return", value: 10 },
  stockJournal: { name: "Stock Journal", value: 11 },
  branchTransfer: { name: "Branch Transfer", value: 12 },
};
