import { Signal, signal } from '@preact/signals-react'
import _ from 'lodash'

const SignalsStoreT: SignalsStoreType = {
    layouts: {
        isSideBarOpen: signal(undefined),
    },
}

const SignalsStore: SignalsStoreType = _.cloneDeep(SignalsStoreT)

type SignalsStoreType = {
    layouts: {
        isSideBarOpen: Signal<boolean | undefined>,
    },
    
}


// eslint-disable-next-line react-refresh/only-export-components
export {SignalsStore }