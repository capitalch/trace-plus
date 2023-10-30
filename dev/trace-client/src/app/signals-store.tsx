import { Signal, signal } from '@preact/signals-react'
import _ from 'lodash'

const SignalsStoreT: SignalsStoreType = {

    layouts: {
        hideSideBarClicked: false,
        showSidBarClicked: false,
    },

    login: {
        isLoggedIn: signal(false),
        uid: signal(''),
        email: signal(''),
        userType: signal(0)
    }
}

const SignalsStore: SignalsStoreType = _.cloneDeep(SignalsStoreT)

type SignalsStoreType = {

    layouts: {
        hideSideBarClicked: boolean
        showSidBarClicked: boolean
    },

    login: {
        isLoggedIn: Signal<boolean>
        uid: Signal<string>
        email: Signal<string>
        userType: Signal<number>
    }

}

export { SignalsStore }