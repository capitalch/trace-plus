import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { layoutsReducer } from "../features/layouts/layouts-slice";
import { doLogout, loginReducer } from "../features/login/login-slice";
import { queryHelperReducer } from "./graphql/query-helper-slice";
import { accountsReducer } from "../features/accounts/accounts-slice";
import { reduxCompReducer } from "../controls/redux-components/comp-slice";
import { salesReportReducer } from "../features/accounts/inventory/reports/inventory-reports/sales-report/sales-report-slice";
import { stockSummaryReportReducer } from "../features/accounts/inventory/reports/inventory-reports/stock-summary-report/stock-summary-report-slice";
import { stockTransReportReducer } from "../features/accounts/inventory/reports/inventory-reports/stock-trans-report/stock-trans-report-slice";
import { accountPickerTreeReducer } from "../controls/redux-components/account-picker-tree/account-picker-tree-slice";
import { voucherReducer } from "../features/accounts/vouchers/voucher-slice";
import { purchaseReducer } from "../features/accounts/purchase-sales/purchases/purchase-slice";
import { purchaseReturnReducer } from "../features/accounts/purchase-sales/purchase-returns/purchase-return-slice";
import { debitNotesReducer } from "../features/accounts/purchase-sales/debit-notes/debit-notes-slice";
import { creditNotesReducer } from "../features/accounts/purchase-sales/credit-notes/credit-notes-slice";

const rootReducer = combineReducers({
  accounts: accountsReducer,
  accountPickerTree: accountPickerTreeReducer,
  queryHelper: queryHelperReducer,
  layouts: layoutsReducer,
  login: loginReducer,
  reduxComp: reduxCompReducer,
  salesReport: salesReportReducer,
  stockSummaryReport: stockSummaryReportReducer,
  stockTransReport: stockTransReportReducer,
  vouchers: voucherReducer,
  purchase: purchaseReducer,
  purchaseReturn: purchaseReturnReducer,
  debitNotes: debitNotesReducer,
  creditNotes: creditNotesReducer,
});

const reducerWithReset = (state: any, action: any) => {
  if (action.type === doLogout.type) {
    state = undefined; // this resets all slices
  }
  return rootReducer(state, action);
};

export const store = configureStore({
  reducer: reducerWithReset,
});

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;

