import { Signal, signal } from '@preact/signals-react'
import _ from 'lodash'

const SignalsStoreT: SignalsStoreType = {
    main: {
        count: signal(0),
        // isSideBar: signal(true),
        hideSideBarClicked: false,
        showSidBarClicked: false
    },
    login: {
        isLoggedIn: signal(false),
    }
}

const SignalsStore: SignalsStoreType = _.cloneDeep(SignalsStoreT)

type SignalsStoreType = {
    main: {
        count: Signal<number>
        // isSideBar: Signal<boolean>
        hideSideBarClicked: boolean
        showSidBarClicked: boolean
    },
    login: {
        isLoggedIn: Signal<boolean>
    }
}

export { SignalsStore }