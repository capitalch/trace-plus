import { SignalsStore } from './signals-store'

enum UserTypesEnum {
  'SUPER_ADMIN' = 'S',
  'ADMIN' = 'A',
  'BUSINESS_USER' = 'B'
}

function getUserTypeName (): string {
  const userTypes: any = {
    0: 'Super admin user',
    1: 'Admin user',
    2: 'Business user'
  }
  return userTypes[SignalsStore.login.userType.value]
}

type NavbarMenuItemType = 'accounts' | 'admin' | 'superAdmin' | ''
// const NavbarMenuItems:string[] = ['accounts', 'admin', 'superAdmin']

export { getUserTypeName,type NavbarMenuItemType, UserTypesEnum }
