import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'
import { ApolloProvider } from '@apollo/client/react'
import {registerLicense} from '@syncfusion/ej2-base'
import { getApolloClient } from './app/graphql/apollo-client.ts'

const apolloClient = getApolloClient()
// registerLicense('Ngo9BigBOggjHTQxAR8/V1JEaF5cXmRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXhfcnRcQ2JYUEZwWUBWYEk=') // v30.x.x
registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF5cXGRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXZednRdRGJYWUR+WUFWYEg=') // v31.x.x
ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </Provider>
  // </React.StrictMode>,
)
