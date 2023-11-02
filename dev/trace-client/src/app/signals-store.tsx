import { Signal, signal } from '@preact/signals-react'
import _ from 'lodash'
import { NavbarMenuItemType } from './globals'

const SignalsStoreT: SignalsStoreType = {

    layouts: {
        isSideBarOpen: signal(undefined),
        navbar: {
            toShowAdminMenuItem: signal(false),
            toShowAccountsMenuItem: signal(false),
            toShowSuperAdminMenuItem: signal(false),
            activeMenuItem: signal(''),

            toShowDropdownMenu: signal(false)
        },
        sidebar:{
            currentMenuComponent: signal(<></>)
        }
    },

    login: {
        isLoggedIn: signal(false),
        uid: signal(''),
        email: signal(''),
        userType: signal(0)
    }
}

let SignalsStore: SignalsStoreType = _.cloneDeep(SignalsStoreT)

type SignalsStoreType = {

    layouts: {
        isSideBarOpen: Signal<boolean | undefined>,
        navbar: {
            toShowAdminMenuItem: Signal<boolean>
            toShowAccountsMenuItem: Signal<boolean>
            toShowSuperAdminMenuItem: Signal<boolean>
            activeMenuItem: Signal<NavbarMenuItemType>

            toShowDropdownMenu: Signal<boolean>
        },
        sidebar:{
            currentMenuComponent: Signal<any>
        }
    },

    login: {
        isLoggedIn: Signal<boolean>
        uid: Signal<string>
        email: Signal<string>
        userType: Signal<number>
    }

}

function doLogout() {
    SignalsStore.login.isLoggedIn.value = false
    SignalsStore = _.cloneDeep(SignalsStoreT)
}

// eslint-disable-next-line react-refresh/only-export-components
export { doLogout, SignalsStore }