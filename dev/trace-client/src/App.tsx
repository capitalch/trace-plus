import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
// import { useSelector } from 'react-redux'
// import { isLoggedInSelectorFn } from './app/app-slice'
import { Layouts } from './features/layouts/layouts'
// import { Login } from './features/login/login'
import { Protected } from './features/layouts/protected'
import { Login } from './features/login/login'
function App() {
  // const isLoggedInSelector: boolean = useSelector(isLoggedInSelectorFn)
  // const Comp = getComponent()
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Protected>
        <Layouts />
      </Protected>
    },
    {
      path: '/login',
      element: <Login />
    }
  ])

  return (
    <RouterProvider router={router} />
  )

  // function getComponent() {
  //   const Ret = isLoggedInSelector ? Layouts : Login
  //   return (Ret)
  // }
}

export default App
