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
