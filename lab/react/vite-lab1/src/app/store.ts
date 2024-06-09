import { configureStore } from '@reduxjs/toolkit'
import { counterReducer } from '../features/redux-counter/counter-slice'

export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
})

export type RootStateType = ReturnType<typeof store.getState>
export type AppDispatcherType = typeof store.dispatch
