# Plan: Redesign Product Card in Products Page

## Overview
Redesign the product card UI in `products_page.dart` with a new 4-line layout and conditional styling based on product age.

## Requirements Summary
- **File to modify**: `lib/features/products/products_page.dart`
- **Method to update**: `_buildProductCard`
- **New Layout**: 4 distinct lines with specific information
- **Conditional Styling**: Light pink background when age > 360 days
- **Design Goal**: Clean, modern card layout

## Current vs New Layout

### Current Layout:
- Product code chip + label
- Category + Brand
- Stock information (opening, closing, sales, age)
- Pricing (sale price, purchase price)
- HSN + GST rate

### New Layout:
- **Line 1**: Age, Sale, MaxRetailPrice
- **Line 2**: BrandName + CatName + Label (concatenated) | Clos (in black rounded box)
- **Line 3**: Info + HSN + GstRate (concatenated)
- **Line 4**: LastPurchasePriceGst, SalePriceGst

---

## Step 1: Update _buildProductCard Method Structure

**File**: `lib/features/products/products_page.dart`

**Current location**: Line ~213

**Action**: Completely redesign the `_buildProductCard` method

### Card Container Updates:
```dart
Widget _buildProductCard(ProductsModel product) {
  // Determine background color based on age
  final bool isOldStock = product.age > 360;
  final Color cardColor = isOldStock ? Colors.pink[50]! : Colors.white;

  return Card(
    margin: const EdgeInsets.symmetric(vertical: 4),
    elevation: 2,
    color: cardColor,  // Dynamic background color
    child: Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildLine1(product),      // Age, Sale, MaxRetailPrice
          const SizedBox(height: 8),
          _buildLine2(product),      // Brand + Cat + Label | Clos
          const SizedBox(height: 8),
          _buildLine3(product),      // Info + HSN + GstRate
          const SizedBox(height: 8),
          _buildLine4(product),      // Purchase Price, Sale Price
        ],
      ),
    ),
  );
}
```

---

## Step 2: Implement Line 1 - Age, Sale, MaxRetailPrice

**Purpose**: Show key metrics (Age, Sale quantity, MRP)

**Design**:
- Three items displayed horizontally
- Each item in a chip/badge style
- Age with icon
- Sale quantity with icon
- MRP with currency symbol

```dart
Widget _buildLine1(ProductsModel product) {
  return Row(
    children: [
      // Age chip
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: product.age > 360 ? Colors.red[100] : Colors.grey[200],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.calendar_today,
              size: 14,
              color: product.age > 360 ? Colors.red[700] : Colors.grey[700],
            ),
            const SizedBox(width: 4),
            Text(
              '${product.age}d',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: product.age > 360 ? Colors.red[700] : Colors.grey[700],
              ),
            ),
          ],
        ),
      ),
      const SizedBox(width: 8),

      // Sale quantity chip
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.blue[100],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.trending_up, size: 14, color: Colors.blue[700]),
            const SizedBox(width: 4),
            Text(
              'Sold: ${product.sale.toStringAsFixed(0)}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.blue[700],
              ),
            ),
          ],
        ),
      ),
      const SizedBox(width: 8),

      // MRP chip
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.green[100],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.currency_rupee, size: 14, color: Colors.green[700]),
            const SizedBox(width: 2),
            Text(
              'MRP: ${product.maxRetailPrice.toStringAsFixed(0)}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.green[700],
              ),
            ),
          ],
        ),
      ),
    ],
  );
}
```

---

## Step 3: Implement Line 2 - Brand + Category + Label | Closing Stock

**Purpose**: Show product identity and current stock

**Design**:
- Left side: Concatenated text (brand + category + label)
- Right side: Closing stock in black rounded box
- Use Row with space between

```dart
Widget _buildLine2(ProductsModel product) {
  // Concatenate brandName, catName, and label with spaces
  final parts = <String>[];
  if (product.brandName.isNotEmpty) parts.add(product.brandName);
  if (product.catName.isNotEmpty) parts.add(product.catName);
  if (product.label.isNotEmpty) parts.add(product.label);
  final productInfo = parts.join(' ');

  return Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      // Product info (brand + category + label)
      Expanded(
        child: Text(
          productInfo,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ),
      const SizedBox(width: 8),

      // Closing stock in black rounded box
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.black87,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          product.clos.toStringAsFixed(0),
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    ],
  );
}
```

---

## Step 4: Implement Line 3 - Info + HSN + GstRate

**Purpose**: Show additional product details

**Design**:
- Concatenated text with separators
- Smaller, secondary text style
- Show only non-empty values

```dart
Widget _buildLine3(ProductsModel product) {
  // Build concatenated string with info, HSN, and GST rate
  final parts = <String>[];

  if (product.info.isNotEmpty) {
    parts.add(product.info);
  }

  if (product.hsn != 0) {
    parts.add('HSN: ${product.hsn}');
  }

  if (product.gstRate > 0) {
    parts.add('GST: ${product.gstRate.toStringAsFixed(1)}%');
  }

  final infoText = parts.join(' • ');

  return Text(
    infoText,
    style: TextStyle(
      fontSize: 12,
      color: Colors.grey[700],
      height: 1.3,
    ),
    maxLines: 2,
    overflow: TextOverflow.ellipsis,
  );
}
```

---

## Step 5: Implement Line 4 - Purchase Price & Sale Price

**Purpose**: Show pricing information

**Design**:
- Two prices side by side
- Purchase price on left (blue)
- Sale price on right (green)
- Clear labels above prices

```dart
Widget _buildLine4(ProductsModel product) {
  return Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      // Purchase Price
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Purchase Price',
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              Icon(Icons.currency_rupee, size: 14, color: Colors.blue[700]),
              Text(
                product.lastPurchasePriceGst.toStringAsFixed(2),
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue[700],
                ),
              ),
            ],
          ),
        ],
      ),

      // Sale Price
      Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            'Sale Price',
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              Icon(Icons.currency_rupee, size: 14, color: Colors.green[700]),
              Text(
                product.salePriceGst.toStringAsFixed(2),
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Colors.green[700],
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
```

---

## Step 6: Remove Old Helper Methods

**Action**: Remove the old `_buildStockInfo` method if it's no longer used

**File**: `lib/features/products/products_page.dart`

**Method to remove**: `_buildStockInfo` (around line 398)

---

## Step 7: Testing

**Test Checklist**:

1. **Visual Layout**:
   - ✅ Line 1 shows Age, Sale, MaxRetailPrice in chips
   - ✅ Line 2 shows concatenated brand/cat/label with clos in black box
   - ✅ Line 3 shows info + HSN + GST concatenated
   - ✅ Line 4 shows purchase and sale prices clearly

2. **Conditional Styling**:
   - ✅ Cards with age > 360 have light pink background
   - ✅ Age chip shows red color when age > 360
   - ✅ Cards with age ≤ 360 have white background

3. **Data Display**:
   - ✅ All fields display correctly
   - ✅ Empty values handled gracefully
   - ✅ Numbers formatted properly
   - ✅ Text doesn't overflow

4. **Responsiveness**:
   - ✅ Layout works on different screen sizes
   - ✅ Text wraps appropriately
   - ✅ Chips don't overflow on small screens

5. **Overall Design**:
   - ✅ Card looks clean and modern
   - ✅ Information hierarchy is clear
   - ✅ Colors are visually appealing
   - ✅ Spacing is consistent

---

## Implementation Order

### Phase 1: Create Helper Methods
1. Create `_buildLine1` method
2. Create `_buildLine2` method
3. Create `_buildLine3` method
4. Create `_buildLine4` method

### Phase 2: Update Main Card Method
5. Update `_buildProductCard` to use new helper methods
6. Add conditional background color logic
7. Remove old layout code

### Phase 3: Cleanup
8. Remove unused `_buildStockInfo` method
9. Test all scenarios

### Phase 4: Verification
10. Run flutter analyze
11. Visual testing with different data
12. Test age > 360 condition

---

## Files Summary

### Files to Modify:
1. `lib/features/products/products_page.dart` - Complete redesign of product card layout

### Files to Reference:
1. Current `products_page.dart` - To understand existing structure
2. `ProductsModel` - To verify all fields are available

---

## Design Specifications

### Colors:
- **Card Background (age ≤ 360)**: White
- **Card Background (age > 360)**: Light pink (`Colors.pink[50]`)
- **Age Chip (normal)**: Grey background, grey text
- **Age Chip (old)**: Red background, red text
- **Sale Chip**: Blue background, blue text
- **MRP Chip**: Green background, green text
- **Closing Stock Box**: Black background, white text
- **Purchase Price**: Blue
- **Sale Price**: Green

### Typography:
- **Line 1 Chips**: 12px, bold
- **Line 2 Product Info**: 14px, semi-bold
- **Line 2 Closing Stock**: 13px, bold
- **Line 3 Details**: 12px, regular
- **Line 4 Labels**: 10px, regular
- **Line 4 Prices**: 15px, bold

### Spacing:
- Card padding: 12px all around
- Between lines: 8px
- Chip padding: 10px horizontal, 6px vertical
- Icon spacing: 4px from text

---

## Success Criteria

1. ✅ Product cards display all information in 4 distinct lines
2. ✅ Age > 360 triggers light pink background
3. ✅ Closing stock appears in black rounded box
4. ✅ All text concatenations work correctly
5. ✅ Pricing displayed prominently with icons
6. ✅ Clean, modern UI design
7. ✅ No flutter analyze errors
8. ✅ Responsive layout on all screen sizes

---

## Expected Result

After implementation:
- Product cards have a clean, 4-line layout
- Old stock (age > 360) is visually highlighted with pink background
- Key metrics (age, sales, MRP) are prominent at the top
- Product information is concise and readable
- Pricing is clear and well-formatted
- Overall appearance is modern and professional
