# Sales Page Implementation Plan

## Overview
Implement a comprehensive sales page for the Trace+ mobile application that displays sales data, allows filtering, and follows the established architectural patterns of the codebase.

---

## Step 1: Create Data Models
**Goal:** Define the data structures for sales-related information

### Tasks:
1. Create `lib/models/sales_model.dart`
   - Fields: saleId, saleNumber, saleDate, customerName, totalAmount, status, itemCount
   - Implement `fromJson()` factory constructor
   - Implement `toJson()` method
   - Follow naming convention: end with "Model"

2. Create `lib/models/sales_summary_model.dart` (optional)
   - Fields: totalSales, totalRevenue, salesCount, averageOrderValue
   - For displaying summary/analytics cards

**Files to create:**
- `lib/models/sales_model.dart`
- `lib/models/sales_summary_model.dart` (optional)

---

## Step 2: Add SQL ID Mapping
**Goal:** Configure database query identifiers for sales data

### Tasks:
1. Update `lib/core/sql_ids_map.dart`
   - Add constant: `static const String getSalesData = 'get_sales_data';`
   - Add constant: `static const String getSalesSummary = 'get_sales_summary';` (optional)

**Files to modify:**
- `lib/core/sql_ids_map.dart`

---

## Step 3: Create Sales Page Structure
**Goal:** Build the main sales page following the StatefulWidget pattern

### Tasks:
1. Create directory: `lib/features/sales/`

2. Create `lib/features/sales/sales_page.dart`
   - Create StatefulWidget `SalesPage`
   - Implement state class `_SalesPageState`
   - Add `initState()` with `addPostFrameCallback()` for initial data loading
   - Implement `_loadSalesData()` async method:
     - Get selected business unit from GlobalProvider
     - Use GraphQLService to execute query with SqlIdsMap.getSalesData
     - Parse response using SalesModel.fromJson()
     - Handle loading/error states
     - Update UI with setState()
   - Implement build method with:
     - Scaffold
     - AppBar with title "Sales"
     - Body with loading indicator, error handling, and content
   - Add pull-to-refresh functionality (RefreshIndicator)

3. Add state variables:
   - `List<SalesModel> _salesData = []`
   - `bool _isLoading = false`
   - `String? _errorMessage`

**Files to create:**
- `lib/features/sales/sales_page.dart`

---

## Step 4: Create Sales Content Widget
**Goal:** Build reusable UI components for displaying sales data

### Tasks:
1. Create `lib/features/sales/sales_content_widget.dart`
   - Create StatelessWidget `SalesContentWidget`
   - Accept parameters: `List<SalesModel> salesData`
   - Implement UI with:
     - Summary cards at top (total sales, revenue, count)
     - ListView/GridView of sales items
     - Each item shows: sale number, date, customer, amount, status
     - Use Card widgets with proper styling
     - Add tap handlers for future detail view
   - Follow color scheme from AppTheme
   - Use icons for status indicators

2. Create `lib/features/sales/sales_card_widget.dart`
   - Create StatelessWidget for individual sale card
   - Accept SalesModel parameter
   - Display formatted data (currency, dates)
   - Add status badge with color coding
   - Add subtle animations on tap

**Files to create:**
- `lib/features/sales/sales_content_widget.dart`
- `lib/features/sales/sales_card_widget.dart`

---

## Step 5: Add Route Configuration
**Goal:** Configure navigation routing for the sales page

### Tasks:
1. Update `lib/core/routes.dart`
   - Import sales_page.dart
   - In `createRouter()` function, add new GoRoute:
     ```dart
     GoRoute(
       path: Routes.sales,
       pageBuilder: (context, state) => CustomTransitionPage(
         key: state.pageKey,
         child: const SalesPage(),
         transitionsBuilder: (context, animation, secondaryAnimation, child) {
           return FadeTransition(opacity: animation, child: child);
         },
       ),
     ),
     ```
   - Note: Route constant `/sales` already exists in Routes class

**Files to modify:**
- `lib/core/routes.dart`

---

## Step 6: Wire Up Navigation from Dashboard
**Goal:** Enable navigation to sales page from dashboard

### Tasks:
1. Update `lib/features/dashboard/dashboard_content_widget.dart`
   - Import go_router: `import 'package:go_router/go_router.dart';`
   - Import routes: `import '../../core/routes.dart';`
   - Find the Sales action card in `_buildActionCard` (line ~86-90)
   - Wrap the Container in GestureDetector or InkWell
   - Add onTap handler: `onTap: () => context.go(Routes.sales)`
   - Or modify `_buildActionCard` to accept onTap callback

**Files to modify:**
- `lib/features/dashboard/dashboard_content_widget.dart`

---

## Step 7: Test and Refinement
**Goal:** Ensure the sales page works correctly

### Tasks:
1. Test navigation from dashboard to sales page
2. Verify data loading with GraphQL service
3. Test error handling scenarios
4. Test pull-to-refresh functionality
5. Verify UI responsiveness on different screen sizes
6. Check color scheme consistency with app theme
7. Test back navigation

**Testing checklist:**
- [ ] Navigation works from dashboard
- [ ] Loading state displays correctly
- [ ] Error states show appropriate messages
- [ ] Sales data displays in cards
- [ ] Pull-to-refresh works
- [ ] Back navigation returns to dashboard
- [ ] UI matches app theme and design patterns

---

## Additional Enhancements (Future)
**Optional features to implement later:**

1. **Filtering and Sorting**
   - Add filter by date range
   - Add filter by status
   - Add sorting options (date, amount, customer)
   - Create filter UI component

2. **Search Functionality**
   - Add search bar in AppBar
   - Search by sale number, customer name
   - Implement debounced search

3. **Detail View**
   - Create sales detail page
   - Show line items, customer info, payment details
   - Add edit/delete actions (if authorized)

4. **State Management**
   - Extend GlobalProvider with sales-specific state
   - Cache sales data to reduce API calls
   - Add selected filters to provider

5. **Analytics**
   - Add charts (bar, line, pie) using fl_chart package
   - Show trends over time
   - Add export functionality

---

## Files Summary

### Files to Create:
1. `lib/models/sales_model.dart`
2. `lib/models/sales_summary_model.dart` (optional)
3. `lib/features/sales/sales_page.dart`
4. `lib/features/sales/sales_content_widget.dart`
5. `lib/features/sales/sales_card_widget.dart`

### Files to Modify:
1. `lib/core/sql_ids_map.dart`
2. `lib/core/routes.dart`
3. `lib/features/dashboard/dashboard_content_widget.dart`

---

## Dependencies
No new dependencies required. Using existing packages:
- `go_router` for navigation
- `provider` for state management (via GlobalProvider)
- `graphql_flutter` for API calls
- `flutter` Material widgets for UI

---

## Estimated Complexity
- **Complexity Level:** Medium
- **Core Implementation:** ~6 files
- **Pattern Matching:** Follows existing dashboard/authentication patterns
- **API Integration:** Uses established GraphQLService pattern
