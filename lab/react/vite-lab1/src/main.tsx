import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PrimeReactProvider } from 'primereact/api';
// import { RouterProvider } from 'react-router-dom'
// import { router } from './features/react-router/react-router.tsx'

const twentyFourHoursInMs = 1000 * 60 * 60 * 24;
const queryClient = new QueryClient(
  {
    defaultOptions: {
      queries: {
        // refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
        staleTime: twentyFourHoursInMs,
      },
    }
  }
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <>
    {/* <RouterProvider router={router} /> */}
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PrimeReactProvider value={{ unstyled: true }}>
          <App />
        </PrimeReactProvider  >
      </Provider>
    </QueryClientProvider>
  </>
  // </React.StrictMode>,
)
