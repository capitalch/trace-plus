import { configureStore } from '@reduxjs/toolkit'
import { layoutsReducer } from '../../features/layouts/layouts-slice'
import { loginReducer } from '../../features/login/login-slice'
import { queryHelperReducer } from '../graphql/query-helper-slice'
import { accountsReducer } from '../../features/accounts/accounts-slice'
import { reduxCompReducer } from '../../controls/redux-components/comp-slice'

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    queryHelper: queryHelperReducer,
    layouts: layoutsReducer,
    login: loginReducer,
    reduxComp: reduxCompReducer
  }
})

export type RootStateType = ReturnType<typeof store.getState>
export type AppDispatchType = typeof store.dispatch
