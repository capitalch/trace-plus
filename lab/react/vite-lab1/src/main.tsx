import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import { QueryClient, QueryClientProvider } from 'react-query'
// import { PrimeReactProvider } from 'primereact/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'

import { registerLicense } from '@syncfusion/ej2-base'
import { store } from './app/store.ts'
import { Provider } from 'react-redux'
// import { RouterProvider } from 'react-router-dom'
// import { router } from './features/react-router/react-router.tsx'
registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXlecnVRR2NdWEJwXUE=')
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

const apolloClient = new ApolloClient({
  // uri: 'https://graphqlzero.almansi.me/api', // Mock server for GraphQL API requests
  // uri: 'http://localhost:5000',
  uri: 'http://localhost:8000/graphql',
  cache: new InMemoryCache()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <>
    {/* <RouterProvider router={router} /> */}
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          {/* <PrimeReactProvider value={{ unstyled: true }}> */}
          <App />
          {/* </PrimeReactProvider  > */}
        </Provider>
      </QueryClientProvider>
    </ApolloProvider>
  </>
  // </React.StrictMode>,
)
