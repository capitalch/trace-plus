import { configureStore } from "@reduxjs/toolkit";
import { layoutsReducer } from "../../features/layouts/layouts-slice";
import { loginReducer } from "../../features/login/login-slice";
import { queryHelperReducer } from "../graphql/query-helper-slice";
import { accountsReducer } from "../../features/accounts/accounts-slice";
import { reduxCompReducer } from "../../controls/redux-components/comp-slice";
import { salesReportReducer } from "../../features/accounts/inventory/reports/inventory-reports/sales-report/sales-report-slice";
import { stockSummaryReportReducer } from "../../features/accounts/inventory/reports/inventory-reports/stock-summary-report/stock-summary-report-slice";
import { stockTransReportReducer } from "../../features/accounts/inventory/reports/inventory-reports/stock-trans-report/stock-trans-report-slice";

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    queryHelper: queryHelperReducer,
    layouts: layoutsReducer,
    login: loginReducer,
    reduxComp: reduxCompReducer,
    salesReport: salesReportReducer,
    stockSummaryReport: stockSummaryReportReducer,
    stockTransReport: stockTransReportReducer,
  },
});

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;
