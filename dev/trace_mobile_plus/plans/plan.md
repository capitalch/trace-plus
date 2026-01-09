# Plan: Implement Opening Balance in General Ledger Transactions

## Overview
Add opening balance support to the General Ledger by extracting opBalance from the API response, formatting it properly, and injecting it at the beginning of the transactions list.

## Step 1: Create OpBalanceModel
**File**: `lib/models/op_balance_model.dart`
- Create a new model class `OpBalanceModel` to represent opening balance data
- Fields:
  - `double debit`
  - `double credit`
- Add `fromJson` and `toJson` methods
- Follow naming convention: model class ends with "Model"

## Step 2: Update LedgerResponseModel
**File**: `lib/models/ledger_response_model.dart`
- Add `List<OpBalanceModel>? opBalance` field to the model
- Update `fromJson` method to parse opBalance from jsonResult
- Update `toJson` method to include opBalance
- Keep the existing fields (accName, accClass, transactions)

## Step 3: Create Opening Balance Formatter Method
**File**: `lib/models/ledger_response_model.dart`
- Add a static method `_formatOpBalanceAsTransaction` that:
  - Takes `OpBalanceModel opBalance` and `String? finYearStartDate` as parameters
  - Returns `AccountLedgerTransactionModel`
  - Creates formatted opening balance with:
    - `debit`: from opBalance.debit
    - `credit`: from opBalance.credit
    - `otherAccounts`: "Opening balance:"
    - `tranDate`: finYearStartDate (from GlobalProvider)
    - `autoRefNo`: empty string ''
    - `instrNo`: null
    - `branchName`: null
    - `id`: null (to identify it as opening balance)
    - `tranType`: null
    - `userRefNo`: null
    - `lineRemarks`: null
    - `lineRefNo`: null
    - `remarks`: null
    - `branchCode`: null
    - `tranTypeId`: null

## Step 4: Update fromApiResponse Method
**File**: `lib/models/ledger_response_model.dart`
- Modify `fromApiResponse` static method to:
  - Accept an additional optional parameter: `String? finYearStartDate`
  - Extract opBalance array from jsonResult
  - If opBalance exists and has data:
    - Format the first opBalance entry using the formatter method
    - Inject the formatted opening balance at the beginning (index 0) of transactions list
  - Return LedgerResponseModel with injected opening balance transaction

## Step 5: Update GeneralLedgerProvider
**File**: `lib/providers/general_ledger_provider.dart`
- In `fetchAccountLedger` method:
  - Get the finYearStartDate from `globalProvider.selectedFinYear?.startDate`
  - Pass finYearStartDate to `LedgerResponseModel.fromApiResponse()` call
  - Update the call from:
    ```dart
    final ledgerData = LedgerResponseModel.fromApiResponse(data);
    ```
    to:
    ```dart
    final finYearStartDate = globalProvider.selectedFinYear?.startDate;
    final ledgerData = LedgerResponseModel.fromApiResponse(data, finYearStartDate);
    ```

## Step 6: Update TransactionCard Display
**File**: `lib/features/accounts/widgets/transaction_card.dart`
- Opening balance will ALWAYS be displayed as the first transaction card
- Remove or comment out the check at lines 53-56 that hides opening balance:
  ```dart
  if (transaction.isOpeningBalance) {
    return const SizedBox.shrink();
  }
  ```
- Opening balance should display:
  - Date from finYear startDate
  - "Opening balance:" as otherAccounts
  - Debit/Credit amount appropriately
  - Index #1

## Step 7: Update Summary Calculation
**File**: `lib/providers/general_ledger_provider.dart` or `lib/models/ledger_summary_model.dart`
- Summary calculations include ALL transactions (including opening balance):
  - Total Debit = sum of ALL transaction debits (including opening balance)
  - Total Credit = sum of ALL transaction credits (including opening balance)
  - Closing Balance = Total Credit - Total Debit (with Dr/Cr sign)
    - If result is positive: display with "Cr" suffix (e.g., "5,000.00 Cr")
    - If result is negative: display absolute value with "Dr" suffix (e.g., "3,000.00 Dr")
    - If result is zero: display "0.00"
- Summary should show:
  - Total Debit
  - Total Credit
  - Closing Balance (with Dr/Cr sign)

## Step 8: Testing
- Test with accounts that have:
  1. Opening balance with debit > 0, credit = 0
  2. Opening balance with credit > 0, debit = 0
  3. Opening balance with both debit and credit > 0
  4. Opening balance with both = 0
  5. No opening balance (opBalance array is empty or null)
- Verify opening balance appears at the beginning (index #1)
- Verify amounts display correctly with Dr/Cr notation
- Verify date shows financial year start date
- Verify the index chip and card display correctly
- Verify summary calculations are correct

## Files to be Modified/Created
1. **NEW**: `lib/models/op_balance_model.dart`
2. **MODIFY**: `lib/models/ledger_response_model.dart`
3. **MODIFY**: `lib/providers/general_ledger_provider.dart`
4. **VERIFY**: `lib/features/accounts/widgets/transaction_card.dart`
5. **VERIFY**: `lib/models/ledger_summary_model.dart` (if summary calculation needs update)

## Notes
- Opening balance will ALWAYS be displayed as the first transaction (index 1)
- The existing `isOpeningBalance` helper in AccountLedgerTransactionModel identifies opening balance by checking `id == null && otherAccounts == 'Opening balance:'`
- Consider edge cases: missing finYearStartDate, empty opBalance array, null values
- Follow the existing code patterns and naming conventions
- The opBalance data is already in the API response in the `jsonResult.opBalance` field
- opBalance does not have branchName field, only debit and credit
- Multiple branches are not needed - use the first opBalance entry only

## Implementation Order
1. Create OpBalanceModel (Step 1)
2. Update LedgerResponseModel to parse opBalance (Step 2)
3. Create formatter method (Step 3)
4. Update fromApiResponse to inject opening balance (Step 4)
5. Update GeneralLedgerProvider to pass finYearStartDate (Step 5)
6. Update TransactionCard to show opening balance (Step 6)
7. Verify summary calculations (Step 7)
8. Test all scenarios (Step 8)
