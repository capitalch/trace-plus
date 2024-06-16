import { RouterProvider } from 'react-router-dom'
import './App.css'
import { appRouter } from './app/router/app-router'
import { createContext } from 'react'
import { GlobalContextType, defaultGlobalContext } from './app/global-context'
import { PrimeReactProvider } from 'primereact/api'

export const GlobalContext = createContext<GlobalContextType>(defaultGlobalContext)
function App() {
  return (
    <GlobalContext.Provider value={defaultGlobalContext}>
      <PrimeReactProvider>
        <RouterProvider router={appRouter} />
      </PrimeReactProvider>
    </GlobalContext.Provider>
  )
}

export default App
