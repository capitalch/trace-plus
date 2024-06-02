import { IconAdminUsers } from '../../components/icons/icon-admin-users'
import { IconBusinessUnits } from '../../components/icons/icon-business-units'
import { ClientsIcon } from '../../components/icons/clients-icon'
import { DashboardIcon } from '../../components/icons/dashboard-icon'
import { FinalAccountsIcon } from '../../components/icons/final-accounts-icon'
import { InventoryIcon } from '../../components/icons/inventory-icon'
import { MastersIcon } from '../../components/icons/masters-icon'
import { OptionsIcon } from '../../components/icons/options-icon'
import { PurchaseSalesIcon } from '../../components/icons/purchase-sales-icon'
import { ReportsIcon } from '../../components/icons/reports-icon'
import { RolesIcon } from '../../components/icons/roles-icon'
import { SecuredControlsIcon } from '../../components/icons/secured-controls-icon'
import { UsersIcon } from '../../components/icons/users-icon'
import { VoucherIcon } from '../../components/icons/voucher-icon'

export const MasterMenuData: MenuDataType = {
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
          path: '/blogs'
        },
        {
          id: '12',
          label: 'Payments',
          path: '/blogs'
        },
        {
          id: '13',
          label: 'Receipts',
          path: '/blogs'
        },
        {
          id: '14',
          label: 'Contra',
          path: '/blogs'
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
          path: '/blogs'
        },
        {
          id: '22',
          label: 'Purchase returns',
          path: '/blogs'
        },
        {
          id: '23',
          label: 'Sales',
          path: 'sales'
        },
        {
          id: '24',
          label: 'Sales returns',
          path: '/blogs'
        },
        {
          id: '25',
          label: 'Debit notes',
          path: '/blogs'
        },
        {
          id: '26',
          label: 'Credit notes',
          path: '/blogs'
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
          path: '/blogs'
        },
        {
          id: '32',
          label: 'General settings',
          path: '/blogs'
        },
        {
          id: '33',
          label: 'Accounts',
          path: '/blogs'
        },
        {
          id: '34',
          label: 'Opening balances',
          path: '/blogs'
        },
        {
          id: '35',
          label: 'Branches',
          path: '/blogs'
        },
        {
          id: '36',
          label: 'Financial years',
          path: '/blogs'
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
          path: '/blogs'
        },
        {
          id: '42',
          label: 'Balance sheet',
          path: '/blogs'
        },
        {
          id: '43',
          label: 'PL account',
          path: '/blogs'
        },
        {
          id: '44',
          label: 'General ledger',
          path: '/blogs'
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
          path: '/blogs'
        },
        {
          id: '52',
          label: 'Common utilities',
          path: '/blogs'
        },
        {
          id: '53',
          label: 'Exports',
          path: '/blogs'
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
          path: '/blogs'
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
          path: '/blogs'
        },
        {
          id: '72',
          label: 'Brands',
          path: '/blogs'
        },
        {
          id: '73',
          label: 'Products',
          path: '/blogs'
        },
        {
          id: '74',
          label: 'Opening stock',
          path: '/blogs'
        },
        {
          id: '75',
          label: 'Reports',
          path: '/blogs'
        },
        {
          id: '76',
          label: 'Stock journal',
          path: '/blogs'
        }
      ]
    }
  ],
  admin: [
    {
      id: '8',
      label: 'Dashboard',
      icon: DashboardIcon,
      iconColorClass: 'text-primary-500',
      children: []
    },
    {
      id: '9',
      label: 'Business units',
      icon: IconBusinessUnits,
      iconColorClass: 'text-teal-500',
      children: []
      // path: 'purchase'
    },
    {
      id: '10',
      label: 'Roles',
      icon: RolesIcon,
      iconColorClass: 'text-red-500',
      children: [],
      path: '/blogs'
    },
    {
      id: '11',
      label: 'Business users',
      icon: UsersIcon,
      iconColorClass: 'text-amber-500',
      children: [],
      path: '/blogs'
    }
  ],
  superAdmin: [
    {
      id: '12',
      label: 'Dashboard',
      icon: DashboardIcon,
      iconColorClass: 'text-primary-500',
      children: [],
      path: '/super-admin-dashboard'
    },
    {
      id: '13',
      label: 'Clients',
      icon: ClientsIcon,
      iconColorClass: 'text-teal-500',
      children: [],
      path: '/super-admin-clients'
    },
    {
      id: '14',
      label: 'Roles',
      icon: RolesIcon,
      iconColorClass: 'text-amber-500',
      children: [],
      path: '/blogs'
    },
    {
      id: '15',
      label: 'Secured controls',
      icon: SecuredControlsIcon,
      iconColorClass: 'text-red-500',
      children: [],
      path: '/blogs'
    },
    {
      id: '16',
      label: 'Admin users',
      icon: IconAdminUsers,
      iconColorClass: 'text-red-500',
      children: [],
      path: '/blogs'
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
