import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ErrorPage } from "./error-page";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Eagerly loaded components (needed for initial render)
import { Protected } from "../../features/layouts/protected";
import { Layouts } from "../../features/layouts/layouts";

// Lazy loaded components - Login
const Login = lazy(() => import("../../features/login/login").then(m => ({ default: m.Login })));

// Lazy loaded components - Pages
const Blogs = lazy(() => import("../../features/pages/blogs").then(m => ({ default: m.Blogs })));
const Comp1 = lazy(() => import("../../features/pages/comp1").then(m => ({ default: m.Comp1 })));

// Lazy loaded components - Super Admin
const SuperAdminDashboard = lazy(() => import("../../features/security/super-admin/dashboard/super-admin-dashboard").then(m => ({ default: m.SuperAdminDashboard })));
const SuperAdminClients = lazy(() => import("../../features/security/super-admin/clients/super-admin-clients").then(m => ({ default: m.SuperAdminClients })));
const SuperAdminRoles = lazy(() => import("../../features/security/super-admin/roles/super-admin-roles").then(m => ({ default: m.SuperAdminRoles })));
const SuperAdminSecuredControls = lazy(() => import("../../features/security/super-admin/permissions/super-admin-secured-controls").then(m => ({ default: m.SuperAdminSecuredControls })));
const SuperAdminAdminUsers = lazy(() => import("../../features/security/super-admin/admin-users/super-admin-admin-users").then(m => ({ default: m.SuperAdminAdminUsers })));
const SuperAdminLinkSecuredControlsWithRoles = lazy(() => import("../../features/security/super-admin/link-unlink-secured-controls/super-admin-link-secured-controls-with-roles").then(m => ({ default: m.SuperAdminLinkSecuredControlsWithRoles })));

// Lazy loaded components - Admin
const AdminDashBoard = lazy(() => import("../../features/security/admin/dashboard/admin-dashboard").then(m => ({ default: m.AdminDashBoard })));
const AdminBusinessUnits = lazy(() => import("../../features/security/admin/business-units/admin-business-units").then(m => ({ default: m.AdminBusinessUnits })));
const AdminRoles = lazy(() => import("../../features/security/admin/roles/admin-roles").then(m => ({ default: m.AdminRoles })));
const AdminBusinessUsers = lazy(() => import("../../features/security/admin/business users/admin-business-users").then(m => ({ default: m.AdminBusinessUsers })));
const AdminLinkUsersWithBu = lazy(() => import("../../features/security/admin/link-unlink-users/admin-link-users-with-bu").then(m => ({ default: m.AdminLinkUsersWithBu })));
const AdminLinkSecuredControlsWithRoles = lazy(() => import("../../features/security/admin/link-unlink-secured-controls.tsx/admin-link-secured-controls-with-roles").then(m => ({ default: m.AdminLinkSecuredControlsWithRoles })));

// Lazy loaded components - Final Accounts
const TrialBalance = lazy(() => import("../../features/accounts/final-accounts/trial-balance").then(m => ({ default: m.TrialBalance })));
const BalanceSheet = lazy(() => import("../../features/accounts/final-accounts/balance-sheet").then(m => ({ default: m.BalanceSheet })));
const ProfitLoss = lazy(() => import("../../features/accounts/final-accounts/profit-loss").then(m => ({ default: m.ProfitLoss })));
const GeneralLedger = lazy(() => import("../../features/accounts/final-accounts/general-ledger/general-ledger").then(m => ({ default: m.GeneralLedger })));

// Lazy loaded components - Account Options
const BankRecon = lazy(() => import("../../features/accounts/options/bank-recon/bank-recon").then(m => ({ default: m.BankRecon })));
const CommonUtilities = lazy(() => import("../../features/accounts/options/common-utilities/common-utilities").then(m => ({ default: m.CommonUtilities })));
const AllExports = lazy(() => import("../../features/accounts/options/exports/all-exports").then(m => ({ default: m.AllExports })));

// Lazy loaded components - Account Masters
const AccountsMaster = lazy(() => import("../../features/accounts/masters/accounts/accounts-master").then(m => ({ default: m.AccountsMaster })));
const CompanyInfo = lazy(() => import("../../features/accounts/masters/company-info/company-info").then(m => ({ default: m.CompanyInfo })));
const GeneralSettings = lazy(() => import("../../features/accounts/masters/general-settings").then(m => ({ default: m.GeneralSettings })));
const BranchMaster = lazy(() => import("../../features/accounts/masters/branch-master/branch-master").then(m => ({ default: m.BranchMaster })));
const FinYearMaster = lazy(() => import("../../features/accounts/masters/fin-year-master/fin-year-master").then(m => ({ default: m.FinYearMaster })));
const AccountsOpeningBalance = lazy(() => import("../../features/accounts/masters/opening-balance/accounts-opening-balance").then(m => ({ default: m.AccountsOpeningBalance })));

// Lazy loaded components - Account Reports
const ReportAllTransactions = lazy(() => import("../../features/accounts/reports/report-all-transactions/report-all-transactions").then(m => ({ default: m.ReportAllTransactions })));

// Lazy loaded components - Inventory
const ProductCategories = lazy(() => import("../../features/accounts/inventory/categories/product-categories").then(m => ({ default: m.ProductCategories })));
const BrandMaster = lazy(() => import("../../features/accounts/inventory/brands/brand-master").then(m => ({ default: m.BrandMaster })));
const ProductMaster = lazy(() => import("../../features/accounts/inventory/product-master/product-master").then(m => ({ default: m.ProductMaster })));
const ProductsOpeningBalances = lazy(() => import("../../features/accounts/inventory/opening-stock/products-opening-balances").then(m => ({ default: m.ProductsOpeningBalances })));
const ProductsBranchTransfers = lazy(() => import("../../features/accounts/inventory/branch-transfer/products-branch-transfers").then(m => ({ default: m.ProductsBranchTransfers })));
const StockJournal = lazy(() => import("../../features/accounts/inventory/stock-journal/stock-journal").then(m => ({ default: m.StockJournal })));
const InventoryReportsDashboard = lazy(() => import("../../features/accounts/inventory/reports/inventory-reports-dashboard").then(m => ({ default: m.InventoryReportsDashboard })));
const InventoryReportsContainer = lazy(() => import("../../features/accounts/inventory/reports/inventory-reports-container").then(m => ({ default: m.InventoryReportsContainer })));

// Lazy loaded components - Vouchers
const AllVouchers = lazy(() => import("../../features/accounts/vouchers/all-vouchers/all-vouchers").then(m => ({ default: m.AllVouchers })));

// Lazy loaded components - Purchase & Sales
const AllPurchases = lazy(() => import("../../features/accounts/purchase-sales/purchases/all-purchases/all-purchases").then(m => ({ default: m.AllPurchases })));
const AllPurchaseReturns = lazy(() => import("../../features/accounts/purchase-sales/purchase-returns/all-purchase-returns/all-purchase-returns").then(m => ({ default: m.AllPurchaseReturns })));
const DebitNotes = lazy(() => import("../../features/accounts/purchase-sales/debit-notes/debit-notes").then(m => ({ default: m.DebitNotes })));
const CreditNotes = lazy(() => import("../../features/accounts/purchase-sales/credit-notes/credit-notes").then(m => ({ default: m.CreditNotes })));
const AllSales = lazy(() => import("../../features/accounts/purchase-sales/sales/all-sales").then(m => ({ default: m.AllSales })));
const AllSalesReturn = lazy(() => import("../../features/accounts/purchase-sales/sales-return/all-sales-return").then(m => ({ default: m.AllSalesReturn })));

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
        {
          path: "admin-business-units",
          element: <Suspense fallback={<LoadingFallback />}><AdminBusinessUnits /></Suspense>
        },
        {
          path: "admin-business-users",
          element: <Suspense fallback={<LoadingFallback />}><AdminBusinessUsers /></Suspense>
        },
        {
          path: "admin-dashboard",
          element: <Suspense fallback={<LoadingFallback />}><AdminDashBoard /></Suspense>
        },
        {
          path: "admin-link-users",
          element: <Suspense fallback={<LoadingFallback />}><AdminLinkUsersWithBu /></Suspense>
        },
        {
          path: "admin-link-secured-controls-roles",
          element: <Suspense fallback={<LoadingFallback />}><AdminLinkSecuredControlsWithRoles /></Suspense>
        },
        {
          path: "admin-roles",
          element: <Suspense fallback={<LoadingFallback />}><AdminRoles /></Suspense>
        },
        {
          path: "blogs",
          element: <Suspense fallback={<LoadingFallback />}><Blogs /></Suspense>
        },
        {
          path: "comp1",
          element: <Suspense fallback={<LoadingFallback />}><Comp1 /></Suspense>
        },
        {
          path: "super-admin-admin-users",
          element: <Suspense fallback={<LoadingFallback />}><SuperAdminAdminUsers /></Suspense>
        },
        {
          path: "super-admin-clients",
          element: <Suspense fallback={<LoadingFallback />}><SuperAdminClients /></Suspense>
        },
        {
          path: "super-admin-dashboard",
          element: <Suspense fallback={<LoadingFallback />}><SuperAdminDashboard /></Suspense>
        },
        {
          path: "super-admin-roles",
          element: <Suspense fallback={<LoadingFallback />}><SuperAdminRoles /></Suspense>
        },
        {
          path: "super-admin-link-secured-controls-roles",
          element: <Suspense fallback={<LoadingFallback />}><SuperAdminLinkSecuredControlsWithRoles /></Suspense>
        },
        {
          path: "super-admin-secured-controls",
          element: <Suspense fallback={<LoadingFallback />}><SuperAdminSecuredControls /></Suspense>
        },
        {
          path: "trial-balance",
          element: <Suspense fallback={<LoadingFallback />}><TrialBalance /></Suspense>
        },
        {
          path: "balance-sheet",
          element: <Suspense fallback={<LoadingFallback />}><BalanceSheet /></Suspense>
        },
        {
          path: "profit-loss",
          element: <Suspense fallback={<LoadingFallback />}><ProfitLoss /></Suspense>
        },
        {
          path: "general-ledger",
          element: <Suspense fallback={<LoadingFallback />}><GeneralLedger /></Suspense>
        },
        {
          path: "bank-recon",
          element: <Suspense fallback={<LoadingFallback />}><BankRecon /></Suspense>
        },
        {
          path: "accounts-master",
          element: <Suspense fallback={<LoadingFallback />}><AccountsMaster /></Suspense>
        },
        {
          path: "company-info",
          element: <Suspense fallback={<LoadingFallback />}><CompanyInfo /></Suspense>
        },
        {
          path: "general-settings",
          element: <Suspense fallback={<LoadingFallback />}><GeneralSettings /></Suspense>
        },
        {
          path: "branch-master",
          element: <Suspense fallback={<LoadingFallback />}><BranchMaster /></Suspense>
        },
        {
          path: "fin-year-master",
          element: <Suspense fallback={<LoadingFallback />}><FinYearMaster /></Suspense>
        },
        {
          path: "opening-balance",
          element: <Suspense fallback={<LoadingFallback />}><AccountsOpeningBalance /></Suspense>
        },
        {
          path: "common-utilities",
          element: <Suspense fallback={<LoadingFallback />}><CommonUtilities /></Suspense>
        },
        {
          path: "all-exports",
          element: <Suspense fallback={<LoadingFallback />}><AllExports /></Suspense>
        },
        {
          path: "report-all-transactions",
          element: <Suspense fallback={<LoadingFallback />}><ReportAllTransactions /></Suspense>
        },
        {
          path: "product-categories",
          element: <Suspense fallback={<LoadingFallback />}><ProductCategories /></Suspense>
        },
        {
          path: "brand-master",
          element: <Suspense fallback={<LoadingFallback />}><BrandMaster /></Suspense>
        },
        {
          path: "product-master",
          element: <Suspense fallback={<LoadingFallback />}><ProductMaster /></Suspense>
        },
        {
          path: "products-opening-balances",
          element: <Suspense fallback={<LoadingFallback />}><ProductsOpeningBalances /></Suspense>
        },
        {
          path: "products-branch-transfers",
          element: <Suspense fallback={<LoadingFallback />}><ProductsBranchTransfers /></Suspense>
        },
        {
          path: "stock-journal",
          element: <Suspense fallback={<LoadingFallback />}><StockJournal /></Suspense>
        },
        {
          path: "inventory-reports-dashboard",
          element: <Suspense fallback={<LoadingFallback />}><InventoryReportsDashboard /></Suspense>
        },
        {
          path: "/inventory-reports/:id",
          element: <Suspense fallback={<LoadingFallback />}><InventoryReportsContainer /></Suspense>
        },
        {
          path: "/all-vouchers",
          element: <Suspense fallback={<LoadingFallback />}><AllVouchers /></Suspense>
        },
        {
          path: "/all-purchases",
          element: <Suspense fallback={<LoadingFallback />}><AllPurchases /></Suspense>
        },
        {
          path: "/all-purchase-returns",
          element: <Suspense fallback={<LoadingFallback />}><AllPurchaseReturns /></Suspense>
        },
        {
          path: '/debit-notes',
          element: <Suspense fallback={<LoadingFallback />}><DebitNotes /></Suspense>
        },
        {
          path: '/credit-notes',
          element: <Suspense fallback={<LoadingFallback />}><CreditNotes /></Suspense>
        },
        {
          path: '/all-sales',
          element: <Suspense fallback={<LoadingFallback />}><AllSales /></Suspense>
        },
        {
          path: '/all-sales-return',
          element: <Suspense fallback={<LoadingFallback />}><AllSalesReturn /></Suspense>
        },
      ]
    },
    {
      path: "/login",
      element: <Suspense fallback={<LoadingFallback />}><Login /></Suspense>,
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
