# Plan: Remove Lazy Loading from app-router.tsx

## Problem
The production build error `Cannot set properties of undefined (setting 'Activity')` started appearing after implementing lazy loading and chunk size management. The application worked fine before these changes.

## Root Cause Analysis
The lazy loading combined with aggressive code splitting in vite.config.ts is causing module initialization order issues where React's internal `Activity` property is being set on an undefined exports object.

## Solution Plan

### Step 1: Remove Lazy Loading from app-router.tsx
- Convert all `lazy()` imports back to standard synchronous imports
- Remove all `Suspense` wrappers around lazy-loaded components
- Remove the `LoadingFallback` component (no longer needed)
- Keep the eagerly loaded components as they are (Protected, Layouts)

### Step 2: Simplify or Remove Manual Chunking
- Either remove the aggressive manual chunking strategy from vite.config.ts
- Or simplify it to only split vendor code without breaking module dependencies
- Revert to simpler chunking that doesn't interfere with module initialization

### Step 3: Test the Build
- Build the application
- Verify that the production bundle works without the Activity error
- Check bundle sizes to ensure they're reasonable

## Files to Modify

1. **src/app/router/app-router.tsx**
   - Remove all `lazy()` calls
   - Remove `Suspense` components
   - Convert to direct imports

2. **vite.config.ts** (optional)
   - Simplify or remove the manual chunking strategy
   - Keep basic vendor splitting only

## Expected Outcome
After removing lazy loading, the application should work in production without the module initialization error, similar to how it worked before the lazy loading implementation.
