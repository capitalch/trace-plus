# Plan: Add Product Code to Line 3 of Product Card

## Current Behavior
Line 3 (`_buildLine3`) displays:
- Basic Price: ₹X,XXX.XX
- Info (if available)
- HSN (if available)
- GST rate (if available)

## Required Change
Add `Pr Code: {productCode}` to line 3.

## Confirmed
- `ProductsModel` has `productCode` field (String) - verified in `lib/models/products_model.dart:3`

---

## Step 1: Add Product Code to _buildLine3
**File:** `lib/features/products/products_page.dart`
**Location:** Lines 1175-1197 (inside the `children` array of RichText)

Add a new TextSpan for product code after the GST rate.

**Current code (end of children array):**
```dart
children: [
  // Basic Price in bold
  const TextSpan(
    text: 'Basic Price: ',
    style: TextStyle(fontWeight: FontWeight.bold),
  ),
  TextSpan(
    text: '₹${priceFormat.format(product.lastPurchasePrice)}',
    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Colors.black),
  ),

  // Add info if available
  if (product.info.isNotEmpty)
    TextSpan(text: ' • ${product.info}'),

  // Add HSN if available
  if (product.hsn != 0)
    TextSpan(text: ' • HSN: ${product.hsn}'),

  // Add GST rate if available
  if (product.gstRate > 0)
    TextSpan(text: ' • GST: ${product.gstRate.toStringAsFixed(1)}%'),
],
```

**New code:**
```dart
children: [
  // Basic Price in bold
  const TextSpan(
    text: 'Basic Price: ',
    style: TextStyle(fontWeight: FontWeight.bold),
  ),
  TextSpan(
    text: '₹${priceFormat.format(product.lastPurchasePrice)}',
    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Colors.black),
  ),

  // Add info if available
  if (product.info.isNotEmpty)
    TextSpan(text: ' • ${product.info}'),

  // Add HSN if available
  if (product.hsn != 0)
    TextSpan(text: ' • HSN: ${product.hsn}'),

  // Add GST rate if available
  if (product.gstRate > 0)
    TextSpan(text: ' • GST: ${product.gstRate.toStringAsFixed(1)}%'),

  // Add product code if available
  if (product.productCode.isNotEmpty)
    TextSpan(text: ' • Pr Code: ${product.productCode}'),
],
```

---

## Summary

| Before | After |
|--------|-------|
| Basic Price • Info • HSN • GST | Basic Price • Info • HSN • GST • Pr Code |

## Files to Modify
- `lib/features/products/products_page.dart` (line ~1196, inside `_buildLine3`)

## Testing
1. Open Products page
2. View a product card with a product code
3. Line 3 should show: `Basic Price: ₹X,XXX.XX • Info • HSN: XXXX • GST: X.X% • Pr Code: ABC123`
4. If product code is empty, it should not appear
