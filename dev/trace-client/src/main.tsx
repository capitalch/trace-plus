import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './app/store/store.ts'
import { ApolloProvider } from '@apollo/client'
import {registerLicense} from '@syncfusion/ej2-base'
import { getApolloClient } from './app/graphql/apollo-client.ts'

const apolloClient = getApolloClient()
//registerLicense('Ngo9BigBOggjHTQxAR8/V1NMaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWH1feXVWRWNcUUZwXEs=') //28.x license 
// registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF5cXmBCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXledXRcR2VZU0RxXkdWYUA=') // 29.x
registerLicense('Ngo9BigBOggjHTQxAR8/V1JEaF5cXmRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXhfcnRcQ2JYUEZwWUBWYEk=') // v30.x.x
ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </Provider>
  // </React.StrictMode>,
)
