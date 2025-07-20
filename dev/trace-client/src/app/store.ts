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
  vouchers: voucherReducer
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


// export const store = configureStore({
//   reducer: {
//     accounts: accountsReducer,
//     accountPickerTree: accountPickerTreeReducer,
//     queryHelper: queryHelperReducer,
//     layouts: layoutsReducer,
//     login: loginReducer,
//     reduxComp: reduxCompReducer,
//     salesReport: salesReportReducer,
//     stockSummaryReport: stockSummaryReportReducer,
//     stockTransReport: stockTransReportReducer,
//   },
// });

