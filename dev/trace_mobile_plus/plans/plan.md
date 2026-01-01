# Plan: Display Line Details (lineRefNo, instrNo, lineRemarks) for Debit/Credit Entries

## Problem
Currently, each debit and credit entry only displays the account name and amount. Additional line-level details (lineRefNo, instrNo, lineRemarks) are not shown, which limits the information available to users.

## Goal
Display lineRefNo, instrNo, and lineRemarks below each debit/credit entry row in a nicely formatted, smaller font when these values are present.

## Current State Analysis

### TransactionLineModel (lib/models/grouped_transaction_model.dart)
Currently has:
- `accName` (String)
- `amount` (double)
- `lineRemarks` (String?)

**Missing fields:**
- `lineRefNo` (String?)
- `instrNo` (String?)

### UI Display (lib/features/transactions/transactions_page.dart)
- Lines ~746-780: Debits section - displays icon, accName, amount
- Lines ~878-915: Credits section - displays icon, accName, amount
- No additional line details are currently displayed

## Solution Steps

### Step 1: Update TransactionLineModel to include missing fields
**File:** `lib/models/grouped_transaction_model.dart`

**Actions:**
1. Add `lineRefNo` field (String?, nullable)
2. Add `instrNo` field (String?, nullable)
3. Update constructor to accept these new fields
4. Update `toString()` method to include new fields

**Expected result:**
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
}
```

---

### Step 2: Update data fetching to populate new fields
**File:** `lib/providers/transactions_provider.dart`

**Actions:**
1. Locate where `TransactionLineModel` instances are created from API response
2. Update the mapping to include `lineRefNo` and `instrNo` from the API data
3. Ensure proper null handling for optional fields

**Notes:**
- Check the API response structure to confirm field names
- May need to update GraphQL query or SQL if fields are not currently fetched

---

### Step 3: Create helper widget for displaying line details
**File:** `lib/features/transactions/transactions_page.dart`

**Actions:**
1. Create a helper method `_buildLineDetails()` that:
   - Takes lineRefNo, instrNo, lineRemarks as parameters
   - Returns a Widget (or null if no details present)
   - Displays details in a compact, formatted manner
2. Design:
   - Smaller font size (10-11px)
   - Grey color for subtle appearance
   - Icons or labels for each field type
   - Horizontal or vertical layout depending on content

**Example layout:**
```
Account Name                     1,234.56
  📄 Ref: ABC123 | 📝 Instr: CHECK001 | 💬 Note: Payment for invoice
```

**Alternative compact layout:**
```
Account Name                     1,234.56
  Ref: ABC123 • Instr: CHECK001
  Remarks: Payment for invoice
```

---

### Step 4: Integrate line details into Debits section
**File:** `lib/features/transactions/transactions_page.dart`
**Lines:** ~746-780

**Actions:**
1. Modify the debit line mapping (transaction.debitLines.map)
2. Change from Row to Column for each line item
3. Add the main Row (icon + accName + amount) as first child
4. Add `_buildLineDetails()` as second child if details exist
5. Adjust padding/spacing for visual hierarchy

**Structure:**
```dart
...transaction.debitLines.map(
  (line) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Existing Row with icon, accName, amount
        Row(...),
        // New: Line details
        if (line.lineRefNo != null || line.instrNo != null || line.lineRemarks != null)
          _buildLineDetails(
            lineRefNo: line.lineRefNo,
            instrNo: line.instrNo,
            lineRemarks: line.lineRemarks,
            color: Colors.green[700]!, // Match debit color
          ),
      ],
    ),
  ),
)
```

---

### Step 5: Integrate line details into Credits section
**File:** `lib/features/transactions/transactions_page.dart`
**Lines:** ~878-915

**Actions:**
1. Apply the same changes as Step 4 to the credits section
2. Use red color scheme to match credit styling
3. Ensure consistent formatting with debits section

---

### Step 6: Implement _buildLineDetails helper method
**File:** `lib/features/transactions/transactions_page.dart`

**Implementation approach:**
```dart
Widget? _buildLineDetails({
  String? lineRefNo,
  String? instrNo,
  String? lineRemarks,
  required Color color,
}) {
  // Collect non-null details
  final details = <String>[];
  if (lineRefNo != null && lineRefNo.isNotEmpty) {
    details.add('Ref: $lineRefNo');
  }
  if (instrNo != null && instrNo.isNotEmpty) {
    details.add('Instr: $instrNo');
  }

  // Return null if no details
  if (details.isEmpty && (lineRemarks == null || lineRemarks.isEmpty)) {
    return null;
  }

  return Padding(
    padding: const EdgeInsets.only(left: 18, top: 2, bottom: 2),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // First line: Ref and Instr (if present)
        if (details.isNotEmpty)
          Text(
            details.join(' • '),
            style: TextStyle(
              fontSize: 10,
              color: color.withOpacity(0.8),
              fontStyle: FontStyle.italic,
            ),
          ),
        // Second line: Remarks (if present)
        if (lineRemarks != null && lineRemarks.isNotEmpty)
          Text(
            lineRemarks,
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey[700],
              fontStyle: FontStyle.italic,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
      ],
    ),
  );
}
```

---

### Step 7: Test with various data scenarios
**Test cases:**
1. Line with all three fields populated
2. Line with only lineRefNo
3. Line with only instrNo
4. Line with only lineRemarks
5. Line with lineRefNo + instrNo
6. Line with no additional details (should show no extra row)
7. Line with long remarks text (test ellipsis)
8. Transaction with mix of lines (some with details, some without)

---

### Step 8: Adjust spacing and styling
**Fine-tuning:**
1. Verify the 18px left padding aligns details with accName
2. Adjust font sizes if needed (10-11px range)
3. Ensure color contrast is readable but subtle
4. Check that details don't make cards too tall
5. Verify on different screen sizes

---

## Design Mockup

### Before (Current):
```
• Account Name                    1,234.56
• Another Account                 5,678.90
```

### After (With Details):
```
• Account Name                    1,234.56
  Ref: INV-001 • Instr: CHECK-123
  Remarks: Payment for services rendered

• Another Account                 5,678.90
```

## Files to Modify
1. `lib/models/grouped_transaction_model.dart` - Add fields to TransactionLineModel
2. `lib/providers/transactions_provider.dart` - Update data mapping
3. `lib/features/transactions/transactions_page.dart` - UI updates for both sections

## Backend Considerations
- Verify that lineRefNo and instrNo are available in the API response
- May need to update GraphQL query/SQL to fetch these fields
- Check field names in database (line_ref_no, instr_no, line_remarks)

## Expected Benefits
- Users can see complete line-level information
- Better transparency for transaction details
- Improved audit trail visibility
- More professional appearance

## Styling Guidelines
- **Font size:** 10px (smaller than main text which is 13px)
- **Color:** Semi-transparent version of section color (green for debits, red for credits)
- **Remarks color:** Grey[700] for neutral appearance
- **Spacing:** 2px top padding, 18px left indent (aligns with account name)
- **Separator:** Use bullet point (•) between Ref and Instr
- **Max lines:** 2 for remarks with ellipsis overflow
