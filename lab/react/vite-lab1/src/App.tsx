import { createContext } from 'react'
import './App.css'
// import { Layouts } from './features/navigation/layouts/layouts'
// import { ArrayTrick } from './features/array-trick/array-trick'
// import { Counter } from './features/redux-counter/counter'
// import { SignalsCounter } from './features/signals-counter/signals-counter'
// import { Counter } from './features/redux-counter/counter'
// import { RouterProvider } from 'react-router-dom'
// import { router } from './features/react-router/react-router'
// import { ToastError } from './features/sweetalert2/toast-error'
// import { LoginForm } from './features/login-form/login-form'
// import { ReactQueryComp } from './features/react-query/react-query-comp'
// import { Test } from './features/test'
// import { Office } from './features/react-context/office'
// import { OfficeContext } from './features/react-context/office-context'
// import { ClickAwayComp1 } from './features/click-away/click-away-comp1'
// import { ReactPassHtmlPtops } from './features/react-pass-props/react-pass-html-props'
// import { ReactQueryComp1 } from './features/react-query/react-query-comp1'
// import { ReactQueryComp2 } from './features/react-query/react-query-comp2';
// import { ApolloGraphQLComp1 } from './features/apollo-graphql/apollo-graphql-comp1';
// import { ApolloGraphQLComp2 } from './features/apollo-graphql/apollo-graphql-comp2';
// import { PrimeReact } from './features/prime-react/PrimeReact';
// import { PrimeReactProvider } from 'primereact/api'
// import { DeepObjectReset } from './features/deep-object-reset/deep-object-reset'
import 'primereact/resources/themes/nova/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
// import { ToastContainer } from 'react-toastify'
// import { ReactToastify } from './features/react-toastify/ReactToastify';
import 'react-toastify/dist/ReactToastify.css';
// import { ReactSelectTypeAheadAsync } from './features/react-select/react-select-type-ahead-async'
// import { ReactSelectTypeAhead } from './features/react-select/react-select-type-ahead'
// import { ReactSelectTypeAheadAsync1 } from './features/react-select/react-select-type-ahead-async1'
// import { ApolloGraphQLComp1 } from './features/apollo-graphql/apollo-graphql-comp1'
// import { ApolloGraphQLComp2 } from './features/apollo-graphql/apollo-graphql-comp2'
// import { ApolloGraphQL03112024 } from './features/apollo-graphql/apollo-graphql-03-10-2024'
// import { ReactSelectTypeAheadAsync } from './features/react-select/react-select-type-ahead-async'
// import { ReactSelectTypeAhead } from './features/react-select/react-select-type-ahead'
// import { ReactSelectTypeAheadAsync1 } from './features/react-select/react-select-type-ahead-async1'
// import { ReactSelectAsync } from './features/react-select/react-select-async'
// import { SyncfusionTreeGrid } from './features/syncfusion/syncfusion-tree-grid'
// import { TreeGrid2 } from './features/syncfusion/tree-grid2'
import { SyncfusionGrid } from './features/syncfusion/syncfusion-grid'
import { InjectSummary } from './features/Misc/inject-summary'
import { SlidingPaneViewer } from './features/react-sliding-pane/slide-pane-viewer'
import { EditGrid } from './features/syncfusion/edit-grid'
import { Spinners } from './features/spinners/spinners'
import { SyncfusionTreeGrid } from './features/syncfusion/syncfusion-tree-grid'
import { SyncfusionTreeGrid1 } from './features/syncfusion/syncfusion-tree-grid1'
import { SyncFusionTreeGridEditTemplate } from './features/syncfusion/syncfusion-tree-grid-edit-template'
import { SyncFusionTreeGridEditTemplate1 } from './features/syncfusion/syncfusion-tree-grid-edit-template1'
import { ReactDatePicker } from './features/react-datepicker/react-date-picker'
import { ExportDropDown } from './features/Misc/export-drop-down'
// import DynamicFilteringGrid from './features/syncfusion/dynamic-filtering-grid'
import GenericFilteringGridContainer from './features/syncfusion/filtering/generic-filtering-grid-container'
import ReportAllTransactionsFilter from './features/ai-generated/report-all-transactions-filter'
import CompactTransactionFilter from './features/ai-generated/show-filtered-values'
import { NewEditProduct } from './features/Misc/new-edit-product'
import { NewEditProduct1 } from './features/Misc/new-edit-product1'
import ProductForm from './features/Misc/product-form'
import BranchTransfer from './features/Misc/branch-transfer-form'
import { TabExample } from './features/Misc/tabs/tab-example'
import BranchTransferForm1 from './features/Misc/branch-transfer-form1'
// import ReportAllTransactionsFilter1 from './features/ai-generated/report-all-transactions-filter1'
// import { KeyToJson } from './features/unique-key-to-json/key-to-json'
// import { GridDragAndDrop } from './features/syncfusion/gridDragAndDrop'
// import { SyncfusionGrid } from './features/syncfusion/syncfusion-grid';
// import { Counter } from './features/redux-counter/counter';
// import { ReactTooltip, ReactTooltip1Control } from './features/tooltip/react-tooltip';
// import { Violations } from './features/Misc/violations';
export const GlobalContext: any = createContext({})

function App() {

  return (
    <GlobalContext.Provider value={{ profile: { name: 'Sushant', address: '12 J.L' } }}>
      {/* <PrimeReactProvider value = {{appendTo:'self'}} > */}
      {/* <RouterProvider router={router} /> */}
      {/* <Counter /> */}
      {/* <OfficeContext.Provider value={{ standardSelect: { brandID: () => { } } }}>
        <Office />
      </OfficeContext.Provider> */}
      {/* <ClickAwayComp1 /> */}
      {/* <ReactPassHtmlPtops /> */}
      {/* <ReactQueryComp1 />
      <ReactQueryComp2 /> */}
      {/* <ToastError /> */}
      {/* <DeepObjectReset /> */}
      {/* <div className=''> */}
      {/* <Layouts />
         */}
      {/* <SignalsCounter /> */}
      {/* <ArrayTrick /> */}
      {/* <LoginForm /> */}
      {/* <ReactQueryComp /> */}
      {/* </div> */}
      {/* <div className='flex'>
        
      </div> */}
      {/* <PrimeReact /> */}
      {/* <ToastContainer />
      <ReactToastify />
      <SyncfusionGrid /> */}
      {/* <Counter />
        <ReactTooltip />
        <ReactTooltip1Control />
        <Violations /> */}
      {/* </PrimeReactProvider> */}
      {/* <ReactSelectTypeAheadAsync1 /> */}
      {/* <ReactSelectTypeAhead /> */}
      {/* <ApolloGraphQLComp1 />
      <ApolloGraphQLComp2 /> */}
      {/* <ApolloGraphQL03112024 /> */}
      {/* <ReactSelectTypeAheadAsync1 /> */}
      {/* <ReactSelectAsync /> */}
      {/* <SyncfusionTreeGrid /> */}
      {/* <SyncfusionTreeGrid1 /> */}
      {/* <SyncFusionTreeGridEditTemplate1 /> */}
      {/* <KeyToJson />  */}
      {/* <GridDragAndDrop /> */}
      {/* <TreeGrid2 /> */}
      {/* <SyncfusionGrid /> */}
      {/* <InjectSummary /> */}
      {/* <SlidingPaneViewer /> */}
      {/* <EditGrid /> */}
      {/* <Spinners /> */}
      {/* <ReactDatePicker />
      <ExportDropDown /> */}
      {/* <DynamicFilteringGrid /> */}
      {/* <GenericFilteringGridContainer /> */}
      {/* <ReportAllTransactionsFilter /> */}
      {/* <CompactTransactionFilter /> */}
      {/* <NewEditProduct /> */}
      <BranchTransferForm1 />
      {/* <TabExample /> */}
    </GlobalContext.Provider>
  )
}

export default App