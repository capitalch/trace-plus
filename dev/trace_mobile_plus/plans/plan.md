# General Ledger Implementation Plan

## Overview
Implement a complete General Ledger feature that allows users to select an account and view all its transactions with a summary. The implementation will include provider, models, UI components, and GraphQL integration using the `executeGenericQuery` pattern (same as SalesProvider).

**Based on**: `plans/tran.md` instructions with actual data structures from `plans/acc.json` and `plans/ledger.json`

### Key Data Structure Clarifications:
1. **Account ID**: Integer type (not String) based on acc.json
2. **Transaction amounts**: Separate `debit` and `credit` fields. Display: show amount with "Dr" appended if debit > 0, or "Cr" appended if credit > 0
3. **Account name in transaction**: Field is `otherAccounts` (contra account), not `accName`
4. **Reference fields**: Multiple reference fields available: `instrNo`, `autoRefNo`, `userRefNo`, `lineRefNo`
5. **Nested response**: API returns `[{ "jsonResult": {...} }]` structure, must unwrap to access data
6. **Opening balance**: First entry in transactions array (where id is null and otherAccounts is "Opening balance:")
7. **Transaction details**:
   - Line 1: date, autoRefNo, userRefNo, amount (right aligned) with Dr/Cr
   - Line 2: otherAccounts, tranType, instrNo, lineRefNo, lineRemarks, remarks (max 3 lines)

### Key Features
- Account selection with searchable dropdown
- Transaction display as cards with specific layout:
  - Line 1: date, autoRefNo, userRefNo, amount (right aligned) with Dr/Cr
  - Line 2: otherAccounts, tranType, instrNo, lineRefNo, lineRemarks, remarks (max 3 lines)
- Summary showing opening, debit, credit, and closing balances at the top
- GraphQL integration using executeGenericQuery with sqlId and sqlArgs

### Data Sources
- **Account Selection**: `getLeafSubledgerAccountsOnClass` (sqlArgs: accClassNames = 'debtor, creditor')
  - Sample response structure: See `plans/acc.json`
- **Transaction Data**: `getAccountLedger` (sqlArgs: accId, finYearId, branchId)
  - Sample response structure: See `plans/ledger.json`

### GraphQL Pattern
- Uses `GraphQLService.executeGenericQuery()` (NO separate GraphQL query files)
- Same pattern as SalesProvider, BalanceSheetProvider, etc.
- Data accessed via `result.data?['genericQuery']`

---

## Step 1: Create Account Selection Model
**File:** `lib/models/account_selection_model.dart` (NEW FILE)

### Implementation:
```dart
class AccountSelectionModel {
  final int id;
  final String accName;
  final bool isSubledger;
  final String accLeaf;
  final String accParent;
  final bool isDisabled;

  // Constructor, fromJson, toJson methods
}
```

### Fields (based on acc.json):
- `id`: Account ID (integer)
- `accName`: Account name for display
- `isSubledger`: Whether account is subledger
- `accLeaf`: Leaf indicator ('Y' or 'N')
- `accParent`: Parent account name
- `isDisabled`: Whether account is disabled

---

## Step 2: Create Account Ledger Models
**Files:** (NEW FILES)
- `lib/models/account_ledger_transaction_model.dart`
- `lib/models/ledger_response_model.dart`
- `lib/models/ledger_summary_model.dart`

Or combine all three in: `lib/models/general_ledger_models.dart`

### Implementation:
Create model classes based on ledger.json structure:

1. **AccountLedgerTransactionModel**
   - `id`: Transaction ID (nullable for opening balance rows)
   - `tranDate`: Transaction date (String, format: YYYY-MM-DD)
   - `tranType`: Transaction type (nullable, e.g., "Purchase", "Journal")
   - `autoRefNo`: Auto-generated reference number
   - `userRefNo`: User reference number (nullable)
   - `otherAccounts`: Contra account name
   - `debit`: Debit amount (double)
   - `credit`: Credit amount (double)
   - `instrNo`: Instrument number (nullable)
   - `lineRemarks`: Line-level remarks (nullable)
   - `lineRefNo`: Line reference number (nullable)
   - `remarks`: General remarks (nullable)
   - `branchName`: Branch name
   - `branchCode`: Branch code (nullable)
   - `index`: Row index
   - fromJson and toJson methods
   - Helper methods:
     * `getLine1Details()` to concatenate autoRefNo, userRefNo for first line
     * `getLine2Details()` to concatenate otherAccounts, tranType, instrNo, lineRefNo, lineRemarks, remarks for second line

2. **LedgerResponseModel**
   - `accName`: Account name from response
   - `accClass`: Account class (e.g., "creditor", "debtor")
   - `transactions`: List of AccountLedgerTransactionModel
   - fromJson method to parse nested jsonResult structure

   **IMPORTANT Parsing Note**:
   - API returns: `[{ "jsonResult": { ...actual data... } }]`
   - First extract: `data[0]['jsonResult']`
   - Then parse jsonResult into LedgerResponseModel
   - The jsonResult contains: accName, accClass, transactions[]
   - First transaction in array is the opening balance (id = null, otherAccounts = "Opening balance:")

3. **LedgerSummaryModel**
   - `opening`: Opening balance (from first transaction where id is null)
   - `debit`: Total debit (sum of all transaction debits, excluding opening balance row)
   - `credit`: Total credit (sum of all transaction credits, excluding opening balance row)
   - `closing`: Closing balance (opening + credit - debit)
   - Constructor and calculation methods

---

## Step 3: Create General Ledger Provider
**File:** `lib/providers/general_ledger_provider.dart` (NEW FILE)

### Implementation:
Create `GeneralLedgerProvider` extending `ChangeNotifier`

**Pattern Reference**: Use the same pattern as `SalesProvider` with `executeGenericQuery`

### Properties:
```dart
- final GraphQLService _graphqlService = GraphQLService()
- List<AccountSelectionModel> _accountsList = []
- List<AccountLedgerTransactionModel> _transactionsList = []
- LedgerResponseModel? _ledgerResponse
- LedgerSummaryModel? _summary
- int? _selectedAccountId
- String? _selectedAccountName
- bool _isLoadingAccounts = false
- bool _isLoadingTransactions = false
- String? _errorMessage
- String _searchQuery = ''
```

### Getters:
```dart
- List<AccountSelectionModel> get accountsList (filtered by search)
- List<AccountLedgerTransactionModel> get transactionsList
- LedgerResponseModel? get ledgerResponse
- LedgerSummaryModel? get summary
- int? get selectedAccountId
- String? get selectedAccountName
- bool get isLoadingAccounts
- bool get isLoadingTransactions
- String? get errorMessage
- String get searchQuery
```

### Methods:
```dart
1. Future<void> fetchLeafAccounts(GlobalProvider globalProvider) async
   - Set _isLoadingAccounts = true
   - Get buCode from globalProvider.selectedBusinessUnit?.buCode
   - Get dbParams from AppSettings.dbParams
   - Validate parameters (throw if null)
   - Execute: await _graphqlService.executeGenericQuery(
       buCode: buCode,
       dbParams: dbParams,
       sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
       sqlArgs: {
         'accClassNames': 'debtor, creditor'
       },
     )
   - Check result.hasException
   - Get data from result.data?['genericQuery']
   - Parse List<dynamic> to List<AccountSelectionModel>
   - Set _accountsList
   - Handle errors in try-catch
   - Set _isLoadingAccounts = false
   - Call notifyListeners()

2. Future<void> fetchAccountLedger(int accId, GlobalProvider globalProvider) async
   - Set _isLoadingTransactions = true
   - Get branchId, finYearId, buCode from GlobalProvider
   - Get dbParams from AppSettings.dbParams
   - Validate parameters (throw if null)
   - Execute: await _graphqlService.executeGenericQuery(
       buCode: buCode,
       dbParams: dbParams,
       sqlId: SqlIdsMap.getAccountLedger,
       sqlArgs: {
         'accId': accId,
         'finYearId': finYearId,
         'branchId': branchId
       },
     )
   - Check result.hasException
   - Get data from result.data?['genericQuery']
   - IMPORTANT: Response is array with single object containing 'jsonResult'
   - Parse: data[0]['jsonResult'] to get the actual ledger data
   - Create LedgerResponseModel from jsonResult
   - Extract transactions list from ledgerResponse.transactions
   - Calculate summary using _calculateSummary(transactions)
   - Set _ledgerResponse, _transactionsList and _summary
   - Handle errors in try-catch
   - Set _isLoadingTransactions = false
   - Call notifyListeners()

3. void selectAccount(int id, String name)
   - Set selectedAccountId and selectedAccountName
   - Clear previous transactions
   - Trigger fetchAccountLedger

4. void setSearchQuery(String query)
   - Update search query for filtering accounts
   - Call notifyListeners()

5. void clearSearch()
   - Clear search query
   - Call notifyListeners()

6. LedgerSummaryModel _calculateSummary(List<AccountLedgerTransactionModel> transactions)
   - Extract opening balance from first transaction (where id is null)
     * Opening = (first transaction's credit - first transaction's debit)
   - Sum all transaction debits (skip first row, i.e., start from index 1)
   - Sum all transaction credits (skip first row, i.e., start from index 1)
   - Calculate closing balance: opening + credits - debits
   - Return LedgerSummaryModel

7. void clearError()
   - Set _errorMessage = null
   - Call notifyListeners()

8. void clearSelection()
   - Clear selected account and transactions
   - Call notifyListeners()
```

### Key Points:
- Use `_graphqlService.executeGenericQuery()` for all queries (same as SalesProvider)
- Access result via `result.data?['genericQuery']`
- Always check `result.hasException`
- Handle errors with try-catch and set _errorMessage
- Strip "Exception: " prefix from error messages

---

## Step 4: Register Provider in Main App
**File:** `lib/main.dart`

### Changes:
1. Import the new provider:
   ```dart
   import 'package:trace_mobile_plus/providers/general_ledger_provider.dart';
   ```

2. Add to MultiProvider list:
   ```dart
   ChangeNotifierProvider(create: (_) => GeneralLedgerProvider()),
   ```

---

## Step 5: Create Account Selection Modal Widget
**File:** `lib/features/accounts/widgets/account_selection_modal.dart` (NEW FILE)

### Implementation:
Create modal dialog for account selection

### Features:
- Search TextField at top
- Filtered list of accounts below
- Typing in search box narrows down results
- Click on account to select
- Show loading indicator while fetching
- Show error message if fetch fails

### Structure:
```dart
class AccountSelectionModal extends StatefulWidget {
  final GeneralLedgerProvider provider;
  final GlobalProvider globalProvider;
}
```

### UI Layout:
```
Dialog:
  - Title: "Select Account"
  - Search TextField (with search icon)
  - Divider
  - ListView of accounts:
    * Each item: ListTile with accName
    * onTap: select account and close modal
  - Loading indicator (if loading)
  - Error message (if error)
  - Cancel button
```

### Methods:
- `void initState()`: Fetch accounts if not already loaded
- `void _onAccountSelected(AccountSelectionModel account)`: Handle selection

---

## Step 6: Create Transaction Card Widget
**File:** `lib/features/accounts/widgets/transaction_card.dart` (NEW FILE)

### Implementation:
Create card widget to display a single transaction

### Structure:
```dart
class TransactionCard extends StatelessWidget {
  final AccountLedgerTransactionModel transaction;
}
```

### UI Layout (Updated based on tran.md):
```
Card:
  - Padding and margin for spacing
  - Column:
    * Row 1 (main info):
      - tranDate (formatted as dd/MM/yyyy)
      - autoRefNo
      - userRefNo
      - Amount with Dr/Cr appended (RIGHT ALIGNED, e.g., "5,000.00 Dr" or "3,500.00 Cr")
      - Color: Red text for Dr, Green text for Cr
    * Row 2 (details, max 3 lines with ellipsis):
      - Concatenated: otherAccounts, tranType, instrNo, lineRefNo, lineRemarks, remarks
      - Grey color, smaller font
      - Use transaction.getLine2Details() helper method
```

### Formatting:
- tranDate: Convert from 'YYYY-MM-DD' to `dd/MM/yyyy` format
- **Line 1**: date, autoRefNo, userRefNo, amount (right aligned) with Dr or Cr
- **Line 2**: otherAccounts, type (field: tranType), instrNo, refNo (field: lineRefNo), lineRemarks, remarks
  - Max 3 lines with ellipsis overflow
  - Concatenate with proper spacing/separators (e.g., commas or pipes)
- Amount: Display amount with 2 decimals and append "Dr" if debit > 0, or append "Cr" if credit > 0
  - Example: "5,000.00 Dr" or "3,500.00 Cr"
  - Right aligned
- Color: Red text for Dr, Green text for Cr
- Skip displaying the first row (opening balance, where id is null and otherAccounts = "Opening balance:")

---

## Step 7: Create Ledger Summary Widget
**File:** `lib/features/accounts/widgets/ledger_summary.dart` (NEW FILE)

### Implementation:
Create widget to display ledger summary at top

### Structure:
```dart
class LedgerSummary extends StatelessWidget {
  final LedgerSummaryModel summary;
}
```

### UI Layout:
```
Card:
  - Title: "Summary"
  - Grid of 4 items (2x2):
    * Opening Balance: {amount}
    * Total Debit: {amount}
    * Total Credit: {amount}
    * Closing Balance: {amount} (bold, larger font)
  - Color coding: Green for positive, Red for negative
```

---

## Step 8: Create General Ledger Page
**File:** `lib/features/accounts/general_ledger_page.dart` (NEW FILE)

### Implementation:
Create main General Ledger page

### Structure:
```dart
class GeneralLedgerPage extends StatefulWidget {}
class _GeneralLedgerPageState extends State<GeneralLedgerPage> {}
```

### UI Layout:
```
Scaffold:
  AppBar:
    - Title: "General Ledger"
    - Subtitle: Selected account name (if any)
    - Actions:
      * IconButton: "Select Account" (opens modal)
    - Back button

  Body:
    - If no account selected:
      * Empty state with message: "Select an account to view ledger"

    - If account selected:
      * RefreshIndicator (pull to refresh)
      * Column:
        - LedgerSummary widget (if data loaded)
        - Divider
        - Expanded ListView of TransactionCards
      * Loading indicator (if loading)
      * Error state with retry button (if error)
```

### Methods:
```dart
1. void initState()
   - Initialize provider reference

2. void _openAccountSelectionModal()
   - Show AccountSelectionModal dialog
   - On selection, fetch ledger data

3. Future<void> _onRefresh()
   - Refresh ledger data for selected account

4. Widget _buildEmptyState()
   - Show message when no account selected

5. Widget _buildErrorState()
   - Show error message with retry button

6. Widget _buildLedgerContent()
   - Build summary + transactions list
```

---

## Step 9: Add Route for General Ledger Page
**File:** `lib/core/routes.dart`

### Changes:
1. Add static route constant:
   ```dart
   static const String generalLedger = '/accounts/general-ledger';
   ```

2. Add route in GoRouter routes list:
   ```dart
   GoRoute(
     path: '/accounts/general-ledger',
     builder: (context, state) => const GeneralLedgerPage(),
   ),
   ```

---

## Step 10: Add Navigation to General Ledger
**File:** Find accounts menu/options page

### Changes:
1. Add menu item/button for "General Ledger"
2. Navigate to `Routes.generalLedger` on tap
3. Similar to Balance Sheet, Trial Balance, Profit & Loss access

---

## Step 11: Testing

### Test Cases:

1. **Account Selection**
   - Open General Ledger page
   - Click "Select Account" button
   - Modal opens with list of accounts
   - Type in search box to filter
   - Select an account
   - Modal closes and account name shows in AppBar

2. **Transaction Loading**
   - After selecting account, verify loading indicator appears
   - Transactions load and display as cards
   - Summary displays at top with correct calculations

3. **Transaction Display**
   - Each transaction card shows:
     * Line 1: date, autoRefNo, userRefNo, amount (right aligned) with Dr/Cr
     * Line 2: otherAccounts, tranType, instrNo, lineRefNo, lineRemarks, remarks (max 3 lines)
   - Cards are properly formatted and readable
   - Opening balance row (first transaction) is not displayed as a card

4. **Summary Calculation**
   - Opening balance is correct
   - Debit total matches sum of all debits
   - Credit total matches sum of all credits
   - Closing balance = opening + credits - debits

5. **Search Functionality**
   - Search in account selection modal filters accounts
   - Typing narrows down results
   - Clearing search shows all accounts

6. **Error Handling**
   - Test with network error
   - Error message displays
   - Retry button works

7. **Empty States**
   - No account selected: Shows empty state message
   - Account with no transactions: Shows appropriate message

8. **Refresh**
   - Pull to refresh reloads transactions
   - Loading indicator shows during refresh

---

## Step 12: Code Review and Cleanup

### Review Checklist:
- [ ] All imports are correct
- [ ] No unused variables or methods
- [ ] Consistent code formatting
- [ ] Proper error handling everywhere
- [ ] Memory leaks checked (dispose methods)
- [ ] Summary calculations verified
- [ ] UI matches design requirements
- [ ] Responsive on different screen sizes
- [ ] GraphQL queries tested
- [ ] Provider state management correct

### Files to Review:
- `lib/core/sql_ids_map.dart`
- `lib/models/account_selection_model.dart`
- `lib/models/account_ledger_model.dart`
- `lib/providers/general_ledger_provider.dart`
- `lib/features/accounts/general_ledger_page.dart`
- `lib/features/accounts/widgets/account_selection_modal.dart`
- `lib/features/accounts/widgets/transaction_card.dart`
- `lib/features/accounts/widgets/ledger_summary.dart`
- `lib/core/routes.dart`
- `lib/main.dart`

---

## Implementation Notes

### Key Design Decisions:
1. **Two-step process**: First select account, then fetch transactions
2. **Separate models**: AccountSelectionModel for dropdown, AccountLedgerTransactionModel for transactions, LedgerResponseModel for API response
3. **Provider-based state**: All state managed in GeneralLedgerProvider
4. **Searchable dropdown**: Real-time filtering in modal
5. **Card-based display**: Each transaction is a card for better readability
6. **Summary at top**: Quick overview before scrolling transactions

### Data Flow:
```
User opens General Ledger page
  ↓
User clicks "Select Account" button
  ↓
Modal opens → Provider fetches leaf accounts
  ↓
User types to search/filter accounts
  ↓
User selects an account
  ↓
Provider fetches account ledger transactions
  ↓
Provider calculates summary
  ↓
UI displays summary + transaction cards
  ↓
User can refresh or select different account
```

### Reusable Patterns:
1. Provider structure similar to other feature providers (especially SalesProvider)
2. GraphQL service usage with executeGenericQuery (NO separate query files needed)
3. Loading/Error/Success state management
4. Search functionality with filtering
5. Modal dialog pattern
6. Card-based list display

### GraphQL Pattern:
- Use `GraphQLService.executeGenericQuery()` with sqlId and sqlArgs
- Access data via `result.data?['genericQuery']`
- Same pattern as SalesProvider, BalanceSheetProvider, etc.
- NO need to create separate GraphQL query files

---

## Expected Result

After implementation, the General Ledger page should:
- Allow users to search and select accounts from dropdown
- Display all transactions for selected account as cards
- Show summary with opening, debit, credit, closing balances
- Support pull-to-refresh
- Handle errors gracefully
- Show appropriate loading states
- Display formatted dates and amounts
- Concatenate transaction details on second line
- Work seamlessly with existing GraphQL infrastructure using executeGenericQuery

---

## Completion Checklist

- [ ] Step 1: AccountSelectionModel created with all fields from acc.json
- [ ] Step 2: AccountLedgerTransactionModel, LedgerResponseModel, and LedgerSummaryModel created
- [ ] Step 3: GeneralLedgerProvider created with executeGenericQuery pattern and proper jsonResult parsing
- [ ] Step 4: Provider registered in main.dart
- [ ] Step 5: AccountSelectionModal widget created
- [ ] Step 6: TransactionCard widget created with proper field mapping (debit/credit, otherAccounts, etc.)
- [ ] Step 7: LedgerSummary widget created
- [ ] Step 8: GeneralLedgerPage created with all features
- [ ] Step 9: Route added in routes.dart
- [ ] Step 10: Navigation added from accounts menu
- [ ] Step 11: All tests passed
- [ ] Step 12: Code reviewed and cleaned up

---

## Changes from Original Instructions (tran.md)

### Updates Based on Actual JSON Structure:

1. **Account Selection Model (acc.json)**:
   - Added all fields: id (int), accName, isSubledger, accLeaf, accParent, isDisabled
   - Original: Only mentioned id and accName

2. **Ledger Response Structure (ledger.json)**:
   - Identified nested structure: `[{ "jsonResult": {...} }]`
   - Created separate LedgerResponseModel to handle wrapper
   - Opening balance is first transaction in array (id = null, otherAccounts = "Opening balance:")
   - Original: Didn't specify nested structure or opening balance location

3. **Transaction Model Fields**:
   - Uses: debit/credit (separate fields), not amount+drcr
   - Uses: otherAccounts (contra account), not accName
   - Uses: tranDate, instrNo, autoRefNo, userRefNo, lineRefNo, lineRemarks, remarks
   - Added: tranType, branchName, branchCode, index fields
   - Original: Simplified field list in tran.md

4. **Display Logic**:
   - **Line 1**: date, autoRefNo, userRefNo, amount (RIGHT ALIGNED) with Dr/Cr appended
   - **Line 2**: otherAccounts, tranType, instrNo, lineRefNo, lineRemarks, remarks (max 3 lines)
   - Display amount with "Dr" appended if debit > 0, "Cr" appended if credit > 0 (e.g., "5,000.00 Dr")
   - Color code: Red for Dr, Green for Cr
   - Filter out opening balance rows (where id is null) in transaction cards
   - Original: Earlier mentioned max 2 lines, now updated to max 3 lines for line 2

5. **Summary Calculation**:
   - Extract opening balance from first transaction in array (credit - debit)
   - Sum debits/credits from remaining transactions (skip first row)
   - Formula: closing = opening + credits - debits
   - Original: Just mentioned showing op, debit, credit, closing

These changes ensure the implementation matches the actual API response structure while maintaining the intended functionality described in tran.md.
