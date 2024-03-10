import { RouterProvider } from 'react-router-dom'
import './App.css'
import { appRouter } from './app/router/app-router'
import { createContext } from 'react'
import { AppGlobalContextType, appContext } from './app/app-global-context'

export const AppGlobalContext = createContext<AppGlobalContextType>({ accessToken: undefined })
function App() {
  return (
    <AppGlobalContext.Provider value={appContext}>
      <RouterProvider router={appRouter} />
    </AppGlobalContext.Provider>
  )
}

export default App
