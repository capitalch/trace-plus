import { RouterProvider } from 'react-router-dom'
import './App.css'
import { appRouter } from './app/app-router'
// import { Comp1 } from './components/controls/comp1'
import { createContext } from 'react'
import { AppGlobalContextType, appContext } from './app/app-global-context'
// import { useSelector } from 'react-redux'
// import { isLoggedInSelectorFn } from './app/app-slice'

export const AppGlobalContext = createContext<AppGlobalContextType>({})
function App() {
  // const isLoggedIn = useSelector(isLoggedInSelectorFn)
  // console.log(isLoggedIn)
  return (
    <AppGlobalContext.Provider value={appContext}>
      <RouterProvider router={appRouter} />
      {/* <Comp1 /> */}
    </AppGlobalContext.Provider>

  )
}

export default App
