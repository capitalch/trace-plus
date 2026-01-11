# Plan: Update General Ledger Page AppBar with Unit Info

## Objective
Modify the General Ledger page to display unitName, finYear, and branch in the main appBar (similar to Balance Sheet page) and remove unitName from the secondary appBar, keeping only the account name.

## Current State Analysis

### In general_ledger_page.dart:
- **Main AppBar** (lines 154-188): Shows only "General Ledger" title
- **Secondary AppBar** (lines 88-140): Shows account name AND unitName

### In balance_sheet_page.dart (reference):
- **Main AppBar** (lines 130-163): Shows:
  - Page title: "Balance Sheet"
  - Subtitle: "unitName | FY: finYear | Branch: branchCode"
  - Uses Consumer<GlobalProvider> to access the data

## Implementation Steps

### Step 1: Modify Main AppBar Title
Update the `title` property in the main AppBar (around line 168) to use Consumer<GlobalProvider> and display:
- Primary text: "General Ledger"
- Secondary text: "unitName | FY: finYear | Branch: branchCode"

**Implementation details:**
- Wrap title in Consumer<GlobalProvider>
- Access globalProvider.unitName
- Access globalProvider.selectedFinYear?.finYearId
- Access globalProvider.selectedBranch?.branchCode
- Use Column widget with CrossAxisAlignment.start
- First Text widget: "General Ledger" with fontSize 16, fontWeight bold, white color
- Add SizedBox(height: 2)
- Second Text widget: formatted info string with fontSize 11, fontWeight bold, white color
- Set maxLines: 3, overflow: TextOverflow.visible

### Step 2: Remove unitName from Secondary AppBar
Update the `_buildSecondaryAppBar` method (lines 88-140) to:
- Keep only the account name display
- Remove the unitName Text widget and Flexible wrapper (lines 121-133)
- Remove the SizedBox(width: 8) separator (line 120)
- Keep the account name as the only child in the Row

**Implementation details:**
- In the Row children, keep only the Expanded widget with account name
- Remove the SizedBox and Flexible widgets showing unitName
- Maintain the same styling for account name (fontSize 14, fontWeight bold)

### Step 3: Test the Changes
Verify the following:
- Main appBar displays unitName, finYear, and branch below "General Ledger" title
- Text wraps properly if unit name or other info is long
- Secondary appBar shows only the selected account name
- Visual consistency with Balance Sheet page layout
- No overflow or layout issues on different screen sizes

## Files to Modify
1. `lib/features/accounts/general_ledger_page.dart`

## Reference Files
- `lib/features/accounts/balance_sheet_page.dart` (lines 130-163 for appBar implementation pattern)
