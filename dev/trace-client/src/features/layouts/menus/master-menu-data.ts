import { AdminUsersIcon } from '../../../components/icons/admin-users-icon'
import { BusinessUnitsIcon } from '../../../components/icons/business-units-icon'
import { ClientsIcon } from '../../../components/icons/clients-icon'
import { DashboardIcon } from '../../../components/icons/dashboard-icon'
import { FinalAccountsIcon } from '../../../components/icons/final-accounts-icon'
import { InventoryIcon } from '../../../components/icons/inventory-icon'
import { MastersIcon } from '../../../components/icons/masters-icon'
import { OptionsIcon } from '../../../components/icons/options-icon'
import { PurchaseSalesIcon } from '../../../components/icons/purchase-sales-icon'
import { ReportsIcon } from '../../../components/icons/reports-icon'
import { RolesIcon } from '../../../components/icons/roles-icon'
import { SecuredControlsIcon } from '../../../components/icons/secured-controls-icon'
import { UsersIcon } from '../../../components/icons/users-icon'
import { VoucherIcon } from '../../../components/icons/voucher-icon'

export const MasterMenuData: MenuDataType = {
  admin: [
    {
      id: '1',
      label: 'Dashboard',
      icon: DashboardIcon,
      iconColorClass: 'text-primary-500',
      children: []
    },
    {
      id: '2',
      label: 'Business units',
      icon: BusinessUnitsIcon,
      iconColorClass: 'text-teal-500',
      children: []
      // path: 'purchase'
    },
    {
      id: '3',
      label: 'Roles',
      icon: RolesIcon,
      iconColorClass: 'text-red-500',
      children: [],
      path: 'purchase'
    },
    {
      id: '4',
      label: 'Business users',
      icon: UsersIcon,
      iconColorClass: 'text-amber-500',
      children: [],
      path: 'purchase'
    }
  ],
  superAdmin: [
    {
      id: '1',
      label: 'Dashboard',
      icon: DashboardIcon,
      iconColorClass: 'text-primary-500',
      children: []
    },
    {
      id: '2',
      label: 'Clients',
      icon: ClientsIcon,
      iconColorClass: 'text-teal-500',
      children: [],
      path: 'purchase'
    },
    {
      id: '3',
      label: 'Roles',
      icon: RolesIcon,
      iconColorClass: 'text-amber-500',
      children: [],
      path: 'purchase'
    },
    {
      id: '4',
      label: 'Secured controls',
      icon: SecuredControlsIcon,
      iconColorClass: 'text-red-500',
      children: [],
      path: 'purchase'
    },
    {
      id: '5',
      label: 'Admin users',
      icon: AdminUsersIcon,
      iconColorClass: 'text-red-500',
      children: [],
      path: 'purchase'
    }
  ],
  accounts: [
    {
      id: '1',
      label: 'Vouchers',
      icon: VoucherIcon,
      iconColorClass: 'text-primary-500',
      children: [
        {
          id: '11',
          label: 'Journals',
          path: 'purchase'
        },
        {
          id: '12',
          label: 'Payments',
          path: 'purchase'
        },
        {
          id: '13',
          label: 'Receipts',
          path: 'purchase'
        },
        {
          id: '14',
          label: 'Contra',
          path: 'purchase'
        }
      ]
    },
    {
      id: '2',
      label: 'Purch / Sales',
      icon: PurchaseSalesIcon,
      iconColorClass: 'text-secondary-500',
      children: [
        {
          id: '21',
          label: 'Purchase',
          path: 'purchase'
        },
        {
          id: '22',
          label: 'Purchase returns',
          path: 'purchase'
        },
        {
          id: '23',
          label: 'Sales',
          path: 'sales'
        },
        {
          id: '24',
          label: 'Sales returns',
          path: 'purchase'
        },
        {
          id: '25',
          label: 'Debit notes',
          path: 'purchase'
        },
        {
          id: '26',
          label: 'Credit notes',
          path: 'purchase'
        }
      ]
    },
    {
      id: '3',
      label: 'Masters',
      icon: MastersIcon,
      iconColorClass: 'text-red-500',
      children: [
        {
          id: '31',
          label: 'Company info',
          path: 'purchase'
        },
        {
          id: '32',
          label: 'General settings',
          path: 'purchase'
        },
        {
          id: '33',
          label: 'Accounts',
          path: 'purchase'
        },
        {
          id: '34',
          label: 'Opening balances',
          path: 'purchase'
        },
        {
          id: '35',
          label: 'Branches',
          path: 'purchase'
        },
        {
          id: '36',
          label: 'Financial years',
          path: 'purchase'
        }
      ]
    },
    {
      id: '4',
      label: 'Final accounts',
      icon: FinalAccountsIcon,
      iconColorClass: 'text-orange-500',
      children: [
        {
          id: '41',
          label: 'Trial balance',
          path: 'purchase'
        },
        {
          id: '42',
          label: 'Balance sheet',
          path: 'purchase'
        },
        {
          id: '43',
          label: 'PL account',
          path: 'purchase'
        },
        {
          id: '44',
          label: 'General ledger',
          path: 'purchase'
        }
      ]
    },
    {
      id: '5',
      label: 'Options',
      icon: OptionsIcon,
      iconColorClass: 'text-amber-500',
      children: [
        {
          id: '51',
          label: 'Bank recon',
          path: 'purchase'
        },
        {
          id: '52',
          label: 'Common utilities',
          path: 'purchase'
        },
        {
          id: '53',
          label: 'Exports',
          path: 'purchase'
        }
      ]
    },
    {
      id: '6',
      label: 'Reports',
      icon: ReportsIcon,
      iconColorClass: 'text-yellow-500',
      children: [
        {
          id: '61',
          label: 'All transactions',
          path: 'purchase'
        }
      ]
    },
    {
      id: '7',
      label: 'Inventory',
      icon: InventoryIcon,
      iconColorClass: 'text-teal-500',
      children: [
        {
          id: '71',
          label: 'Categories',
          path: 'purchase'
        },
        {
          id: '72',
          label: 'Brands',
          path: 'purchase'
        },
        {
          id: '73',
          label: 'Products',
          path: 'purchase'
        },
        {
          id: '74',
          label: 'Opening stock',
          path: 'purchase'
        },
        {
          id: '75',
          label: 'Reports',
          path: 'purchase'
        },
        {
          id: '76',
          label: 'Stock journal',
          path: 'purchase'
        }
      ]
    }
  ]
}

export type MenuDataItemType = {
  id: string
  label: string
  icon: any
  iconColorClass: string
  children: Array<ChildMenuItemType>
  path?: string
}

export type MenuDataType = {
  admin: MenuDataItemType[]
  superAdmin: MenuDataItemType[]
  accounts: MenuDataItemType[]
}

export type ChildMenuItemType = {
  id: string
  label: string
  path: string
}
