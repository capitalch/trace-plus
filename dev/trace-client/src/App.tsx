import { RouterProvider } from 'react-router-dom'
import './App.css'
import { appRouter } from './app/router/app-router'
import { createContext } from 'react'
import { GlobalContextType, defaultGlobalContext } from './app/global-context'

export const GlobalContext = createContext<GlobalContextType>(defaultGlobalContext)
function App() {
  return (
    <GlobalContext.Provider value={defaultGlobalContext}>
      <RouterProvider router={appRouter} />
    </GlobalContext.Provider>
  )
}

export default App
