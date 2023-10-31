import { Signal, signal } from '@preact/signals-react'
import _ from 'lodash'

const SignalsStoreT: SignalsStoreType = {

    layouts: {
        isSideBarOpen: signal(undefined),

        // hideSideBarClicked: false,
        // showSidBarClicked: false,
        // showHideClass: signal('')
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

        // hideSideBarClicked: boolean
        // showSidBarClicked: boolean
        // showHideClass: Signal<'block' | 'hidden' | ''>
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