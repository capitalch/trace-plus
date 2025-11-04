import { RouterProvider } from 'react-router-dom'
import './App.css'
import { appRouter } from './app/router/app-router'
import { GlobalContext, defaultGlobalContext } from './app/global-context'

function App() {
  return (
    <GlobalContext.Provider value={defaultGlobalContext}>
      <RouterProvider router={appRouter} />
    </GlobalContext.Provider>
  )
}

export default App
