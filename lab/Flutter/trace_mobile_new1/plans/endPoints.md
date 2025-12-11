# Trace Mobile App - API URLs and SQL Keys Analysis

**Date**: 2025-12-07
**Package**: trace_mobile
**Analysis**: Complete inventory of all API endpoints and SQL identifiers

---

## API Endpoints (URLs)

All API calls connect to a single GraphQL endpoint defined in `lib\common\classes\global_settings.dart:8-10`

### Production Environment
```
https://develop.cloudjiffy.net/graphql
```

### Development Environment
```
https://develop.cloudjiffy.net/graphql
```

### Alternative Local Endpoint (Commented)
```
http://10.0.2.2:5000/graphql
```
*Note: This is for Android emulator local development*

### Server Selection Logic
- **Release Mode**: Uses `webUrl` constant
- **Debug Mode**: Uses `localUrl` constant
- **Current State**: Both environments point to CloudJiffy server

---

## GraphQL Operations

All GraphQL operations are defined in `lib\common\classes\graphql_queries.dart`

### 1. Login Query
**Location**: `lib\common\classes\graphql_queries.dart:9`
**Type**: Query
**Name**: `login`
**Entity**: `authentication`

```graphql
query login {
  authentication {
    doLogin(credentials: "{credentials}")
  }
}
```

**Purpose**: User authentication

---

### 2. Generic Update Master Mutation
**Location**: `lib\common\classes\graphql_queries.dart:24`
**Type**: Mutation
**Name**: `genericUpdateMaster`

```graphql
mutation genericUpdateMaster {
  {entityName} {
    genericUpdateMaster(value: "{encoded_json}")
  }
}
```

**Parameters**:
- `sqlKey` (optional): SQL query identifier
- `args`: Data to update/insert
- `tableName`: Target database table
- `entityName`: GraphQL entity name

**Purpose**: Generic data update/insert operations

---

### 3. Generic View Query
**Location**: `lib\common\classes\graphql_queries.dart:47`
**Type**: Query
**Name**: `genericView`

```graphql
query genericView {
  {entityName} {
    genericView(value: "{encoded_json}")
  }
}
```

**Parameters**:
- `sqlKey`: SQL query identifier (required)
- `isMultipleRows`: Boolean flag for single/multiple rows
- `args`: Query arguments
- `entityName`: GraphQL entity name (default: 'accounts')

**Purpose**: Generic data retrieval operations

---

### 4. Trial Balance Query
**Location**: `lib\common\classes\graphql_queries.dart:60`
**Type**: Query
**Name**: `trialBalance`
**Entity**: `accounts`

```graphql
query trialBalance {
  accounts {
    trialBalance()
  }
}
```

**Purpose**: Retrieve accounting trial balance data

---

### 5. Balance Sheet & Profit/Loss Query
**Location**: `lib\common\classes\graphql_queries.dart:73`
**Type**: Query
**Name**: `balanceSheetProfitLoss`
**Entity**: `accounts`

```graphql
query balanceSheetProfitLoss {
  accounts {
    balanceSheetProfitLoss()
  }
}
```

**Purpose**: Retrieve balance sheet and profit & loss statement

---

## SQL Keys (Backend Query Identifiers)

SQL keys are string identifiers passed to the backend to execute specific queries.

### 1. getJson_datacache_mobile
**Location**: `lib\common\classes\utils.dart:18`
**Operation**: `genericView`
**Entity**: `accounts`

**Arguments**:
```dart
{
  'nowDate': DateTime.now().toIso8601String()
}
```

**Purpose**: Load application cache data including:
- Unit information
- Branch list
- Financial years
- Current financial year details

**Returns**: JSON object with `branches`, `nowFinYearIdDates`, `finYears`, `unitInfo`

---

### 2. get_allTransactions
**Location**: `lib\features\transactions\widgets\transactions_body.dart:24`
**Operation**: `genericView`
**Entity**: `accounts`

**Purpose**: Retrieve all transaction records

**Used In**: Transactions page body

---

### 3. get_accountsLedger
**Location**: `lib\features\accounts\widgets\general_ledger_body.dart:17`
**Operation**: `genericView`
**Entity**: `accounts`

**Arguments**: Includes account-specific parameters

**Purpose**: Retrieve general ledger entries for accounting module

**Used In**: Accounts general ledger view

---

### 4. get_products_info
**Locations**:
- `lib\features\products\widgets\products_summary.dart:40`
- `lib\features\dashboard\widgets\dashboard_bottom_navigation_bar.dart:49`

**Operation**: `genericView`
**Entity**: `accounts`

**Arguments**:
```dart
{
  'onDate': null,
  'isAll': true,
  'days': 0
}
```

**Purpose**: Retrieve product inventory information including:
- Product counts and quantities
- Stock values (with and without GST)
- Age analysis (360-day aging)
- Opening balances
- Difference values

**Used In**:
- Products summary widget
- Dashboard navigation

---

### 5. get_sale_report
**Location**: `lib\features\sales\widgets\sales_report_body.dart:31`
**Operation**: `genericView`
**Entity**: `accounts`

**Arguments**:
```dart
{
  'startDate': 'YYYY-MM-DD',
  'endDate': 'YYYY-MM-DD',
  'tagId': '0',
  'days': 0
}
```

**Purpose**: Retrieve sales report data for specified date range

**Used In**: Sales report body widget

---

### 6. get_business_health
**Location**: `lib\features\health\business_health.dart:59`
**Operation**: `genericView`
**Entity**: `accounts`

**Purpose**: Retrieve business health metrics and KPIs

**Used In**: Business health dashboard

---

## Database Tables

### TraceUser
**Location**: `lib\features\dashboard\widgets\dashboard_app_bar.dart:119`
**Operation**: `genericUpdateMaster`
**Entity**: `authentication`

**Fields Updated**:
```dart
{
  'id': userId,  // Primary key for update
  'lastUsedBuCode': businessUnitCode
}
```

**Purpose**: Store user preferences and last selected business unit

---

## GraphQL Entity Names

### 1. authentication
**Purpose**: User authentication and user management operations
**Operations**: Login, user preference updates

### 2. accounts
**Purpose**: Financial, inventory, and business data operations
**Operations**: Most data queries (default entity)

---

## HTTP Headers

Custom headers sent with authenticated GraphQL requests:

### Authorization Header
```
authorization: Bearer {token}
```
**Source**: User login token
**Location**: `lib\common\classes\global_settings.dart:53`

### Selection Criteria Header
```
SELECTION-CRITERIA: {buCode}:{finYearId}:{branchId}
```
**Format**: Business unit code, financial year ID, and branch ID separated by colons
**Location**: `lib\common\classes\global_settings.dart:54`
**Purpose**: Context selection for multi-tenant data filtering

---

## Authentication Flow

1. User provides credentials
2. App calls `login` query via `graphQLLoginClient`
3. Backend returns JWT token and user data
4. Token stored in secure storage via `flutter_secure_storage`
5. Subsequent requests use token in Authorization header
6. SELECTION-CRITERIA header provides business context

**Token Storage**: `lib\common\classes\data_store.dart` (via FlutterSecureStorage)

---

## Data Models and State Management

### Provider Pattern
The app uses the Provider package for state management with these key providers:

- **GlobalSettings**: Authentication state, business unit selection, server configuration
- **SalesState**: Sales report data and filters
- **ProductsSearchState**: Product search functionality
- **ProductsSummaryState**: Product inventory summaries
- **TransactionsState**: Transaction listing state
- **AccountsState**: Accounting module states

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **API Endpoints** | 2 (same server, different modes) |
| **GraphQL Operations** | 5 (4 queries, 1 mutation) |
| **SQL Keys** | 6 unique identifiers |
| **Database Tables** | 1 (TraceUser) |
| **Entity Names** | 2 (authentication, accounts) |
| **HTTP Headers** | 2 custom headers |

---

## Architecture Notes

1. **Single Backend**: All communication through one GraphQL endpoint
2. **No REST APIs**: Purely GraphQL-based communication
3. **Generic Queries**: Most data fetched via `genericView` with SQL keys
4. **Server-Side SQL**: SQL execution happens on backend, not in mobile app
5. **Secure Storage**: Tokens and credentials stored using platform-specific secure storage
6. **Multi-Tenant**: Business unit and branch context sent with every request

---

## Files Reference

### Core API Files
- `lib\common\classes\global_settings.dart` - Server URLs, GraphQL clients, authentication
- `lib\common\classes\graphql_queries.dart` - All GraphQL query/mutation definitions
- `lib\common\classes\utils.dart` - Utility functions including data cache loader
- `lib\common\classes\data_store.dart` - Secure storage wrapper

### Feature-Specific Files
- `lib\features\transactions\widgets\transactions_body.dart` - Transactions queries
- `lib\features\accounts\widgets\general_ledger_body.dart` - Accounting ledger queries
- `lib\features\products\widgets\products_summary.dart` - Product info queries
- `lib\features\sales\widgets\sales_report_body.dart` - Sales report queries
- `lib\features\health\business_health.dart` - Business health metrics
- `lib\features\dashboard\widgets\dashboard_bottom_navigation_bar.dart` - Dashboard queries
- `lib\features\dashboard\widgets\dashboard_app_bar.dart` - User preference updates

---

## Recommendations

1. **Environment Configuration**: Consider using environment variables or build flavors for server URLs
2. **Error Handling**: Implement consistent error handling across all GraphQL queries
3. **Caching**: Consider implementing GraphQL cache policies for offline support
4. **Documentation**: Document expected response formats for each SQL key
5. **Type Safety**: Consider using code generation for GraphQL (e.g., graphql_codegen)

---

*End of Analysis*
