import './App.css'
import { Counter } from './features/counter/counter'
import { ReactQueryComp } from './features/react-query/react-query-comp'
// import { Test } from './features/test'

function App() {

  return (
    <div className=''>
      <Counter />
      <ReactQueryComp />
    </div>
  )
}

export default App