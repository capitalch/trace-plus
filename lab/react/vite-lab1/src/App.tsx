import { createContext } from 'react'
import './App.css'
// import { Layouts } from './features/navigation/layouts/layouts'
// import { ArrayTrick } from './features/array-trick/array-trick'
// import { Counter } from './features/redux-counter/counter'
// import { SignalsCounter } from './features/signals-counter/signals-counter'
import { Counter } from './features/redux-counter/counter'
import { RouterProvider } from 'react-router-dom'
import { router } from './features/react-router/react-router'
// import { ToastError } from './features/sweetalert2/toast-error'
// import { LoginForm } from './features/login-form/login-form'
// import { ReactQueryComp } from './features/react-query/react-query-comp'
// import { Test } from './features/test'
import 'primeicons/primeicons.css';
import { Office } from './features/react-context/office'
import { OfficeContext } from './features/react-context/office-context'
import { ClickAwayComp1 } from './features/click-away/click-away-comp1'
// import { DeepObjectReset } from './features/deep-object-reset/deep-object-reset'

export const GlobalContext: any = createContext({})

function App() {

  return (
    <GlobalContext.Provider value={{ profile: { name: 'Sushant', address: '12 J.L' } }}>
      <RouterProvider router={router} />
      <Counter />
      <OfficeContext.Provider value={{ standardSelect: { brandID: () => { } } }}>
        <Office />
      </OfficeContext.Provider>
      <ClickAwayComp1 />
      {/* <ToastError /> */}
      {/* <DeepObjectReset /> */}
      {/* <div className=''> */}
      {/* <Layouts />
         */}
      {/* <SignalsCounter /> */}
      {/* <ArrayTrick /> */}
      {/* <LoginForm /> */}
      {/* <ReactQueryComp /> */}
      {/* </div> */}
    </GlobalContext.Provider>
  )
}

export default App