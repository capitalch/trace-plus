# Sales Page Implementation Plan
## Provider + AppBar with Horizontal Scroll

### Step 1: Create SalesProvider
**Location:** `lib/providers/sales_provider.dart`
- Create `SalesProvider` class extending `ChangeNotifier`
- Fields:
  - `DateTime startDate` - initialize to today's date (DateTime.now())
  - `DateTime endDate` - initialize to today's date (DateTime.now())
- Methods for each button action:
  - `void setToday()` - sets both dates to today
  - `void setDaysAgo(int days)` - sets startDate to N days ago, endDate to today
  - `void setThisMonth()` - sets dates to first and last day of current month
  - `void setPreviousMonth(int monthsAgo)` - sets dates to first and last day of a specific previous month (e.g., monthsAgo=1 means entire last month)
  - `void setLastMonths(int months)` - sets startDate to N months ago from today, endDate to today
- Each method should:
  - Update startDate and endDate
  - Call `notifyListeners()`

### Step 2: Add Date Helper Methods in SalesProvider
- Add private helper methods in SalesProvider:
  - `DateTime _getStartOfDay(DateTime date)` - returns date at 00:00:00
  - `DateTime _getEndOfDay(DateTime date)` - returns date at 23:59:59
  - `DateTime _getStartOfMonth(DateTime date)` - returns first day of month
  - `DateTime _getEndOfMonth(DateTime date)` - returns last day of month
- Use these helpers in the setXXX methods for accurate date calculations

### Step 3: Update sales_page.dart - AppBar with Horizontal Scroll
**Location:** `lib/features/sales/sales_page.dart`
- Keep existing `leading` back button and title
- Add `bottom` property to AppBar with `PreferredSize` widget
- Inside PreferredSize:
  - Height: 60 pixels
  - Add `SingleChildScrollView` with `scrollDirection: Axis.horizontal`
  - Inside ScrollView, add `Row` with padding
- Create 9 action buttons in the Row:
  1. "Today"
  2. "1 Day Ago"
  3. "2 Days Ago"
  4. "4 Days Ago"
  5. "This Month"
  6. "Previous (-1) Month"
  7. "(-2) Month"
  8. "(-3) Month"
  9. "Last 3 Months"
- Each button implementation:
  - Wrap entire appBar content with `Consumer<SalesProvider>`
  - Use `ElevatedButton` or `OutlinedButton`
  - Add icon (e.g., Icons.calendar_today, Icons.date_range)
  - OnPressed: call appropriate provider method
    - "Today" → `provider.setToday()`
    - "1 Day Ago" → `provider.setDaysAgo(1)`
    - "2 Days Ago" → `provider.setDaysAgo(2)`
    - "4 Days Ago" → `provider.setDaysAgo(4)`
    - "This Month" → `provider.setThisMonth()`
    - "Previous (-1) Month" → `provider.setPreviousMonth(1)`
    - "(-2) Month" → `provider.setPreviousMonth(2)`
    - "(-3) Month" → `provider.setPreviousMonth(3)`
    - "Last 3 Months" → `provider.setLastMonths(3)`
  - Add horizontal spacing: `SizedBox(width: 8)` between buttons

### Step 4: Register SalesProvider in main.dart
**Location:** `lib/main.dart`
- Import `sales_provider.dart`:
  ```dart
  import 'providers/sales_provider.dart';
  ```
- In `MultiProvider` providers list (around line 54-56), add:
  ```dart
  ChangeNotifierProvider(create: (_) => SalesProvider()),
  ```
- Add it after `GlobalProvider` in the providers list

### Step 5: Update sales_page.dart Body to Show Selected Dates
**Location:** `lib/features/sales/sales_page.dart`
- Add a date display section at the top of body
- Use `Consumer<SalesProvider>` to access dates
- Display:
  - Start Date: `provider.startDate` (formatted)
  - End Date: `provider.endDate` (formatted)
- This will help verify the buttons are working correctly
- Keep existing Content and Summary sections as-is for now

## Implementation Order
1. Create SalesProvider (Steps 1, 2)
2. Update sales_page appBar (Step 3)
3. Register provider in main.dart (Step 4)
4. Add date display to verify (Step 5)

## Notes
- All model classes must end with "Model" suffix (per CLAUDE.md)
- Default dates are today's date for both startDate and endDate
- Use existing app theme colors for button styling
- Follow GlobalProvider pattern for consistency
