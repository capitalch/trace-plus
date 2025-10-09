# Product Search Cache Implementation Plan

## Overview
Implement a globally reusable product search component with Redux caching to be used across Sales, Sales Return, Purchase, and Purchase Return modules. Cache product data to avoid repeated API calls, with manual refresh capability.

---

## Architecture Goals

1. **Global Reusability**: Single `SearchProductModal` component used across all modules
2. **Centralized Cache**: Redux store for product data cache
3. **Performance**: Instant load after first fetch
4. **Flexibility**: Callback-based product selection for different contexts
5. **User Control**: Manual refresh to update cache

---

## Overall Architecture

```
┌──────────────────────────────────────────────────────┐
│  Module: Sales / Purchase / Sales Return / etc.      │
│  User clicks "Search Product" button                 │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│  Utils.showHideModalDialogA()                        │
│  Opens: SearchProductModal                           │
│  Props: onProductSelect callback                     │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│  SearchProductModal Component                        │
│  1. Check Redux cache (valid?)                       │
│     ├─ YES: Display cached products                 │
│     └─ NO: Fetch from API → Store in Redux          │
│  2. User selects product → Call onProductSelect()   │
│  3. Close modal                                      │
└──────────────────────────────────────────────────────┘
```

---

## Phase-Based Implementation

Each phase is **independently testable** and can be deployed incrementally.

---

          # PHASE 1: Redux Slice Setup & Basic Cache

          **Goal**: Create Redux infrastructure for product caching

          **Duration**: 2-3 hours
          **Testing**: Verify Redux DevTools shows state changes

          ## Step 1.1: Create Redux Slice

          **File**: `src/features/layouts/nav-bar/search-product-slice.ts`

          ### Code Implementation

          ```typescript
          import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
          import { Utils } from '../../../utils/utils'
          import { SqlIdsMap } from '../../../app/maps/sql-ids-map'
          import { ProductInfoType } from './search-product-modal'

          // State Type
          export type SearchProductState = {
            products: ProductInfoType[]
            isLoading: boolean
            lastFetched: number | null
            error: string | null
            cacheExpiry: number  // milliseconds
          }

          // Initial State
          const initialState: SearchProductState = {
            products: [],
            isLoading: false,
            lastFetched: null,
            error: null,
            cacheExpiry: 5 * 60 * 1000  // 5 minutes default
          }

          // Async Thunk for Fetching Products
          export const fetchProducts = createAsyncThunk(
            'searchProduct/fetchProducts',
            async (params: FetchProductsParamsType, { rejectWithValue }) => {
              try {
                const result = await Utils.doGenericQuery({
                  buCode: params.buCode,
                  dbName: params.dbName,
                  dbParams: params.dbParams,
                  instance: params.instance,
                  sqlId: SqlIdsMap.getAllProductsInfoForProductSelect,
                  sqlArgs: {
                    branchId: params.branchId,
                    finYearId: params.finYearId
                  }
                })

                // Extract products from result
                const products = result || []
                return products
              } catch (error: any) {
                return rejectWithValue(error.message || 'Failed to fetch products')
              }
            }
          )

          // Slice
          const searchProductSlice = createSlice({
            name: 'searchProduct',
            initialState,
            reducers: {
              clearCache: (state) => {
                state.products = []
                state.lastFetched = null
                state.error = null
              },
              setCacheExpiry: (state, action: PayloadAction<number>) => {
                state.cacheExpiry = action.payload
              }
            },
            extraReducers: (builder) => {
              builder
                .addCase(fetchProducts.pending, (state) => {
                  state.isLoading = true
                  state.error = null
                })
                .addCase(fetchProducts.fulfilled, (state, action) => {
                  state.isLoading = false
                  state.products = action.payload
                  state.lastFetched = Date.now()
                  state.error = null
                })
                .addCase(fetchProducts.rejected, (state, action) => {
                  state.isLoading = false
                  state.error = action.payload as string
                })
            }
          })

          // Selectors
          export const selectProducts = (state: any) => state.searchProduct.products
          export const selectIsLoading = (state: any) => state.searchProduct.isLoading
          export const selectLastFetched = (state: any) => state.searchProduct.lastFetched
          export const selectError = (state: any) => state.searchProduct.error
          export const selectCacheExpiry = (state: any) => state.searchProduct.cacheExpiry

          // Helper to check if cache is valid
          export const isCacheValid = (lastFetched: number | null, expiry: number): boolean => {
            if (!lastFetched) return false
            return Date.now() - lastFetched < expiry
          }

          // Actions
          export const { clearCache, setCacheExpiry } = searchProductSlice.actions

          // Reducer
          export default searchProductSlice.reducer

          // Types
          export type FetchProductsParamsType = {
            branchId: number
            finYearId: number
            buCode: string
            dbName: string
            dbParams: any
            instance: string
          }
          ```

          ---

          ## Step 1.2: Register Slice in Store

          **File**: `src/app/store.ts`

          ### Changes

          1. Import the reducer:
          ```typescript
          import searchProductReducer from '../features/layouts/nav-bar/search-product-slice'
          ```

          2. Add to store configuration:
          ```typescript
          export const store = configureStore({
            reducer: {
              // ... existing reducers
              searchProduct: searchProductReducer,
            },
          })
          ```

          3. `RootStateType` will automatically include `searchProduct`

          ---

          ## Step 1.3: Testing Phase 1

          **Test Checklist**:
          - [ ] Open Redux DevTools
          - [ ] Verify `searchProduct` state exists in store
          - [ ] Check initial state:
            ```json
            {
              "products": [],
              "isLoading": false,
              "lastFetched": null,
              "error": null,
              "cacheExpiry": 300000
            }
            ```
          - [ ] No errors in console
          - [ ] Application runs normally

          **How to Test**:
          1. Run `npm start`
          2. Open browser DevTools → Redux tab
          3. Find `searchProduct` in state tree
          4. Verify structure matches above

          **Rollback**: If issues occur, remove from store.ts and delete slice file

          ---

          # PHASE 2: Integrate Cache into SearchProductModal

          **Goal**: Use Redux cache instead of direct API calls

          **Duration**: 2-3 hours
          **Testing**: Modal loads instantly on second open

          ## Step 2.1: Modify SearchProductModal - Add Redux Integration

          **File**: `src/features/layouts/nav-bar/search-product-modal.tsx`

          ### Code Changes

          ```typescript
          import { useDispatch, useSelector } from "react-redux"
          import {
            fetchProducts,
            selectProducts,
            selectIsLoading,
            selectError,
            selectLastFetched,
            selectCacheExpiry,
            isCacheValid,
            clearCache
          } from "./search-product-slice"
          import { AppDispatchType, RootStateType } from "../../../app/store"
          import { useEffect } from "react"

          export function SearchProductModal({ onProductSelect }: SearchProductModalPropsType) {
              const instance = DataInstancesMap.searchProductModal
              const { branchId, buCode, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo()

              // Redux hooks
              const dispatch: AppDispatchType = useDispatch()
              const products = useSelector(selectProducts)
              const isLoading = useSelector(selectIsLoading)
              const error = useSelector(selectError)
              const lastFetched = useSelector(selectLastFetched)
              const cacheExpiry = useSelector(selectCacheExpiry)

              // Fetch products on mount if cache is invalid
              useEffect(() => {
                  const cacheValid = isCacheValid(lastFetched, cacheExpiry)

                  if (!cacheValid || products.length === 0) {
                      dispatch(fetchProducts({
                          branchId,
                          finYearId,
                          buCode,
                          dbName,
                          dbParams: decodedDbParamsObject,
                          instance
                      }))
                  }
              }, [branchId, finYearId, dispatch]) // Re-fetch if branch/year changes

              // Refresh handler
              const handleRefresh = () => {
                  dispatch(fetchProducts({
                      branchId,
                      finYearId,
                      buCode,
                      dbName,
                      dbParams: decodedDbParamsObject,
                      instance
                  }))
              }

              return (
                  <div className="">
                      {/* Toolbar with Refresh Button */}
                      <div className="flex items-center justify-between mb-2">
                          <CompSyncFusionGridToolbar
                              minWidth="400px"
                              title='All Active Products'
                              isPdfExport={false}
                              isExcelExport={false}
                              isCsvExport={false}
                              instance={instance}
                          />

                          {/* Refresh Button */}
                          <button
                              type="button"
                              onClick={handleRefresh}
                              disabled={isLoading}
                              className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Refresh product data from server"
                          >
                              <IconRefresh className={clsx("w-4 h-4", isLoading && "animate-spin")} />
                              {isLoading ? 'Refreshing...' : 'Refresh'}
                          </button>
                      </div>

                      {/* Cache Status */}
                      {lastFetched && (
                          <div className="text-xs text-gray-500 mb-2">
                              Last updated: {new Date(lastFetched).toLocaleString()}
                          </div>
                      )}

                      {/* Error Display */}
                      {error && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-2">
                              Error: {error}
                          </div>
                      )}

                      {/* Loading Overlay */}
                      {isLoading && products.length === 0 && (
                          <div className="flex items-center justify-center py-10">
                              <div className="text-gray-500">Loading products...</div>
                          </div>
                      )}

                      {/* Grid with Cached Data */}
                      {!isLoading || products.length > 0 ? (
                          <CompSyncFusionGrid
                              aggregates={getAggregates()}
                              hasCheckBoxSelection
                              className="mt-4"
                              columns={getColumns()}
                              dataSource={products}  // Use cached data from Redux
                              height='calc(100vh - 280px)'
                              instance={instance}
                              minWidth="400px"
                              rowSelected={onRowSelected}
                              searchFields={['product', 'label', 'brandName', 'catName', 'info', 'hsn', 'productCode', 'upcCode']}
                          />
                      ) : null}
                  </div>
              )

              // Row selection handler
              function onRowSelected(args: any) {
                  if (onProductSelect) {
                      onProductSelect(args?.data)
                      Utils.showHideModalDialogA({ isOpen: false })
                  }
              }

              // ... rest of the component (getAggregates, getColumns, productTemplate)
          }

          // Add prop type
          export type SearchProductModalPropsType = {
              onProductSelect?: (product: ProductInfoType) => void
          }
          ```

          ---

          ## Step 2.2: Add Refresh Icon

          **Check if exists**: `src/controls/icons/icon-refresh.tsx`

          **If NOT exists, create**:

          ```typescript
          // icon:refresh | Ionicons https://ionicons.com/ | Ionic Framework
          import * as React from "react"

          export function IconRefresh(props: React.SVGProps<SVGSVGElement>) {
            return (
              <svg
                viewBox="0 0 512 512"
                fill="currentColor"
                height="1em"
                width="1em"
                {...props}
              >
                <path d="M320 146s24.36-12-64-12a160 160 0 10160 160"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeMiterlimit="10"
                      strokeWidth="32" />
                <path
                  fill="currentColor"
                  d="M256 58l80 80-80 80" />
              </svg>
            )
          }
          ```

          Import in `search-product-modal.tsx`:
          ```typescript
          import { IconRefresh } from "../../../controls/icons/icon-refresh"
          ```

          ---

          ## Step 2.3: Update CompSyncFusionGrid (If Needed)

          **File**: `src/controls/components/syncfusion-grid/comp-syncfusion-grid.tsx`

          **Check**: Does the component support `dataSource` prop?

          ### If YES (already supports):
          ✅ No changes needed, proceed to testing

          ### If NO (only supports sqlId):

          Add `dataSource` prop support:

          ```typescript
          export function CompSyncFusionGrid({
              dataSource,  // Add this prop
              sqlId,
              sqlArgs,
              // ... other props
          }: CompSyncFusionGridPropsType) {

              // Use dataSource if provided, otherwise fetch via sqlId
              const gridDataSource = dataSource || remoteDataFromSql

              return (
                  <GridComponent
                      dataSource={gridDataSource}
                      // ... other props
                  />
              )
          }

          // Update type
          export type CompSyncFusionGridPropsType = {
              dataSource?: any[]  // Add optional prop
              sqlId?: string
              sqlArgs?: any
              // ... rest
          }
          ```

          ---

          ## Step 2.4: Testing Phase 2

          **Test Checklist**:

          ### Test 1: First Load (Cache Miss)
          - [ ] Open search modal for first time
          - [ ] Verify "Loading products..." appears
          - [ ] Redux DevTools shows:
            - `searchProduct/fetchProducts/pending`
            - `searchProduct/fetchProducts/fulfilled`
          - [ ] Products appear in grid
          - [ ] `lastFetched` timestamp set in Redux state
          - [ ] "Last updated" time displays in modal

          ### Test 2: Second Load (Cache Hit)
          - [ ] Close modal
          - [ ] Re-open modal
          - [ ] Products appear **instantly** (no loading)
          - [ ] No new API call (check Network tab)
          - [ ] Redux shows same `lastFetched` timestamp
          - [ ] Same product count as before

          ### Test 3: Refresh Button
          - [ ] Click "Refresh" button
          - [ ] Button shows "Refreshing..." and spinner
          - [ ] Network tab shows new API call
          - [ ] Products reload
          - [ ] `lastFetched` timestamp updates
          - [ ] Button returns to "Refresh" state

          ### Test 4: Error Handling
          - [ ] Disconnect network or use invalid credentials
          - [ ] Click refresh
          - [ ] Error message displays in red banner
          - [ ] Products from cache still visible (if any)
          - [ ] Refresh button still clickable

          ### Test 5: Branch/Year Change
          - [ ] Change branch or financial year
          - [ ] Open modal
          - [ ] New API call fires automatically
          - [ ] Products refresh for new context

          **How to Test**:
          1. Open browser DevTools (Network + Redux tabs)
          2. Navigate to any module with product search
          3. Click search button
          4. Follow test steps above
          5. Check console for errors

          **Success Criteria**:
          - First open: ~500ms load time
          - Cached open: <100ms load time
          - Refresh works correctly
          - No console errors

          **Rollback**: Revert `search-product-modal.tsx` to use `sqlId` directly

          ---

          # PHASE 3: Make SearchProductModal Globally Reusable

          **Goal**: Use same modal across Sales, Purchase, Sales Return, Purchase Return

          **Duration**: 2-3 hours
          **Testing**: Each module can select products successfully

          ## Step 3.1: Create Reusable Product Selection Utility

          **File**: `src/utils/utils.tsx` (add new function)

          ### Add to Utils object:

          ```typescript
          // In Utils object
          showProductSearch: showProductSearch,
          ```

          ### Add function definition:

          ```typescript
          function showProductSearch(onProductSelect: (product: ProductInfoType) => void) {
            showHideModalDialogA({
              isOpen: true,
              title: "Search Product",
              element: <SearchProductModal onProductSelect={onProductSelect} />,
              size: "xlg"
            })
          }
          ```

          ### Add to UtilsType:

          ```typescript
          export type UtilsType = {
            // ... existing methods
            showProductSearch: (onProductSelect: (product: ProductInfoType) => void) => void
          }
          ```

          ---

          ## Step 3.2: Update Existing Search Product Button (NavBar)

          **File**: `src/features/layouts/nav-bar/search-product.tsx`

          **Keep as-is** (no callback needed for general search):

          ```typescript
          export function SearchProduct() {
              const handleSearch = () => {
                  Utils.showHideModalDialogA({
                      isOpen: true,
                      title: "Search Product",
                      element: <SearchProductModal />,  // No callback = browse only
                      size: "xlg"
                  })
              }

              return (
                  <TooltipComponent content="Search Product" position="BottomCenter">
                      <button
                          onClick={handleSearch}
                          className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 hover:scale-105"
                          type="button"
                      >
                          <IconSearch className="w-5 h-5" />
                      </button>
                  </TooltipComponent>
              )
          }
          ```

          ---

          ## Step 3.3: Integrate into Sales Module

          **File**: `src/features/accounts/purchase-sales/sales/sales-controls/items-and-services.tsx` (or wherever "Add Item" button exists)

          ### Example Integration:

          ```typescript
          import { Utils } from '../../../../../utils/utils'
          import { ProductInfoType } from '../../../../layouts/nav-bar/search-product-modal'

          function handleAddProductClick() {
              Utils.showProductSearch((selectedProduct: ProductInfoType) => {
                  // Handle product selection
                  const newLineItem = {
                      productId: selectedProduct.id,
                      productName: selectedProduct.product || selectedProduct.label,
                      quantity: 1,
                      rate: selectedProduct.salePriceGst || 0,
                      gstRate: selectedProduct.gstRate || 0,
                      hsn: selectedProduct.hsn,
                      // ... map other fields as needed
                  }

                  // Add to form (using react-hook-form)
                  const currentItems = getValues('lineItems') || []
                  setValue('lineItems', [...currentItems, newLineItem])

                  // Or dispatch Redux action
                  // dispatch(addSalesLineItem(newLineItem))
              })
          }

          // In JSX:
          <button onClick={handleAddProductClick}>
              <IconAdd /> Add Product
          </button>
          ```

          ---

          ## Step 3.4: Integrate into Purchase Module

          **File**: `src/features/accounts/purchase-sales/purchases/purchase-controls/purchase-line-items.tsx` (or similar)

          ### Example Integration:

          ```typescript
          function handleAddProductClick() {
              Utils.showProductSearch((selectedProduct: ProductInfoType) => {
                  const newLineItem = {
                      productId: selectedProduct.id,
                      productName: selectedProduct.product || selectedProduct.label,
                      quantity: 1,
                      rate: selectedProduct.lastPurchasePriceGst || 0,  // Note: Purchase price, not sale
                      gstRate: selectedProduct.gstRate || 0,
                      hsn: selectedProduct.hsn,
                  }

                  const currentItems = getValues('lineItems') || []
                  setValue('lineItems', [...currentItems, newLineItem])
              })
          }
          ```

          ---

          ## Step 3.5: Integrate into Sales Return Module

          **File**: `src/features/accounts/purchase-sales/sales-return/sales-return-controls/sales-return-items-and-services.tsx` (or similar)

          ### Example Integration:

          ```typescript
          function handleAddReturnProductClick() {
              Utils.showProductSearch((selectedProduct: ProductInfoType) => {
                  const returnLineItem = {
                      productId: selectedProduct.id,
                      productName: selectedProduct.product || selectedProduct.label,
                      returnQuantity: 1,
                      rate: selectedProduct.salePriceGst || 0,
                      gstRate: selectedProduct.gstRate || 0,
                      hsn: selectedProduct.hsn,
                  }

                  // Add to return items
                  const currentItems = getValues('returnLineItems') || []
                  setValue('returnLineItems', [...currentItems, returnLineItem])
              })
          }
          ```

          ---

          ## Step 3.6: Integrate into Purchase Return Module

          **File**: `src/features/accounts/purchase-sales/purchase-returns/purchase-return-controls/purchase-return-line-items.tsx` (or similar)

          ### Example Integration:

          ```typescript
          function handleAddReturnProductClick() {
              Utils.showProductSearch((selectedProduct: ProductInfoType) => {
                  const returnLineItem = {
                      productId: selectedProduct.id,
                      productName: selectedProduct.product || selectedProduct.label,
                      returnQuantity: 1,
                      rate: selectedProduct.lastPurchasePriceGst || 0,
                      gstRate: selectedProduct.gstRate || 0,
                      hsn: selectedProduct.hsn,
                  }

                  const currentItems = getValues('returnLineItems') || []
                  setValue('returnLineItems', [...currentItems, returnLineItem])
              })
          }
          ```

          ---

          ## Step 3.7: Testing Phase 3

          **Test Checklist for EACH Module**:

          ### Sales Module
          - [ ] Click "Add Product" in Sales form
          - [ ] Modal opens with products
          - [ ] Products are cached (instant load if opened before)
          - [ ] Select a product
          - [ ] Product adds to Sales line items
          - [ ] Modal closes automatically
          - [ ] Product details populated correctly (name, price, GST, HSN)

          ### Purchase Module
          - [ ] Click "Add Product" in Purchase form
          - [ ] Same cached products appear
          - [ ] Select product
          - [ ] Product adds to Purchase line items
          - [ ] Purchase price used (not sale price)

          ### Sales Return Module
          - [ ] Click "Add Product" in Sales Return form
          - [ ] Same cache used
          - [ ] Select product
          - [ ] Product adds to return line items
          - [ ] Correct pricing applied

          ### Purchase Return Module
          - [ ] Same tests as above for purchase return

          ### Cross-Module Cache Verification
          - [ ] Open search in Sales → Products load
          - [ ] Open search in Purchase → Products appear instantly (cache hit)
          - [ ] Click refresh in Purchase modal
          - [ ] Open search in Sales Return → Updated products appear
          - [ ] **Result**: Single shared cache across all modules ✅

          **Success Criteria**:
          - All 4 modules can select products
          - Cache is shared (only 1 API call needed)
          - Each module gets correct callback data
          - No console errors

          **Rollback**: Remove `Utils.showProductSearch()` calls, restore old product selection logic

          ---

# PHASE 4: Advanced Features & Polish

**Goal**: Add context-aware caching and UX improvements

**Duration**: 2-3 hours
**Testing**: Edge cases and performance

          ## Step 4.1: Context-Aware Caching

          **Problem**: Cache should be branch/year specific

          **Solution**: Modify Redux state to cache by context

          ### Update Slice

          **File**: `src/features/layouts/nav-bar/search-product-slice.ts`

          ```typescript
          // New state structure
          export type SearchProductState = {
            cacheByContext: {
              [key: string]: {  // key = "branchId-finYearId"
                products: ProductInfoType[]
                lastFetched: number
              }
            }
            isLoading: boolean
            error: string | null
            cacheExpiry: number
            currentContextKey: string | null
          }

          // Helper to generate context key
          function getContextKey(branchId: number, finYearId: number): string {
            return `${branchId}-${finYearId}`
          }

          // Updated reducers
          const searchProductSlice = createSlice({
            name: 'searchProduct',
            initialState,
            reducers: {
              clearCache: (state) => {
                state.cacheByContext = {}
                state.currentContextKey = null
                state.error = null
              },
              clearContextCache: (state, action: PayloadAction<string>) => {
                delete state.cacheByContext[action.payload]
              }
            },
            extraReducers: (builder) => {
              builder
                .addCase(fetchProducts.fulfilled, (state, action) => {
                  const { branchId, finYearId } = action.meta.arg
                  const contextKey = getContextKey(branchId, finYearId)

                  state.cacheByContext[contextKey] = {
                    products: action.payload,
                    lastFetched: Date.now()
                  }
                  state.currentContextKey = contextKey
                  state.isLoading = false
                  state.error = null
                })
            }
          })

          // Updated selectors
          export const selectProductsForContext = (branchId: number, finYearId: number) =>
            (state: any) => {
              const key = getContextKey(branchId, finYearId)
              return state.searchProduct.cacheByContext[key]?.products || []
            }

          export const selectLastFetchedForContext = (branchId: number, finYearId: number) =>
            (state: any) => {
              const key = getContextKey(branchId, finYearId)
              return state.searchProduct.cacheByContext[key]?.lastFetched || null
            }
          ```

          ### Update SearchProductModal

          ```typescript
          // Use context-aware selectors
          const products = useSelector(selectProductsForContext(branchId, finYearId))
          const lastFetched = useSelector(selectLastFetchedForContext(branchId, finYearId))
          ```

          ---

          ## Step 4.2: Auto-Clear Cache on Product Mutations

          **Goal**: Clear cache when products are added/edited

          ### Hook into Product Save

          **Example**: After saving a product in product master

          ```typescript
          // In product save success handler
          import { clearCache } from '../../layouts/nav-bar/search-product-slice'

          const handleProductSaveSuccess = () => {
            // ... save logic

            // Clear product cache to force refresh
            dispatch(clearCache())

            Utils.showSaveMessage()
          }
          ```

          **Apply to**:
          - Product master create/update
          - Product delete
          - Bulk import

          ---

          ## Step 4.3: Loading States & Animations

          ### Add Loading Overlay

          **File**: `search-product-modal.tsx`

          ```typescript
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading products...</p>
              </div>
            </div>
          )}
          ```

          ### Animate Refresh Icon

          ```typescript
          <IconRefresh className={clsx(
            "w-4 h-4 transition-transform duration-200",
            isLoading && "animate-spin"
          )} />
          ```

          ---

          ## Step 4.4: Testing Phase 4

          **Test Checklist**:

          ### Context-Aware Cache
          - [ ] Open modal in Branch A, Year 2024
          - [ ] Products load and cache
          - [ ] Switch to Branch B, Year 2024
          - [ ] Open modal → New API call (different context)
          - [ ] Switch back to Branch A, Year 2024
          - [ ] Open modal → Cached products appear (context match)

          ### Cache Invalidation
          - [ ] Load products
          - [ ] Create/edit a product
          - [ ] Re-open search modal
          - [ ] Fresh data loads (cache cleared)

          ### Performance
          - [ ] Load time with cache: <100ms
          - [ ] Load time without cache: <1s
          - [ ] No memory leaks (check browser task manager)
          - [ ] Large dataset (10k+ products): smooth scrolling

          **Success Criteria**:
          - Context switching works correctly
          - Auto-invalidation on mutations works
          - No performance degradation

          **Rollback**: Revert to Phase 3 state

          ---

# PHASE 5: AND-Based Multi-Term Search

**Goal**: Implement "casio fx" → finds items with BOTH terms

**Duration**: 2-3 hours
**Testing**: Search scenarios work correctly

## Step 5.1: Examine Syncfusion Grid Search

**File**: `src/controls/components/syncfusion-grid/comp-syncfusion-grid.tsx`

### Read and Document:
1. How is `searchFields` prop currently used?
2. Is there an existing search handler?
3. Does grid have `ref` access?
4. What Syncfusion events are available?

### Look for:
```typescript
<GridComponent
  searchSettings={...}
  actionBegin={...}
  ref={gridRef}
/>
```

---

## Step 5.2: Implement Custom Search Logic

**File**: `src/controls/components/syncfusion-grid/comp-syncfusion-grid.tsx`

### Add Required Imports:

```typescript
import { Predicate } from '@syncfusion/ej2-data'
import { GridComponent } from '@syncfusion/ej2-react-grids'
import { useRef } from 'react'
```

### Add Grid Ref:

```typescript
const gridRef = useRef<GridComponent>(null)
```

### Add Search Handler:

```typescript
const handleActionBegin = (args: any) => {
  if (args.requestType === 'searching') {
    const searchKey = args.searchString || ''

    if (!searchKey.trim()) {
      // Empty search - clear filters
      gridRef.current?.clearFiltering()
      return
    }

    // Check if multi-term search
    const terms = searchKey.toLowerCase().trim().split(/\s+/)

    if (terms.length === 1) {
      // Single term - use default search (faster)
      return // Let default behavior proceed
    }

    // Multi-term - use custom AND logic
    args.cancel = true  // Cancel default search
    performAndSearch(terms)
  }
}

const performAndSearch = (terms: string[]) => {
  const searchFields = props.searchFields || []
  if (searchFields.length === 0) return

  // Create AND predicate for each term
  const andPredicates: Predicate[] = []

  for (const term of terms) {
    // For each term, create OR across all search fields
    const fieldPredicates = searchFields.map((field, index) => {
      const pred = new Predicate(field, 'contains', term, true) // true = ignore case
      return pred
    })

    // Combine field predicates with OR
    let combinedOr: Predicate = fieldPredicates[0]
    for (let i = 1; i < fieldPredicates.length; i++) {
      combinedOr = combinedOr.or(fieldPredicates[i])
    }

    andPredicates.push(combinedOr)
  }

  // Combine term predicates with AND
  let finalPredicate: Predicate = andPredicates[0]
  for (let i = 1; i < andPredicates.length; i++) {
    finalPredicate = finalPredicate.and(andPredicates[i])
  }

  // Apply filter to grid
  gridRef.current?.clearFiltering()
  gridRef.current?.filterByColumn([finalPredicate])
}
```

### Update GridComponent:

```typescript
<GridComponent
  ref={gridRef}
  actionBegin={handleActionBegin}
  // ... existing props
/>
```

---

## Step 5.3: Add Search Help Text

**File**: `search-product-modal.tsx`

```typescript
<div className="text-xs text-gray-500 italic mb-2">
  💡 Tip: Use spaces for AND search (e.g., "casio fx" finds products with both terms)
</div>
```

---

## Step 5.4: Testing Phase 5

**Test Scenarios**:

### Single Term Search
- [ ] Search: "casio"
- [ ] Result: All Casio products
- [ ] Uses default Syncfusion search (fast)

### Two Term AND Search
- [ ] Search: "casio fx"
- [ ] Result: Only products containing BOTH "casio" AND "fx"
- [ ] Example matches:
  - ✅ "Casio FX-991ES"
  - ✅ "CASIO Scientific FX Calculator"
  - ❌ "Casio Digital Watch"
  - ❌ "Sharp FX Calculator"

### Three Term AND Search
- [ ] Search: "casio fx 991"
- [ ] Result: Only products with all three terms
- [ ] Example matches:
  - ✅ "Casio FX-991ES Plus"
  - ❌ "Casio FX-82"

### Cross-Field Matching
- [ ] Search: "casio calculator"
- [ ] Result: Products where:
  - "casio" in brandName AND
  - "calculator" in catName or info
- [ ] Example: Brand="Casio", Category="Calculator" ✅

### Edge Cases
- [ ] Search: "casio  fx" (double space)
  - Result: Same as "casio fx" (extra spaces ignored)
- [ ] Search: "CASIO fx" (mixed case)
  - Result: Same as "casio fx" (case-insensitive)
- [ ] Search: "" (empty)
  - Result: All products shown (filter cleared)

### Performance
- [ ] Search 2 terms in 10k products: <500ms
- [ ] Search 3+ terms: still performant
- [ ] No UI lag during typing

**Success Criteria**:
- AND logic works correctly
- Performance is acceptable
- UX is smooth
- No false positives/negatives

**Rollback**: Remove `actionBegin` handler, use default search

---

# PHASE 6: Final Polish & Documentation

**Goal**: Production-ready code with documentation

**Duration**: 1 hour

## Step 6.1: Code Comments

Add comprehensive comments to:

1. **search-product-slice.ts**:
```typescript
/**
 * Redux slice for global product search cache
 *
 * Features:
 * - Caches products by branch/year context
 * - 5-minute default expiry
 * - Manual refresh capability
 *
 * Usage:
 * - Shared across Sales, Purchase, Sales Return, Purchase Return
 * - Reduces API calls by reusing cached data
 */
```

2. **search-product-modal.tsx**:
```typescript
/**
 * Global product search modal with caching
 *
 * Props:
 * @param onProductSelect - Optional callback when product is selected
 *                          If not provided, modal is browse-only
 *
 * Features:
 * - Cached product data (Redux)
 * - Multi-term AND search ("casio fx")
 * - Manual refresh
 * - Context-aware (branch/year)
 */
```

3. **comp-syncfusion-grid.tsx**:
```typescript
/**
 * Custom search logic for multi-term AND search
 *
 * Single term: "casio" → uses default search
 * Multiple terms: "casio fx" → AND logic
 *   - Finds products containing BOTH terms
 *   - Terms can match different fields
 *   - Case-insensitive
 */
```

---

## Step 6.2: Error Handling Review

### Add Try-Catch to All Integrations:

```typescript
function handleAddProductClick() {
  try {
    Utils.showProductSearch((product) => {
      // Validate product data
      if (!product || !product.id) {
        Utils.showErrorMessage('Invalid product selected')
        return
      }

      // Add to form
      const newItem = {
        productId: product.id,
        // ... rest
      }
      setValue('lineItems', [...getValues('lineItems'), newItem])
    })
  } catch (error) {
    console.error('Product selection error:', error)
    Utils.showErrorMessage('Failed to open product search')
  }
}
```

---

## Step 6.3: Final Testing Checklist

**Comprehensive Test Matrix**:

| Module | Cache Load | Product Select | Refresh | Multi-Search |
|--------|-----------|----------------|---------|--------------|
| Sales | ✅ | ✅ | ✅ | ✅ |
| Purchase | ✅ | ✅ | ✅ | ✅ |
| Sales Return | ✅ | ✅ | ✅ | ✅ |
| Purchase Return | ✅ | ✅ | ✅ | ✅ |
| NavBar (Browse) | ✅ | N/A | ✅ | ✅ |

**Cross-Module Cache Sharing**:
- [ ] Open in Sales → Cache populated
- [ ] Open in Purchase → Instant load (cache hit)
- [ ] Refresh in Purchase → Cache updated
- [ ] Open in Sales Return → New cached data appears

**Context Switching**:
- [ ] Branch A, Year 2024 → Cache A
- [ ] Branch B, Year 2024 → Cache B (separate)
- [ ] Back to Branch A → Cache A still valid

**Performance**:
- [ ] First load: <1s
- [ ] Cached load: <100ms
- [ ] 10k products: smooth scrolling
- [ ] Multi-term search: <500ms

**Error Scenarios**:
- [ ] Network offline → Error shown, old cache usable
- [ ] Invalid SQL → Error message, graceful degradation
- [ ] Empty result → "No products found" message

---

# Implementation Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|----------------|
| Phase 1 | 2-3 hours | Redux slice + store integration |
| Phase 2 | 2-3 hours | Cache integration in modal |
| Phase 3 | 2-3 hours | Global reusability across modules |
| Phase 4 | 2-3 hours | Context-aware cache + polish |
| Phase 5 | 2-3 hours | AND-based multi-term search |
| Phase 6 | 1 hour | Polish + documentation |
| **TOTAL** | **11-16 hours** | **Complete feature** |

---

# Rollback Strategy

Each phase is independently rollback-able:

| Phase | Rollback Action |
|-------|----------------|
| 1 | Remove from store.ts, delete slice file |
| 2 | Revert modal to use `sqlId` directly |
| 3 | Remove `Utils.showProductSearch()` calls |
| 4 | Remove context-aware logic, keep simple cache |
| 5 | Remove `actionBegin` handler |
| 6 | No rollback needed (docs/comments) |

---

# Success Metrics

**Performance**:
- ✅ 90% reduction in API calls (cached loads)
- ✅ <100ms load time for cached data
- ✅ <500ms for multi-term search

**Functionality**:
- ✅ Works in 5 different modules
- ✅ AND search accuracy: 100%
- ✅ Cache hit rate: >80%

**User Experience**:
- ✅ No loading spinners on cached opens
- ✅ Instant product selection
- ✅ Smooth search experience

---

# Maintenance Notes

**Cache Invalidation Triggers**:
1. Manual refresh button
2. Branch/year change
3. Product create/edit/delete
4. Time expiry (5 min default)

**Future Enhancements**:
1. Search history/recent searches
2. Favorite products
3. Product preview modal
4. Barcode scanner integration
5. Keyboard shortcuts (Ctrl+K to open)

---

# Appendix: Key Files Modified

## New Files Created
- `src/features/layouts/nav-bar/search-product-slice.ts`
- `src/controls/icons/icon-refresh.tsx` (if not exists)

## Modified Files
- `src/app/store.ts`
- `src/features/layouts/nav-bar/search-product-modal.tsx`
- `src/features/layouts/nav-bar/search-product.tsx`
- `src/utils/utils.tsx`
- `src/controls/components/syncfusion-grid/comp-syncfusion-grid.tsx`

## Integration Points (per module)
- `src/features/accounts/purchase-sales/sales/*/items-and-services.tsx`
- `src/features/accounts/purchase-sales/purchases/*/purchase-line-items.tsx`
- `src/features/accounts/purchase-sales/sales-return/*/sales-return-items-and-services.tsx`
- `src/features/accounts/purchase-sales/purchase-returns/*/purchase-return-line-items.tsx`

---

# Getting Started

To begin implementation:

1. **Read this entire document**
2. **Start with Phase 1** (2-3 hours)
3. **Test Phase 1** before proceeding
4. **Move to Phase 2** only after Phase 1 passes all tests
5. **Repeat for each phase**
6. **Document any deviations** from this plan

Good luck! 🚀
