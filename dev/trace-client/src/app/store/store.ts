import { configureStore } from '@reduxjs/toolkit'
import { layoutsReducer } from '../../features/layouts/layouts-slice'
import { loginReducer } from '../../features/login/login-slice'
import { queryHelperReducer } from '../graphql/query-helper-slice'

export const store = configureStore({
  reducer: {
    queryHelper: queryHelperReducer,
    layouts: layoutsReducer,
    login: loginReducer
  }
})

export type RootStateType = ReturnType<typeof store.getState>
export type AppDispatchType = typeof store.dispatch
