import { BrowserRouter, Route, Routes, } from 'react-router-dom'
import './App.css'
import { Layouts } from './features/layouts/layouts'
import { Login } from './features/layouts/login/login'
import { Protected } from './features/layouts/protected'
import { Test } from './features/layouts/test'

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
        </Route>
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App