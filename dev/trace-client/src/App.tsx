import { RouterProvider } from 'react-router-dom'
import './App.css'
import { appRouter } from './app/router/app-router'
import { GlobalContext, defaultGlobalContext } from './app/global-context'
import { PrimeReactProvider } from 'primereact/api'

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
