import { Signal, signal } from '@preact/signals-react'
import _ from 'lodash'
import { NavbarMenuItemType } from './globals'
import { FC } from 'react'

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
        sidebar: {
            currentMenuComponent: signal(<></>)
        }
    },

    login: {
        isLoggedIn: signal(false),
        uid: signal(''),
        email: signal(''),
        userType: signal('')
    },

    modalDialogA: {
        body: signal(() => <></>),
        defaultData: signal(undefined),
        isOpen: signal(false),
        isCentered: false,
        size: signal('md'),
        title: signal(''),
        toShowCloseButton: signal(false),
    },

    modalDialogB: {
        body: signal(() => <></>),
        defaultData: signal(undefined),
        isOpen: signal(false),
        isCentered: false,
        size: signal('md'),
        title: signal(''),
        toShowCloseButton: signal(false),
    },
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
        sidebar: {
            currentMenuComponent: Signal<any>
        }
    },

    login: {
        isLoggedIn: Signal<boolean>
        uid: Signal<string>
        email: Signal<string>
        userType: Signal<string>
    },

    modalDialogA: {
        body: Signal<FC>
        defaultData: Signal<any>
        isOpen: Signal<boolean>
        isCentered?: boolean
        size: Signal<'md' | 'sm' | 'lg'>
        title: Signal<string>
        toShowCloseButton: Signal<boolean>
    },

    modalDialogB: {
        body: Signal<FC>,
        defaultData: Signal<any>,
        isOpen: Signal<boolean>,
        isCentered?: boolean,
        size: Signal<'md' | 'sm' | 'lg' | 'md'>,
        title: Signal<string>,
        toShowCloseButton: Signal<boolean>,
    },

}

function doLogout() {
    SignalsStore.login.isLoggedIn.value = false
    SignalsStore = _.cloneDeep(SignalsStoreT)
}

// eslint-disable-next-line react-refresh/only-export-components
export { doLogout, SignalsStore }