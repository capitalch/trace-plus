import { createBrowserRouter } from "react-router-dom";
import { Protected } from "../../features/layouts/protected";
import { Layouts } from "../../features/layouts/layouts";
import { Blogs } from "../../features/pages/blogs";
import { Login } from "../../features/login/login";
import { ErrorPage } from "./error-page";
import { Comp1 } from "../../features/pages/comp1";
import { SuperAdminDashboard } from "../../features/security/super-admin/dashboard/super-admin-dashboard";
import { SuperAdminClients } from "../../features/security/super-admin/clients/super-admin-clients";
import { SuperAdminRoles } from "../../features/security/super-admin/roles/super-admin-roles";
import { SuperAdminSecuredControls } from "../../features/security/super-admin/secured-controls/super-admin-secured-controls";
import { SuperAdminAdminUsers } from "../../features/security/super-admin/admin-users/super-admin-admin-users";
import { AdminDashBoard } from "../../features/security/admin/dashboard/admin-dashboard";
import { AdminBusinessUnits } from "../../features/security/admin/business-units/admin-business-units";
import { AdminRoles } from "../../features/security/admin/roles/admin-roles";
import { AdminBusinessUsers } from "../../features/security/admin/business users/admin-business-users";
import { AdminLinkUsersWithBu } from "../../features/security/admin/link-unlink-users/admin-link-users-with-bu";
import { SuperAdminLinkSecuredControlsWithRoles } from "../../features/security/super-admin/link-unlink-secured-controls/super-admin-link-secured-controls-with-roles";
import { AdminLinkSecuredControlsWithRoles } from "../../features/security/admin/link-unlink-secured-controls.tsx/admin-link-secured-controls-with-roles";
import { TrialBalance } from "../../features/accounts/final-accounts/trial-balance";
import { BalanceSheet } from "../../features/accounts/final-accounts/balance-sheet";
import { ProfitLoss } from "../../features/accounts/final-accounts/profit-loss";
import { GeneralLedger } from "../../features/accounts/final-accounts/general-ledger/general-ledger";
import { BankRecon } from "../../features/accounts/options/bank-recon/bank-recon";
import { AccountsMaster } from "../../features/accounts/masters/accounts/accounts-master";
import { CompanyInfo } from "../../features/accounts/masters/company-info/company-info";
import { GeneralSettings } from "../../features/accounts/masters/general-settings";
import { BranchMaster } from "../../features/accounts/masters/branch-master/branch-master";
import { FinYearsMaster } from "../../features/accounts/masters/fin-years-master/fin-years-master";
import { AccountsOpeningBalance } from "../../features/accounts/masters/opening-balance/accounts-opening-balance";
import { CommonUtilities } from "../../features/accounts/options/common-utilities/common-utilities";
import { AllExports } from "../../features/accounts/options/exports/all-exports";
import { ReportAllTransactions } from "../../features/accounts/reports/report-all-transactions/report-all-transactions";
import { ProductCategories } from "../../features/accounts/inventory/categories/product-categories";
import { BrandMaster } from "../../features/accounts/inventory/brands/brand-master";
import { ProductMaster } from "../../features/accounts/inventory/product-master/product-master";
import { ProductsOpeningBalances } from "../../features/accounts/inventory/opening-stock/products-opening-balances";
import { ProductsBranchTransfers } from "../../features/accounts/inventory/branch-transfer/products-branch-transfers";
import { StockJournal } from "../../features/accounts/inventory/stock-journal/stock-journal";
import { InventoryReportsDashboard } from "../../features/accounts/inventory/reports/inventory-reports-dashboard";
import { InventoryReportsContainer } from "../../features/accounts/inventory/reports/inventory-reports-container";

export const appRouter = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Protected>
          <Layouts />
        </Protected>
      ),
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <></> },
        { path: "admin-business-units", element: <AdminBusinessUnits /> },
        { path: "admin-business-users", element: <AdminBusinessUsers /> },
        { path: "admin-dashboard", element: <AdminDashBoard /> },
        { path: "admin-link-users", element: <AdminLinkUsersWithBu /> },
        {
          path: "admin-link-secured-controls-roles",
          element: <AdminLinkSecuredControlsWithRoles />
        },
        { path: "admin-roles", element: <AdminRoles /> },
        { path: "blogs", element: <Blogs /> },
        { path: "comp1", element: <Comp1 /> },
        { path: "super-admin-admin-users", element: <SuperAdminAdminUsers /> },
        { path: "super-admin-clients", element: <SuperAdminClients /> },
        { path: "super-admin-dashboard", element: <SuperAdminDashboard /> },
        { path: "super-admin-roles", element: <SuperAdminRoles /> },
        {
          path: "super-admin-link-secured-controls-roles",
          element: <SuperAdminLinkSecuredControlsWithRoles />
        },
        {
          path: "super-admin-secured-controls",
          element: <SuperAdminSecuredControls />
        },
        { path: "trial-balance", element: <TrialBalance /> },
        { path: "balance-sheet", element: <BalanceSheet /> },
        { path: "profit-loss", element: <ProfitLoss /> },
        { path: "general-ledger", element: <GeneralLedger /> },
        { path: "bank-recon", element: <BankRecon /> },
        { path: "accounts-master", element: <AccountsMaster /> },
        { path: "company-info", element: <CompanyInfo /> },
        { path: "general-settings", element: <GeneralSettings /> },
        { path: "branch-master", element: <BranchMaster /> },
        { path: "fin-year-master", element: <FinYearsMaster /> },
        { path: "opening-balance", element: <AccountsOpeningBalance /> },
        { path: "common-utilities", element: <CommonUtilities /> },
        { path: "all-exports", element: <AllExports /> },
        { path: "report-all-transactions", element: <ReportAllTransactions /> },
        { path: "product-categories", element: <ProductCategories /> },
        { path: "brand-master", element: <BrandMaster /> },
        { path: "product-master", element: <ProductMaster /> },
        {
          path: "products-opening-balances",
          element: <ProductsOpeningBalances />
        },
        {
          path: "products-branch-transfers",
          element: <ProductsBranchTransfers />
        },
        { path: "stock-journal", element: <StockJournal /> },
        {
          path: "inventory-reports-dashboard",
          element: <InventoryReportsDashboard />
        },
        {
          path: "/inventory-reports/:id",
          element: <InventoryReportsContainer />
        }
      ]
    },
    {
      path: "/login",
      element: <Login />,
      errorElement: <ErrorPage />
    }
  ],
  {
    //Following settings to escape warning
    // future: {
    //     v7_relativeSplatPath: true,
    //     v7_fetcherPersist: true,
    //     v7_normalizeFormMethod: true,
    //     v7_partialHydration: true,
    //     v7_skipActionErrorRevalidation: true
    // },
  }
);
