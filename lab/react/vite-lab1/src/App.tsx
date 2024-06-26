import { createContext } from 'react'
import './App.css'
// import { Layouts } from './features/navigation/layouts/layouts'
// import { ArrayTrick } from './features/array-trick/array-trick'
// import { Counter } from './features/redux-counter/counter'
// import { SignalsCounter } from './features/signals-counter/signals-counter'
// import { Counter } from './features/redux-counter/counter'
// import { RouterProvider } from 'react-router-dom'
// import { router } from './features/react-router/react-router'
// import { ToastError } from './features/sweetalert2/toast-error'
// import { LoginForm } from './features/login-form/login-form'
// import { ReactQueryComp } from './features/react-query/react-query-comp'
// import { Test } from './features/test'
// import { Office } from './features/react-context/office'
// import { OfficeContext } from './features/react-context/office-context'
// import { ClickAwayComp1 } from './features/click-away/click-away-comp1'
// import { ReactPassHtmlPtops } from './features/react-pass-props/react-pass-html-props'
// import { ReactQueryComp1 } from './features/react-query/react-query-comp1'
// import { ReactQueryComp2 } from './features/react-query/react-query-comp2';
// import { ApolloGraphQLComp1 } from './features/apollo-graphql/apollo-graphql-comp1';
// import { ApolloGraphQLComp2 } from './features/apollo-graphql/apollo-graphql-comp2';
import { PrimeReact } from './features/prime-react/PrimeReact';
import { PrimeReactProvider } from 'primereact/api'
// import { DeepObjectReset } from './features/deep-object-reset/deep-object-reset'
import 'primereact/resources/themes/nova/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
// import { ToastContainer } from 'react-toastify'
// import { ReactToastify } from './features/react-toastify/ReactToastify';
import 'react-toastify/dist/ReactToastify.css';
// import { SyncfusionGrid } from './features/syncfusion/syncfusion-grid';
import { Counter } from './features/redux-counter/counter';
import { ReactTooltip, ReactTooltip1Control } from './features/tooltip/react-tooltip';
import { Violations } from './features/Misc/violations';
export const GlobalContext: any = createContext({})

function App() {
  
  return (
    <GlobalContext.Provider value={{ profile: { name: 'Sushant', address: '12 J.L' } }}>
      <PrimeReactProvider value = {{appendTo:'self'}} >
        {/* <RouterProvider router={router} /> */}
        {/* <Counter /> */}
        {/* <OfficeContext.Provider value={{ standardSelect: { brandID: () => { } } }}>
        <Office />
      </OfficeContext.Provider> */}
        {/* <ClickAwayComp1 /> */}
        {/* <ReactPassHtmlPtops /> */}
        {/* <ReactQueryComp1 />
      <ReactQueryComp2 /> */}
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
        {/* <div className='flex'>
        <ApolloGraphQLComp1 />
        <ApolloGraphQLComp2 />
      </div> */}
        <PrimeReact />
        {/* <ToastContainer />
      <ReactToastify />
      <SyncfusionGrid /> */}
        <Counter />
        <ReactTooltip />
        <ReactTooltip1Control />
        <Violations />
      </PrimeReactProvider>
    </GlobalContext.Provider>
  )
}

export default App