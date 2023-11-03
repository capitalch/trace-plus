import { BrowserRouter, Route, Routes, } from 'react-router-dom'
import './App.css'
import { Layouts } from './features/navigation/layouts'
import { Login } from './features/login/login'
import { Protected } from './features/login/protected'
import { Test } from './features/login/test'
import { Purchase } from './features/accounts/purchase/purchase'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <Protected>
            <Layouts />
          </Protected>
        }>
          {/* Nested route */}
          <Route path='test' element={<Test />} />
          <Route path='purchase' element={<Purchase />} />
        </Route>
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App