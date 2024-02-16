import { BusinessUnitsIcon } from '../../../components/icons/business-units-icon'
import { DashboardIcon } from '../../../components/icons/dashboard-icon'
import { RolesIcon } from '../../../components/icons/roles-icon'
import { UsersIcon } from '../../../components/icons/users-icon'

export const MasterMenuData: MenuDataType = {
  admin: [
    {
      id: '1',
      label: 'Dashboard',
      icon: DashboardIcon,
      children: []
    },
    {
      id: '2',
      label: 'Business units',
      icon: BusinessUnitsIcon,
      children: [],
      path: 'purchase'
    },
    {
      id: '3',
      label: 'Roles',
      icon: RolesIcon,
      children: [],
      path: 'purchase'
    },
    {
      id: '4',
      label: 'Business users',
      icon: UsersIcon,
      children: [],
      path: 'purchase'
    }
  ],
  superAdmin: [],
  accounts: []
}

type MenuDataItemType = {
  id: string
  label: string
  icon: any
  children: Array<ChildMenuItemType>
  path?: string
}

type MenuDataType = {
  admin: MenuDataItemType[]
  superAdmin: MenuDataItemType[]
  accounts: MenuDataItemType[]
}

type ChildMenuItemType = {
  id: string
  label: string
  path: string
}
