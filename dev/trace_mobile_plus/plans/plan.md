# Plan: Create Transactions Page Feature

## Overview
Create a new transactions page feature following the same pattern as sales_page. This will display all account transactions including sales, purchase, and vouchers with date range filtering and row count limiting.

## Implementation Steps

### Step 1: Create Transaction Model
**File:** `lib/models/transaction_model.dart`

**Action:** Create TransactionModel class with required fields

**Fields to include:**
- `tranDate` (DateTime)
- `autoRefNo` (String)
- `userRefNo` (String?)
- `remarks` (String?)
- `accName` (String)
- `debit` (double)
- `credit` (double)
- `instrNo` (String?)
- `lineRefNo` (String?)
- `lineRemarks` (String?)
- `timestamp` (DateTime)
- `tranTypeId` (int)

**Implementation:**
- Create class with all fields
- Add `fromJson` factory constructor to parse GraphQL response
- Add getter for transaction type name based on tranTypeId mapping:
  - 1: 'Journal', 2: 'Payment', 3: 'Receipt', 4: 'Sales', 5: 'Purchase'
  - 6: 'Contra', 7: 'Debit note', 8: 'Credit note', 9: 'Sales return', 10: 'Purchase return'

### Step 2: Add SQL ID to SqlIdsMap
**File:** `lib/core/sql_ids_map.dart`

**Action:** Add getAllTransactions constant

**Implementation:**
- Add `static const String getAllTransactions = 'getAllTransactions';`

### Step 3: Create Transactions Provider
**File:** `lib/providers/transactions_provider.dart`

**Action:** Create TransactionsProvider following SalesProvider pattern

**Fields to include:**
- `_startDate` and `_endDate` (DateTime)
- `_selectedPeriod` (String) - tracks active button
- `_maxCount` (int) - default 1000
- `_transactionsData` (List<TransactionModel>)
- `_isLoading` (bool)
- `_errorMessage` (String?)
- `_transactionsFuture` (Future<void>?)
- `_graphqlService` (GraphQLService instance)

**Methods to implement:**
- Getters for all private fields
- `totalRows` getter - returns count of transactions
- Date setting methods:
  - `setToday()`
  - `setDaysAgo(int days)` - for 2 Days, 3 Days buttons
  - `setThisWeek()`
  - `setWeeksAgo(int weeks)` - for 2 Weeks, 3 Weeks
  - `setThisMonth()`
  - `setMonthsAgo(int months)` - for 2, 3, 6 months
  - `setThisYear()`
- `setMaxCount(int count)` - sets the row limit
- `fetchTransactionsData(GlobalProvider globalProvider)` - async method to fetch data
- `refreshTransactions(GlobalProvider globalProvider)` - creates new future
- `initializeToday(GlobalProvider globalProvider)` - sets today and fetches
- Helper methods for date calculations (start/end of day, week, month, year)

**Query parameters:**
- buCode, dbParams from GlobalProvider and AppSettings
- sqlId: SqlIdsMap.getAllTransactions
- sqlArgs: endDate, finYearId, branchId, startDate, tranTypeId (null for all), noOfRows (from maxCount or null for 'All')

### Step 4: Register Provider in main.dart
**File:** `lib/main.dart`

**Action:** Add TransactionsProvider to MultiProvider

**Implementation:**
- Import TransactionsProvider
- Add `ChangeNotifierProvider(create: (_) => TransactionsProvider())` to the providers list

### Step 5: Create Transactions Folder Structure
**Action:** Create folder and files in features

**Create:**
- `lib/features/transactions/` folder
- `lib/features/transactions/transactions_page.dart`

### Step 6: Add Route for Transactions Page
**File:** `lib/core/routes.dart`

**Action:** Add transactions route constant and route configuration

**Implementation:**
- Add `static const String transactions = '/transactions';` constant
- Add route to GoRouter configuration

### Step 7: Create Transactions Page UI
**File:** `lib/features/transactions/transactions_page.dart`

**Action:** Create TransactionsPage widget similar to SalesPage

**AppBar Configuration:**
- toolbarHeight: 54
- Title: "Transactions" text
- Period buttons (Today, 2 Days, 3 Days, This Week, 2 Weeks, 3 Weeks, This Month, 2 Months, 3 Months, 6 Months, This Year)
- Horizontal scrollable row for buttons
- Use same button styling as sales_page

**Secondary AppBar (bottom):**
- Show selected period
- Show start and end dates
- Show "Max count: {value}" as clickable label
- On click of max count, show dialog with options: 1000, 2000, 3000, 5000, All
- preferredSize height: 34

**Body Structure:**
- FutureBuilder with transactionsFuture
- Loading state: CircularProgressIndicator
- Error state: Error message with retry button
- Empty state: "No transactions found" message
- Success state: RefreshIndicator with ListView
  - Show row count at top (e.g., "Rows: 1,234")
  - Transaction cards with separators
  - Use ListView for scrolling

**Transaction Card Design:**
- Display transaction information in a nice card layout
- Show: tranDate, autoRefNo, accName, debit/credit, transaction type
- Color coding based on transaction type or debit/credit
- Use Colors.teal, Colors.indigo, Colors.purple for gradients
- Show userRefNo, remarks, instrNo if available
- Use layoutBuilder if needed for responsive design
- Include dividers between cards

### Step 8: Create Helper Method for Max Count Dialog
**File:** `lib/features/transactions/transactions_page.dart`

**Action:** Create method to show max count selection dialog

**Implementation:**
- Create `_showMaxCountDialog(BuildContext context)` method
- Show AlertDialog with radio button options
- Options: 1000, 2000, 3000, 5000, All (null for all)
- On selection, call `provider.setMaxCount(selectedCount)` and refresh
- Update the label to show selected count

### Step 9: Connect Transactions Card in Dashboard
**File:** `lib/features/dashboard/dashboard_content_widget.dart`

**Action:** Add onTap handler to Transactions card

**Implementation:**
- Import TransactionsProvider and Routes
- In the Transactions action card, add onTap callback
- Get TransactionsProvider and GlobalProvider (listen: false)
- Call `transactionsProvider.initializeToday(globalProvider)`
- Navigate to Routes.transactions

### Step 10: Style and Polish UI
**Action:** Apply consistent styling and color scheme

**Implementation:**
- Use same color palette as sales_page (teal, indigo, purple)
- Ensure cards have proper elevation and shadows
- Add proper spacing and padding
- Make max count label visually distinct (maybe with icon)
- Ensure responsive layout works well
- Test with large datasets to ensure performance

### Step 11: Test the Feature
**Action:** Comprehensive testing

**Test Cases:**
- [ ] Click Transactions card from dashboard - page loads
- [ ] Default shows today's transactions with max count 1000
- [ ] All period buttons work correctly (Today, 2 Days, 3 Days, etc.)
- [ ] Active button highlights correctly
- [ ] Max count selector shows dialog with options
- [ ] Selecting different max counts updates data correctly
- [ ] "All" option fetches all transactions (no limit)
- [ ] Transaction cards display all fields correctly
- [ ] Different transaction types show correctly
- [ ] Debit/credit amounts formatted properly
- [ ] Pull to refresh works
- [ ] Error handling works (network errors, no data)
- [ ] Back button navigates to dashboard
- [ ] Large datasets scroll smoothly
- [ ] Row count displays correctly at top

## Files to Create
1. `lib/models/transaction_model.dart`
2. `lib/providers/transactions_provider.dart`
3. `lib/features/transactions/transactions_page.dart`

## Files to Modify
1. `lib/core/sql_ids_map.dart` - Add getAllTransactions
2. `lib/main.dart` - Register TransactionsProvider
3. `lib/core/routes.dart` - Add transactions route
4. `lib/features/dashboard/dashboard_content_widget.dart` - Add onTap handler

## Key Differences from Sales Page
1. Different date range options (weeks, year instead of individual days)
2. Max count selector with clickable label
3. Different model fields (debit/credit instead of sales amounts)
4. Transaction type mapping and display
5. No summary section - only row count at top
6. May need performance optimization for large datasets

## Notes
- Follow naming convention: TransactionModel (not Transaction)
- Reuse GraphQL service with FetchPolicy.noCache
- Use NumberFormat for formatting debit/credit amounts
- Consider using ListView.builder if performance issues with large data
- Ensure proper error handling and loading states
- Keep UI consistent with sales_page styling
