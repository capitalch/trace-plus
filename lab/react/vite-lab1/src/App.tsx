import './App.css'
import { ArrayTrick } from './features/array-trick/array-trick'
import { Counter } from './features/redux-counter/counter'
import { SignalsCounter } from './features/signals-counter/signals-counter'
// import { LoginForm } from './features/login-form/login-form'
// import { ReactQueryComp } from './features/react-query/react-query-comp'
// import { Test } from './features/test'

function App() {

  return (
    <div className=''>
      <Counter />
      <SignalsCounter />
      <ArrayTrick />
      {/* <LoginForm /> */}
      {/* <ReactQueryComp /> */}
    </div>
  )
}

export default App