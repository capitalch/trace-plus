import { IconAdminLinkUsers } from "../../controls/icons/icon-admin-link-users";
import { IconAdminUsers } from "../../controls/icons/icon-admin-users";
import { IconBusinessUnits } from "../../controls/icons/icon-business-units";
import { IconClients } from "../../controls/icons/icon-clients";
import { IconDashboard } from "../../controls/icons/icon-dashboard";
import { IconFinalAccounts } from "../../controls/icons/icon-final-accounts";
import { IconInventory } from "../../controls/icons/icon-inventory";
import { IconMasters } from "../../controls/icons/icon-masters";
import { IconOptions } from "../../controls/icons/icon-options";
import { IconPurchaseSales } from "../../controls/icons/icon-purchase-sales";
import { IconReports } from "../../controls/icons/icon-reports";
import { IconRoles } from "../../controls/icons/icon-roles";
import { IconSecuredControls } from "../../controls/icons/icon-secured-controls";
import { IconUsers } from "../../controls/icons/icon-users";
import { IconVoucher } from "../../controls/icons/icon-voucher";

export const MasterMenuData: MenuDataType = {
  accounts: [
    {
      id: "1",
      label: "Vouchers",
      icon: IconVoucher,
      iconColorClass: "text-primary-500",
      controlName: "vouchers.menu.parent.view",
      children: [
        {
          id: "10",
          label: "All Vouchers",
          path: "/all-vouchers",
          controlName: "vouchers.menu.all-vouchers.view",
        },
      ],
    },
    {
      id: "2",
      label: "Purch / Sales",
      icon: IconPurchaseSales,
      iconColorClass: "text-secondary-500",
      controlName: "purchase-sales.menu.parent.view",
      children: [
        {
          id: "21",
          label: "Purchase",
          path: "/all-purchases",
          controlName: "purchase-sales.menu.purchase.view",
        },
        {
          id: "22",
          label: "Purchase Return",
          path: "/all-purchase-returns",
          controlName: "purchase-sales.menu.purchase-return.view",
        },
        {
          id: "23",
          label: "Sales",
          path: "/all-sales",
          controlName: "purchase-sales.menu.sales.view",
        },
        {
          id: "24",
          label: "Sales Return",
          path: "/all-sales-return",
          controlName: "purchase-sales.menu.sales-return.view",
        },
        {
          id: "25",
          label: "Debit Notes",
          path: "/debit-notes",
          controlName: "purchase-sales.menu.debit-notes.view",
        },
        {
          id: "26",
          label: "Credit Notes",
          path: "/credit-notes",
          controlName: "purchase-sales.menu.credit-notes.view",
        },
      ],
    },
    {
      id: "3",
      label: "Masters",
      icon: IconMasters,
      iconColorClass: "text-red-500",
      controlName: "masters.menu.parent.view",
      children: [
        {
          id: "31",
          label: "Company Info",
          path: "/company-info",
          controlName: "masters.menu.company-info.view",
        },
        {
          id: "32",
          label: "General Settings",
          path: "/general-settings",
          controlName: "masters.menu.general-settings.view",
        },
        {
          id: "33",
          label: "Accounts Master",
          path: "/accounts-master",
          controlName: "masters.menu.accounts-master.view",
        },
        {
          id: "34",
          label: "Opening Balances",
          path: "/opening-balance",
          controlName: "masters.menu.opening-balances.view",
        },
        {
          id: "35",
          label: "Branches",
          path: "/branch-master",
          controlName: "masters.menu.branches.view",
        },
        {
          id: "36",
          label: "Financial Years",
          path: "/fin-year-master",
          controlName: "masters.menu.financial-years.view",
        },
      ],
    },
    {
      id: "4",
      label: "Final Accounts",
      icon: IconFinalAccounts,
      iconColorClass: "text-orange-500",
      controlName: "final-accounts.menu.parent.view",
      children: [
        {
          id: "41",
          label: "Trial Balance",
          path: "/trial-balance",
          controlName: "final-accounts.menu.trial-balance.view",
        },
        {
          id: "42",
          label: "Balance Sheet",
          path: "/balance-sheet",
          controlName: "final-accounts.menu.balance-sheet.view",
        },
        {
          id: "43",
          label: "PL Account",
          path: "/profit-loss",
          controlName: "final-accounts.menu.pl-account.view",
        },
        {
          id: "44",
          label: "General Ledger",
          path: "/general-ledger",
          controlName: "final-accounts.menu.general-ledger.view",
        },
      ],
    },
    {
      id: "5",
      label: "Options",
      icon: IconOptions,
      iconColorClass: "text-amber-500",
      controlName: "options.menu.parent.view",
      children: [
        {
          id: "51",
          label: "Bank Recon",
          path: "/bank-recon",
          controlName: "options.menu.bank-recon.view",
        },
        {
          id: "52",
          label: "Common Utilities",
          path: "/common-utilities",
          controlName: "options.menu.common-utilities.view",
        },
        {
          id: "53",
          label: "Exports",
          path: "/all-exports",
          controlName: "options.menu.exports.view",
        },
      ],
    },
    {
      id: "6",
      label: "Reports",
      icon: IconReports,
      iconColorClass: "text-yellow-500",
      controlName: "reports.menu.parent.view",
      children: [
        {
          id: "61",
          label: "All Transactions",
          path: "/report-all-transactions",
          controlName: "reports.menu.all-transactions.view",
        },
      ],
    },
    {
      id: "7",
      label: "Inventory",
      icon: IconInventory,
      iconColorClass: "text-teal-500",
      controlName: "inventory.menu.parent.view",
      children: [
        {
          id: "71",
          label: "Categories",
          path: "/product-categories",
          controlName: "inventory.menu.categories.view",
        },
        {
          id: "72",
          label: "Brands",
          path: "/brand-master",
          controlName: "inventory.menu.brands.view",
        },
        {
          id: "73",
          label: "Product Master",
          path: "/product-master",
          controlName: "inventory.menu.product-master.view",
        },
        {
          id: "74",
          label: "Opening Stock",
          path: "/products-opening-balances",
          controlName: "inventory.menu.opening-stock.view",
        },
        {
          id: "75",
          label: "Reports",
          path: "/inventory-reports-dashboard",
          controlName: "inventory.menu.reports.view",
        },
        {
          id: "76",
          label: "Stock Journal",
          path: "/stock-journal",
          controlName: "inventory.menu.stock-journal.view",
        },
        {
          id: "77",
          label: "Branch Transfer",
          path: "/products-branch-transfers",
          controlName: "inventory.menu.branch-transfer.view",
        },
      ],
    },
  ],
  admin: [
    {
      id: "8",
      label: "Dashboard",
      icon: IconDashboard,
      iconColorClass: "text-primary-500",
      path: "/admin-dashboard",
      children: [],
    },
    {
      id: "9",
      label: "Business Units",
      icon: IconBusinessUnits,
      iconColorClass: "text-teal-500",
      path: "/admin-business-units",
      children: [],
    },
    {
      id: "10",
      label: "Roles",
      icon: IconRoles,
      iconColorClass: "text-red-500",
      children: [],
      path: "/admin-roles",
    },
    {
      id: "11",
      label: "Business Users",
      icon: IconUsers,
      iconColorClass: "text-amber-500",
      children: [],
      path: "/admin-business-users",
    },
    {
      id: "12",
      label: "Users ⇔ Bu",
      icon: IconAdminLinkUsers,
      iconColorClass: "text-secondary-400",
      children: [],
      path: "/admin-link-users",
    },
    {
      id: "18",
      label: "Controls ⇔ Roles",
      icon: IconAdminLinkUsers,
      iconColorClass: "text-green-500",
      children: [],
      path: "/admin-link-secured-controls-roles",
    },
  ],
  superAdmin: [
    {
      id: "13",
      label: "Dashboard",
      icon: IconDashboard,
      iconColorClass: "text-primary-500",
      children: [],
      path: "/super-admin-dashboard",
    },
    {
      id: "14",
      label: "Clients",
      icon: IconClients,
      iconColorClass: "text-teal-500",
      children: [],
      path: "/super-admin-clients",
    },
    {
      id: "15",
      label: "Roles",
      icon: IconRoles,
      iconColorClass: "text-amber-500",
      children: [],
      path: "/super-admin-roles",
    },
    {
      id: "16",
      label: "Secured Controls",
      icon: IconSecuredControls,
      iconColorClass: "text-red-500",
      children: [],
      path: "/super-admin-secured-controls",
    },
    {
      id: "17",
      label: "Admin Users",
      icon: IconAdminUsers,
      iconColorClass: "text-red-500",
      children: [],
      path: "/super-admin-admin-users",
    },
    {
      id: "18",
      label: "Controls ⇔ Roles",
      icon: IconAdminLinkUsers,
      iconColorClass: "text-green-500",
      children: [],
      path: "/super-admin-link-secured-controls-roles",
    },
  ],
};

export type MenuDataItemType = {
  id: string;
  label: string;
  icon: any;
  iconColorClass: string;
  children: Array<ChildMenuItemType>;
  path?: string;
  controlName?: string;
};

export type MenuDataType = {
  admin: MenuDataItemType[];
  superAdmin: MenuDataItemType[];
  accounts: MenuDataItemType[];
};

export type ChildMenuItemType = {
  id: string;
  label: string;
  path: string;
  controlName?: string;
};
