import './App.css'
import { SignalsStore } from './app/signals-store'
import { Layouts } from './features/layouts/layouts'
import { Login } from './features/layouts/login'

function App() {

  return (
    <div id='app' className=''>
      {/* <Login /> */}
      {SignalsStore.main.login.isLoggedIn.value ? <Layouts /> : <Login />}
    </div>
  )
}

export default App
