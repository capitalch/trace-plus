import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './app/store/store.ts'
import { ApolloProvider } from '@apollo/client'
import {registerLicense} from '@syncfusion/ej2-base'
import { getApolloClient } from './app/graphql/apollo-client.ts'

const apolloClient = getApolloClient()
// registerLicense('Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXlcd3RRQmNeV0d0XUY=')
// registerLicense('Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXZceXVRR2heWEdyXks=')
registerLicense('Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWH9ecXRRRGZdVkN2XEY=')
ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </Provider>
  // </React.StrictMode>,
)
