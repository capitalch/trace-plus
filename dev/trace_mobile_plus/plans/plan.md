# Plan: Add Filter Checkbox for Active Products (Default: ON)

## Objective
Add a checkbox in the AppBar to filter and show only products that have:
- Closing balance (clos) ≠ 0, OR
- Opening balance (op) ≠ 0, OR
- Sale ≠ 0

**By default, only active products are shown** to help users focus on products with stock/activity.
Users can toggle the filter off to see all products including inactive ones.

## Current State Analysis

### Current Filtering
- Products are currently filtered by search query only
- `filteredProducts` getter in ProductsProvider filters by search text
- Hidden products are also filtered out
- No filter for active/inactive products based on balances/sales

### ProductsModel Fields (from products_model.dart)
- `clos` (double) - Closing balance
- `op` (double) - Opening balance
- `sale` (double) - Sale quantity
- All three fields available for filtering

## Proposed Solution

### UI Changes
**Location**: AppBar actions (next to restore button)

**Design**:
- Checkbox with label "Active Only" or icon
- Positioned in AppBar actions area
- Shows count of active products when enabled
- Toggles filter on/off

## Step 1: Add Filter State to ProductsProvider

### File: `lib/providers/products_provider.dart`

**Actions**:
- Add `_showActiveOnly` boolean flag (default: true)
- Add getter `showActiveOnly`
- Add method `toggleActiveOnlyFilter()` to toggle the flag
- Update `filteredProducts` getter to apply active filter

### State Management
```dart
class ProductsProvider extends ChangeNotifier {
  // ... existing code ...

  bool _showActiveOnly = true;

  bool get showActiveOnly => _showActiveOnly;

  void toggleActiveOnlyFilter() {
    _showActiveOnly = !_showActiveOnly;
    notifyListeners();
  }
}
```

### Updated filteredProducts Getter
```dart
List<ProductsModel> get filteredProducts {
  // Start with all products or search-filtered products
  List<ProductsModel> filtered;

  if (_debouncedSearchQuery.isEmpty) {
    filtered = _products;
  } else {
    final normalizedQuery = _normalizeSearchText(_debouncedSearchQuery);
    if (normalizedQuery.isEmpty) {
      filtered = _products;
    } else {
      filtered = _products.where((product) {
        final searchableText = [
          product.catName,
          product.brandName,
          product.label,
          product.info,
          product.productCode,
        ].map((field) => _normalizeSearchText(field)).join(' ');

        return searchableText.contains(normalizedQuery);
      }).toList();
    }
  }

  // Apply active products filter
  if (_showActiveOnly) {
    filtered = filtered.where((product) {
      return product.clos != 0 || product.op != 0 || product.sale != 0;
    }).toList();
  }

  // Filter out hidden products
  filtered = filtered.where((product) {
    return !_hiddenProductIds.contains(product.id);
  }).toList();

  return filtered;
}
```

## Step 2: Add Checkbox to AppBar Actions

### File: `lib/features/products/products_page.dart`

**Actions**:
- Add checkbox widget in AppBar actions
- Position before restore button
- Show checkbox with label or icon
- Toggle filter when checkbox changed

### Design Options

#### Option A: Checkbox with Text Label
```dart
Consumer<ProductsProvider>(
  builder: (context, provider, _) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Checkbox(
          value: provider.showActiveOnly,
          onChanged: (value) {
            provider.toggleActiveOnlyFilter();
          },
          activeColor: Colors.white,
          checkColor: Colors.teal[500],
          side: const BorderSide(color: Colors.white),
        ),
        Text(
          'Active',
          style: TextStyle(color: Colors.white, fontSize: 12),
        ),
      ],
    );
  },
)
```

#### Option B: Icon Toggle Button (Recommended)
```dart
Consumer<ProductsProvider>(
  builder: (context, provider, _) {
    return IconButton(
      icon: Icon(
        provider.showActiveOnly
            ? Icons.toggle_on
            : Icons.toggle_off,
        color: Colors.white,
      ),
      onPressed: () {
        provider.toggleActiveOnlyFilter();
      },
      tooltip: provider.showActiveOnly
          ? 'Showing active products only'
          : 'Show all products',
    );
  },
)
```

#### Option C: Filter Icon with Badge (Most Compact)
```dart
Consumer<ProductsProvider>(
  builder: (context, provider, _) {
    return Stack(
      children: [
        IconButton(
          icon: Icon(
            Icons.filter_alt,
            color: provider.showActiveOnly ? Colors.amber : Colors.white,
          ),
          onPressed: () {
            provider.toggleActiveOnlyFilter();
          },
          tooltip: 'Filter active products',
        ),
        if (provider.showActiveOnly)
          Positioned(
            right: 8,
            top: 8,
            child: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: Colors.amber,
                shape: BoxShape.circle,
              ),
            ),
          ),
      ],
    );
  },
)
```

## Step 3: Update AppBar Actions Layout

### File: `lib/features/products/products_page.dart`

**Current Actions**:
```dart
actions: [
  Consumer<ProductsProvider>(...), // Restore button (when hidden > 0)
],
```

**Updated Actions**:
```dart
actions: [
  Consumer<ProductsProvider>(...), // Active filter toggle
  Consumer<ProductsProvider>(...), // Restore button (when hidden > 0)
],
```

### Layout Structure
```dart
actions: [
  // Active products filter toggle
  Consumer<ProductsProvider>(
    builder: (context, provider, _) {
      return IconButton(
        icon: Icon(
          Icons.filter_alt,
          color: provider.showActiveOnly ? Colors.amber : Colors.white,
        ),
        onPressed: () {
          provider.toggleActiveOnlyFilter();
        },
        tooltip: provider.showActiveOnly
            ? 'Showing active products only'
            : 'Show all products',
      );
    },
  ),
  // Existing restore button
  Consumer<ProductsProvider>(...),
],
```

## Step 4: Update Summary Display (Optional)

### File: `lib/features/products/products_page.dart`

**Enhancement**: Show filter status in summary

**Current Summary**:
- Shows: "Filtered: 1,234 / 5,678" or "Total: 5,678"
- Icon changes: filter_list vs inventory_2

**Enhanced Summary**:
- Consider showing active filter status
- Could add additional icon or text indicator
- Example: "Active: 1,234" or "Filtered (Active): 1,234 / 5,678"

### Implementation (Optional)
```dart
// In _buildSearchAndSummaryRow
final isFiltered = filteredCount != totalCount;
final isActiveFilterOn = provider.showActiveOnly;

Icon(
  isActiveFilterOn
      ? Icons.filter_alt
      : (isFiltered ? Icons.filter_list : Icons.inventory_2),
  color: Colors.teal[500],
  size: 10,
)
```

## Step 5: Handle Edge Cases

### Considerations

1. **Filter with Search**:
   - Active filter works alongside search
   - Both filters applied: search THEN active filter
   - Clear communication to user

2. **Filter with Hidden Products**:
   - Active filter applied before hidden filter
   - Hidden products still removed from results
   - Both filters can coexist

3. **Empty Results**:
   - All products filtered out by active filter
   - Show appropriate message
   - Suggest turning off filter

4. **Filter State Persistence** (Optional):
   - Could save filter state to SharedPreferences
   - Restore on app restart
   - User preference consideration

5. **Performance**:
   - Filter applied on already filtered list
   - Should be fast even with 1000+ products
   - No performance concerns

## Implementation Steps Summary

### Step 1: Update ProductsProvider
- Add `_showActiveOnly` boolean state (default: `true` to show active products by default)
- Add `showActiveOnly` getter
- Add `toggleActiveOnlyFilter()` method
- Update `filteredProducts` getter to apply active filter

### Step 2: Add filter toggle to AppBar
- Add IconButton or Checkbox in AppBar actions
- Position before restore button
- Use filter icon that changes color when active

### Step 3: Test implementation
- Test filter toggle on/off
- Test with search combination
- Test with hidden products
- Test empty results state
- Verify performance with large dataset

### Step 4: Optional enhancements
- Update summary icon when active filter on
- Add tooltip/help text
- Persist filter state (optional)

## Design Specifications

### Filter Toggle Button
- **Icon**: Icons.filter_alt
- **Color (inactive)**: Colors.white
- **Color (active)**: Colors.amber
- **Size**: Default IconButton size
- **Tooltip (inactive)**: "Show all products"
- **Tooltip (active)**: "Showing active products only"

### Filter Logic
- **Active Product**: `product.clos != 0 OR product.op != 0 OR product.sale != 0`
- **Filter Order**: Search → Active Filter → Hidden Products Filter
- **Default State**: Filter ON (show active products only)

## Files to Modify

1. **`lib/providers/products_provider.dart`** - Add filter state and logic
2. **`lib/features/products/products_page.dart`** - Add filter toggle UI

## Testing Checklist

- [ ] Filter toggle button appears in AppBar
- [ ] Filter is ON by default (showing only active products on first load)
- [ ] Clicking toggle activates/deactivates filter
- [ ] Active filter shows only products with clos/op/sale ≠ 0
- [ ] Filter works alongside search
- [ ] Filter works with hidden products
- [ ] Icon color changes when filter active
- [ ] Tooltip shows correct message
- [ ] Summary updates correctly
- [ ] Empty state shows when all filtered
- [ ] Performance acceptable with large dataset
- [ ] Filter state toggles correctly
- [ ] No crashes or errors

## Success Criteria

1. ✅ Checkbox/toggle button added to AppBar
2. ✅ Filter is ON by default (active products shown on page load)
3. ✅ Filter shows only active products (clos/op/sale ≠ 0)
4. ✅ Visual indicator when filter is active
5. ✅ Works alongside search and hidden products filters
6. ✅ Intuitive user experience
7. ✅ Good performance
8. ✅ Clear tooltip/help text
9. ✅ No breaking changes to existing features

## Optional Enhancements

1. **Persist filter state**: Save to SharedPreferences
2. **Count indicator**: Show count of active vs total products
3. **Advanced filters**: Add more filter options (by age, by stock level, etc.)
4. **Filter chips**: Show active filters as removable chips
5. **Quick filter menu**: Dropdown with multiple filter options
