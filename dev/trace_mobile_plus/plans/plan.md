# Plan: Include lineRemarks, lineRefNo, and instrNo in transactions_page

## Overview
Add display of line-level details (lineRemarks, lineRefNo, instrNo) to the transactions_page.dart for each debit and credit line in transaction cards.

## Current Status
- ✅ lineRemarks field exists in TransactionLineModel
- ❌ lineRefNo field does NOT exist in TransactionLineModel (needs to be added)
- ❌ instrNo field does NOT exist in TransactionLineModel (needs to be added)
- ❌ None of these fields are currently displayed in transactions_page.dart
- Note: Do NOT modify sales_page.dart - only transactions_page.dart and supporting files

## Steps

### Step 1: Add lineRefNo and instrNo fields to TransactionLineModel
**File:** `lib/models/grouped_transaction_model.dart`

**Actions:**
1. Add `lineRefNo` field (String?, nullable)
2. Add `instrNo` field (String?, nullable)
3. Update constructor to accept these new fields
4. Update `toString()` method to include new fields

**Current code:**
```dart
class TransactionLineModel {
  final String accName;
  final double amount;
  final String? lineRemarks;

  TransactionLineModel({
    required this.accName,
    required this.amount,
    this.lineRemarks,
  });
}
```

**Updated code:**
```dart
class TransactionLineModel {
  final String accName;
  final double amount;
  final String? lineRemarks;
  final String? lineRefNo;
  final String? instrNo;

  TransactionLineModel({
    required this.accName,
    required this.amount,
    this.lineRemarks,
    this.lineRefNo,
    this.instrNo,
  });

  @override
  String toString() {
    return 'TransactionLineModel(accName: $accName, amount: $amount, lineRemarks: $lineRemarks, lineRefNo: $lineRefNo, instrNo: $instrNo)';
  }
}
```

---

### Step 2: Update TransactionsProvider to populate new fields
**File:** `lib/providers/transactions_provider.dart`

**Actions:**
1. Locate where `TransactionLineModel` instances are created from API response
2. Update the mapping to include `lineRefNo` and `instrNo` from the API data
3. Ensure proper null handling for optional fields

**Search for:**
- Look for where `TransactionLineModel` is instantiated
- Check the data mapping logic from API response
- Verify field names match the API response (lineRefNo, instrNo, line_ref_no, instr_no, etc.)

**Expected update:**
```dart
TransactionLineModel(
  accName: data['accName'],
  amount: data['amount'],
  lineRemarks: data['lineRemarks'],
  lineRefNo: data['lineRefNo'],    // Add this
  instrNo: data['instrNo'],        // Add this
)
```

---

### Step 3: Locate debit lines rendering section
**File:** `lib/features/transactions/transactions_page.dart` (around lines 743-782)

**Actions:**
1. Find the `_buildGroupedTransactionCard` method
2. Locate the debit lines rendering: `transaction.debitLines.map()`
3. Identify the current Row structure

---

### Step 4: Update debit lines to include line details
**File:** `lib/features/transactions/transactions_page.dart` (around lines 743-782)

**Actions:**
1. Change the structure from a single Row to a Column
2. Keep the existing Row as the first child (icon + accName + amount)
3. Add conditional line details display as the second child

**New structure:**
```dart
...transaction.debitLines.map(
  (line) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Existing Row with icon, accName, amount
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(width: 4),
            Padding(
              padding: const EdgeInsets.only(top: 7),
              child: Icon(
                Icons.circle,
                size: 6,
                color: Colors.green[600],
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                line.accName,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey[800],
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              currencyFormatter.format(line.amount),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Colors.green[700],
              ),
            ),
          ],
        ),
        // New: Line details (lineRefNo, instrNo, lineRemarks)
        if (line.lineRefNo != null || line.instrNo != null || line.lineRemarks != null)
          Padding(
            padding: const EdgeInsets.only(left: 18, top: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Line 1: lineRefNo and instrNo (if present)
                if ((line.lineRefNo != null && line.lineRefNo!.isNotEmpty) ||
                    (line.instrNo != null && line.instrNo!.isNotEmpty))
                  Row(
                    children: [
                      Icon(Icons.info_outline, size: 11, color: Colors.green[600]),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          [
                            if (line.lineRefNo != null && line.lineRefNo!.isNotEmpty)
                              'Ref: ${line.lineRefNo}',
                            if (line.instrNo != null && line.instrNo!.isNotEmpty)
                              'Instr: ${line.instrNo}',
                          ].join(' • '),
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.grey[700],
                            fontStyle: FontStyle.italic,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                // Line 2: lineRemarks (if present)
                if (line.lineRemarks != null &&
                    line.lineRemarks!.isNotEmpty &&
                    line.lineRemarks!.toLowerCase() != 'null')
                  Padding(
                    padding: EdgeInsets.only(
                      top: (line.lineRefNo != null || line.instrNo != null) ? 2 : 0,
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.comment, size: 11, color: Colors.green[600]),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            line.lineRemarks!,
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.grey[700],
                              fontStyle: FontStyle.italic,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
      ],
    ),
  ),
)
```

---

### Step 5: Update credit lines to include line details
**File:** `lib/features/transactions/transactions_page.dart` (around lines 879-918)

**Actions:**
1. Apply the same Column structure as debits
2. Use red color scheme instead of green
3. Ensure consistent formatting

**New structure:**
```dart
...transaction.creditLines.map(
  (line) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Existing Row with icon, accName, amount
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(width: 4),
            Padding(
              padding: const EdgeInsets.only(top: 7),
              child: Icon(
                Icons.circle,
                size: 6,
                color: Colors.red[600],
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                line.accName,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey[800],
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              currencyFormatter.format(line.amount),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Colors.red[700],
              ),
            ),
          ],
        ),
        // New: Line details (lineRefNo, instrNo, lineRemarks)
        if (line.lineRefNo != null || line.instrNo != null || line.lineRemarks != null)
          Padding(
            padding: const EdgeInsets.only(left: 18, top: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Line 1: lineRefNo and instrNo (if present)
                if ((line.lineRefNo != null && line.lineRefNo!.isNotEmpty) ||
                    (line.instrNo != null && line.instrNo!.isNotEmpty))
                  Row(
                    children: [
                      Icon(Icons.info_outline, size: 11, color: Colors.red[600]),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          [
                            if (line.lineRefNo != null && line.lineRefNo!.isNotEmpty)
                              'Ref: ${line.lineRefNo}',
                            if (line.instrNo != null && line.instrNo!.isNotEmpty)
                              'Instr: ${line.instrNo}',
                          ].join(' • '),
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.grey[700],
                            fontStyle: FontStyle.italic,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                // Line 2: lineRemarks (if present)
                if (line.lineRemarks != null &&
                    line.lineRemarks!.isNotEmpty &&
                    line.lineRemarks!.toLowerCase() != 'null')
                  Padding(
                    padding: EdgeInsets.only(
                      top: (line.lineRefNo != null || line.instrNo != null) ? 2 : 0,
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.comment, size: 11, color: Colors.red[600]),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            line.lineRemarks!,
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.grey[700],
                              fontStyle: FontStyle.italic,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
      ],
    ),
  ),
)
```

---

### Step 6: Run flutter analyze
**Command:** `flutter analyze lib/models/grouped_transaction_model.dart lib/providers/transactions_provider.dart lib/features/transactions/transactions_page.dart`

**Actions:**
1. Check for any linting errors
2. Fix any type errors
3. Verify proper null safety handling

---

### Step 7: Test the implementation
**Test scenarios:**
1. Transaction with all three fields (lineRefNo, instrNo, lineRemarks)
2. Transaction with only lineRefNo
3. Transaction with only instrNo
4. Transaction with only lineRemarks
5. Transaction with lineRefNo + instrNo (no remarks)
6. Transaction with no line details
7. Transaction with null values
8. Transaction with empty strings
9. Transaction with lineRemarks = "null" (should be hidden)
10. Long text in any field (verify ellipsis)
11. Mixed lines (some with details, some without)

**Testing steps:**
1. Run: `flutter run`
2. Navigate to transactions_page
3. Verify all fields display correctly
4. Check color coding (green for debits, red for credits)
5. Verify text overflow handling
6. Test on different screen sizes

---

## Design Specifications

### Display Conditions

**lineRefNo and instrNo:**
- Only show if not null AND not empty
- Display on first line with bullet separator
- Format: "Ref: ABC123 • Instr: CHECK001"

**lineRemarks:**
- Only show if ALL of the following are true:
  - `line.lineRemarks != null`
  - `line.lineRemarks!.isNotEmpty`
  - `line.lineRemarks!.toLowerCase() != 'null'`
- Display on second line (or first line if no ref/instr)

### Styling for Debit Lines

**lineRefNo + instrNo:**
- **Icon:** Icons.info_outline
- **Icon size:** 11px
- **Icon color:** Colors.green[600]
- **Font size:** 10px
- **Text color:** Colors.grey[700]
- **Font style:** FontStyle.italic
- **Overflow:** TextOverflow.ellipsis

**lineRemarks:**
- **Icon:** Icons.comment
- **Icon size:** 11px
- **Icon color:** Colors.green[600]
- **Font size:** 10px
- **Text color:** Colors.grey[700]
- **Font style:** FontStyle.italic
- **Max lines:** 2
- **Overflow:** TextOverflow.ellipsis

### Styling for Credit Lines
Same as debit lines, but use Colors.red[600] for icon colors instead of green.

### Layout Spacing
- **Left padding:** 18px (aligns with account name)
- **Top padding (from main row):** 4px
- **Spacing between ref/instr line and remarks line:** 2px
- **Icon-to-text spacing:** 4px

### Visual Layout Examples

**Example 1: All three fields**
```
• Account Name                    1,234.56
  ℹ️ Ref: INV-001 • Instr: CHECK-123
  💬 Payment for services rendered
```

**Example 2: Only lineRemarks**
```
• Account Name                    1,234.56
  💬 Payment received
```

**Example 3: Only lineRefNo and instrNo**
```
• Account Name                    1,234.56
  ℹ️ Ref: INV-001 • Instr: CHECK-123
```

**Example 4: No details**
```
• Account Name                    1,234.56
```

---

## Files to Modify

1. ✅ `lib/models/grouped_transaction_model.dart` - Add lineRefNo and instrNo fields
2. ✅ `lib/providers/transactions_provider.dart` - Update data mapping
3. ✅ `lib/features/transactions/transactions_page.dart` - UI updates for both debit and credit sections

## Files to Reference (No changes)
None - only the above files need modification

---

## Important Notes
- **Do NOT modify sales_page.dart** - only transactions_page.dart and supporting files
- Need to verify API field names (might be snake_case like line_ref_no, instr_no)
- Ensure data is being fetched from the API for all three fields
- Handle null values gracefully

---

## Backend Considerations
- Verify that lineRefNo and instrNo are available in the API response
- Check field naming convention in API (camelCase vs snake_case)
- May need to update GraphQL query or SQL to fetch these fields if not already included

---

## Expected Result
After implementation, each debit and credit line in transaction cards on transactions_page will optionally display up to three pieces of additional information:
1. Reference number and instrument number (on one line, separated by bullet)
2. Line remarks (on separate line, allowing 2 lines of text)

This provides complete line-level transparency for transaction audit trails.
