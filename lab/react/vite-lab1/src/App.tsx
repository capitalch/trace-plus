import { createContext } from 'react'
import './App.css'
import { Layouts } from './features/navigation/layouts/layouts'
// import { ArrayTrick } from './features/array-trick/array-trick'
// import { Counter } from './features/redux-counter/counter'
// import { SignalsCounter } from './features/signals-counter/signals-counter'
import { Counter } from './features/redux-counter/counter'
// import { LoginForm } from './features/login-form/login-form'
// import { ReactQueryComp } from './features/react-query/react-query-comp'
// import { Test } from './features/test'

export const GlobalContext: any = createContext({})
function App() {

  return (
    <GlobalContext.Provider value={{ profile: { name: 'Sushant', address: '12 J.L' } }}>
      <div className=''>
        <Layouts />
        <Counter />
        {/* <SignalsCounter /> */}
        {/* <ArrayTrick /> */}
        {/* <LoginForm /> */}
        {/* <ReactQueryComp /> */}
      </div>
    </GlobalContext.Provider>
  )
}

export default App