# Plan: Convert 'active' to 'isCurrent' (Products Only)

## Overview
Convert all occurrences of 'active' terminology to 'isCurrent' in the products feature only.

---

## Step 1: Update Products Provider
**File:** `lib/providers/products_provider.dart`

| Line | Current | Change To |
|------|---------|-----------|
| 22 | `bool _showActiveOnly = true;` | `bool _showCurrentOnly = true;` |
| 22 | Comment: "Show active products" | Comment: "Show current products" |
| 35 | `bool get showActiveOnly => _showActiveOnly;` | `bool get showCurrentOnly => _showCurrentOnly;` |
| 73 | Comment: "Apply active products filter" | Comment: "Apply current products filter" |
| 74 | `if (_showActiveOnly)` | `if (_showCurrentOnly)` |
| 200 | Comment: "Toggle active products filter" | Comment: "Toggle current products filter" |
| 201 | `void toggleActiveOnlyFilter()` | `void toggleCurrentOnlyFilter()` |
| 202 | `_showActiveOnly = !_showActiveOnly;` | `_showCurrentOnly = !_showCurrentOnly;` |
| 214 | `_showActiveOnly = true;` | `_showCurrentOnly = true;` |
| 214 | Comment: "Default: show active products" | Comment: "Default: show current products" |

---

## Step 2: Update Products Page UI
**File:** `lib/features/products/products_page.dart`

| Line | Current | Change To |
|------|---------|-----------|
| 278 | Comment: "Active products filter toggle" | Comment: "Current products filter toggle" |
| 283 | `provider.showActiveOnly` | `provider.showCurrentOnly` |
| 284 | `provider.toggleActiveOnlyFilter()` | `provider.toggleCurrentOnlyFilter()` |
| 294 | `!provider.showActiveOnly` | `!provider.showCurrentOnly` |
| 307 | `provider.showActiveOnly` | `provider.showCurrentOnly` |
| 311 | `'Active Only'` | `'Current Only'` |
| 323 | `provider.showActiveOnly` | `provider.showCurrentOnly` |
| 330 | `provider.showActiveOnly ? 'Active' : 'All'` | `provider.showCurrentOnly ? 'Current' : 'All'` |
| 332 | `provider.showActiveOnly` | `provider.showCurrentOnly` |

---

## Files Summary

| # | File | Changes |
|---|------|---------|
| 1 | `lib/providers/products_provider.dart` | 9 changes |
| 2 | `lib/features/products/products_page.dart` | 9 changes |

**Total: 18 changes across 2 files**

---

## Testing

1. Open Products page
2. Toggle the filter switch between "Current" and "All"
3. Verify filtering works correctly (Current shows products with stock/activity, All shows everything)
