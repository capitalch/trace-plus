import { RouterProvider} from 'react-router-dom'
import './App.css'
import { appRouter} from './app/app-router'
import { Comp1 } from './components/controls/comp1'

function App() {
  return (
    <div id='app-root' className=''>
      <Comp1 />
      <RouterProvider router={appRouter} />
    </div>
    
  )
}

export default App
