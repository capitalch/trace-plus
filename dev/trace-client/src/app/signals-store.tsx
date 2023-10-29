import { Signal, signal } from '@preact/signals-react'
import _ from 'lodash'

const SignalsStoreT: SignalsStoreType = {
    main: {
        hideSideBarClicked: false,
        showSidBarClicked: false,
    },
    login: {
        isLoggedIn: signal(false),
    }
}

const SignalsStore: SignalsStoreType = _.cloneDeep(SignalsStoreT)

type SignalsStoreType = {
    main: {
        hideSideBarClicked: boolean
        showSidBarClicked: boolean
    },
    login: {
        isLoggedIn: Signal<boolean>
    }

}

export { SignalsStore }