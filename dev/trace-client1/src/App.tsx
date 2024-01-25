import { BrowserRouter, Route, Routes, } from 'react-router-dom'
import './App.css'
import { Layouts } from './features/navigation/layouts'
import { Login } from './features/login/login'
import { Protected } from './features/login/protected'
import { getAppRoutes } from './app/app-routes'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <Protected>
            <Layouts />
          </Protected>
        }>
          {/* Nested routes */}
          {getAppRoutes()}
          
        </Route>
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App