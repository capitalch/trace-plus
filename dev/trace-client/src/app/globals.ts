import { SignalsStore } from './signals-store'

enum UserTypesEnum {
  'SUPER_ADMIN',
  'ADMIN',
  'BUSINESS_USER'
}

function getUserTypeName (): string {
  const userTypes: any = {
    0: 'Super admin user',
    1: 'Admin user',
    2: 'Business user'
  }
  return userTypes[SignalsStore.login.userType.value]
}

export { getUserTypeName, UserTypesEnum }
