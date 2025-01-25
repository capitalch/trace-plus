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
      children: [
        {
          id: "11",
          label: "Journals",
          path: "/blogs",
        },
        {
          id: "12",
          label: "Payments",
          path: "/blogs",
        },
        {
          id: "13",
          label: "Receipts",
          path: "/blogs",
        },
        {
          id: "14",
          label: "Contra",
          path: "/blogs",
        },
      ],
    },
    {
      id: "2",
      label: "Purch / Sales",
      icon: IconPurchaseSales,
      iconColorClass: "text-secondary-500",
      children: [
        {
          id: "21",
          label: "Purchase",
          path: "/blogs",
        },
        {
          id: "22",
          label: "Purchase returns",
          path: "/blogs",
        },
        {
          id: "23",
          label: "Sales",
          path: "sales",
        },
        {
          id: "24",
          label: "Sales returns",
          path: "/blogs",
        },
        {
          id: "25",
          label: "Debit notes",
          path: "/blogs",
        },
        {
          id: "26",
          label: "Credit notes",
          path: "/blogs",
        },
      ],
    },
    {
      id: "3",
      label: "Masters",
      icon: IconMasters,
      iconColorClass: "text-red-500",
      children: [
        {
          id: "31",
          label: "Company info",
          path: "/company-info",
        },
        {
          id: "32",
          label: "General settings",
          path: "/general-settings",
        },
        {
          id: "33",
          label: "Accounts",
          path: "/accounts-master",
        },
        {
          id: "34",
          label: "Opening balances",
          path: "/opening-balance",
        },
        {
          id: "35",
          label: "Branches",
          path: "/branch-master",
        },
        {
          id: "36",
          label: "Financial years",
          path: "/fin-year-master",
        },
      ],
    },
    {
      id: "4",
      label: "Final accounts",
      icon: IconFinalAccounts,
      iconColorClass: "text-orange-500",
      children: [
        {
          id: "41",
          label: "Trial balance",
          path: "/trial-balance",
        },
        {
          id: "42",
          label: "Balance sheet",
          path: "/balance-sheet",
        },
        {
          id: "43",
          label: "PL account",
          path: "/profit-loss",
        },
        {
          id: "44",
          label: "General ledger",
          path: "/general-ledger",
        },
      ],
    },
    {
      id: "5",
      label: "Options",
      icon: IconOptions,
      iconColorClass: "text-amber-500",
      children: [
        {
          id: "51",
          label: "Bank recon",
          path: "/bank-recon",
        },
        {
          id: "52",
          label: "Common utilities",
          path: "/blogs",
        },
        {
          id: "53",
          label: "Exports",
          path: "/blogs",
        },
      ],
    },
    {
      id: "6",
      label: "Reports",
      icon: IconReports,
      iconColorClass: "text-yellow-500",
      children: [
        {
          id: "61",
          label: "All transactions",
          path: "/blogs",
        },
      ],
    },
    {
      id: "7",
      label: "Inventory",
      icon: IconInventory,
      iconColorClass: "text-teal-500",
      children: [
        {
          id: "71",
          label: "Categories",
          path: "/blogs",
        },
        {
          id: "72",
          label: "Brands",
          path: "/blogs",
        },
        {
          id: "73",
          label: "Products",
          path: "/blogs",
        },
        {
          id: "74",
          label: "Opening stock",
          path: "/blogs",
        },
        {
          id: "75",
          label: "Reports",
          path: "/blogs",
        },
        {
          id: "76",
          label: "Stock journal",
          path: "/blogs",
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
      label: "Business units",
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
      label: "Business users",
      icon: IconUsers,
      iconColorClass: "text-amber-500",
      children: [],
      path: "/admin-business-users",
    },
    {
      id: "12",
      label: "Link users <-> bu",
      icon: IconAdminLinkUsers,
      iconColorClass: "text-secondary-400",
      children: [],
      path: "/admin-link-users",
    },
    {
      id: "18",
      label: "Link ctrls <-> roles",
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
      label: "Secured controls",
      icon: IconSecuredControls,
      iconColorClass: "text-red-500",
      children: [],
      path: "/super-admin-secured-controls",
    },
    {
      id: "17",
      label: "Admin users",
      icon: IconAdminUsers,
      iconColorClass: "text-red-500",
      children: [],
      path: "/super-admin-admin-users",
    },
    {
      id: "18",
      label: "Link ctrls <-> roles",
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
};
