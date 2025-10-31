# Plan: Fix Text Selection During Custom Drag Operation

## Problem Description

**Current Behavior**:
- When dragging selected controls from anywhere in the grid, the grid control text (names, descriptions) gets selected along the drag path
- As the mouse moves during drag, text elements are highlighted/selected, creating visual clutter
- This is a standard browser behavior when clicking and dragging on text content

**Expected Behavior**:
- During drag operation, text should not be selected
- Only the custom drag helper should be visible
- Clean drag experience without text selection artifacts

**Root Cause**:
- When `mousedown` happens on text content and mouse moves, the browser's default behavior is to select text
- Our custom drag handler doesn't prevent this default text selection behavior
- We need to call `preventDefault()` and add CSS to disable text selection during drag

---

## Solution Design

### Approach 1: Prevent Default on MouseDown (Simple)

Call `preventDefault()` on the mousedown event when starting a drag.

**Implementation**:
```typescript
const handleMouseDown = (e: MouseEvent) => {
    const selectedRecords = gridRef.current?.getSelectedRecords();
    if (!selectedRecords || selectedRecords.length === 0) return;

    // Check for interactive elements...
    if (target.closest('.e-checkbox-wrapper') || ...) {
        return;
    }

    // Prevent text selection during drag
    e.preventDefault(); // ✅ Add this

    // Store start position...
    dragStartPos = { x: e.clientX, y: e.clientY };
    // ... rest of code
};
```

**Pros**:
- Simple one-line fix
- Prevents text selection at the source

**Cons**:
- Might prevent other default behaviors we want to keep
- Need to be careful not to break checkbox/button clicks

---

### Approach 2: Add User-Select CSS (Recommended)

Add CSS to prevent text selection only during active drag operations.

**Implementation**:

#### Step 1: Add CSS for No-Select State

```css
/* In index.css */
.dragging-active {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
}

.dragging-active * {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
}
```

#### Step 2: Toggle Class During Drag

```typescript
function startCustomDrag(event: MouseEvent, selectedRecords: any[]) {
    // Add class to prevent text selection
    document.body.classList.add('dragging-active');

    // ... existing drag helper creation code ...

    const handleDragEnd = (e: MouseEvent) => {
        // Remove drag helper
        dragHelper.remove();

        // Remove no-select class
        document.body.classList.remove('dragging-active');

        // ... rest of cleanup code ...
    };
}
```

**Pros**:
- Clean separation of concerns
- Only affects drag operations
- Doesn't interfere with normal interactions
- Works across all browsers

**Cons**:
- Slightly more code than approach 1

---

### Approach 3: Combination (Best)

Combine both approaches for maximum effectiveness.

**Implementation**:
1. Call `preventDefault()` on mousedown (but only after checking for interactive elements)
2. Add CSS class during active drag
3. Remove class on drag end

This ensures:
- No text selection starts on mousedown
- No text selection during drag movement
- Normal behavior restored after drag

---

## Recommended Implementation

Use **Approach 3 (Combination)** for the most robust solution.

### Changes Required

#### File 1: `super-admin-link-secured-controls-with-roles.tsx`

**Location**: Line ~307 in `handleMouseDown` function

**Change**:
```typescript
const handleMouseDown = (e: MouseEvent) => {
    // Get selected records
    const selectedRecords = gridRef.current?.getSelectedRecords();
    if (!selectedRecords || selectedRecords.length === 0) return;

    // Ignore clicks on interactive elements
    const target = e.target as HTMLElement;

    // Don't interfere with checkboxes
    if (target.closest('.e-checkbox-wrapper') || target.closest('.e-checkselect')) {
        return;
    }

    // Don't interfere with group expand/collapse
    if (target.closest('.e-recordplusexpand') || target.closest('.e-recordpluscollapse')) {
        return;
    }

    // Don't interfere with scrollbars
    if (target.closest('.e-scrollbar')) {
        return;
    }

    // Don't interfere with toolbar buttons
    if (target.closest('.e-toolbar')) {
        return;
    }

    // ✅ ADD THIS: Prevent default text selection
    e.preventDefault();

    // Store start position for drag threshold
    dragStartPos = { x: e.clientX, y: e.clientY };
    // ... rest of code
};
```

#### File 2: `super-admin-link-secured-controls-with-roles.tsx`

**Location**: Line ~504 in `startCustomDrag` function

**Changes**:
```typescript
function startCustomDrag(event: MouseEvent, selectedRecords: any[]) {
    // ✅ ADD THIS: Prevent text selection during drag
    document.body.classList.add('dragging-active');

    // Create drag helper element
    const dragHelper = document.createElement('div');
    // ... existing drag helper code ...

    const handleDragEnd = (e: MouseEvent) => {
        // Remove drag helper
        dragHelper.remove();

        // ✅ ADD THIS: Restore text selection
        document.body.classList.remove('dragging-active');

        // Remove highlight
        if (currentDropTarget) {
            currentDropTarget.classList.remove('e-dragstartrow');
        }

        // ... rest of cleanup code ...
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
}
```

#### File 3: `index.css`

**Location**: After the existing `.has-selection` styles

**Add**:
```css
/* Prevent text selection during active drag operations */
.dragging-active {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
}

.dragging-active * {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
}
```

#### File 4: `admin-link-secured-controls-with-roles.tsx`

Apply the exact same changes as File 1 and File 2 to the admin variant.

---

## Implementation Steps

### Step 1: Add CSS for No-Select
- Add `.dragging-active` class to `index.css`
- Include all vendor prefixes for browser compatibility

### Step 2: Update Super-Admin File
- Add `e.preventDefault()` in `handleMouseDown` (after interactive element checks)
- Add `document.body.classList.add('dragging-active')` at start of `startCustomDrag`
- Add `document.body.classList.remove('dragging-active')` in `handleDragEnd`

### Step 3: Update Admin File
- Apply same changes as Step 2 to admin variant file

### Step 4: Test
- Test drag operations don't select text
- Test checkboxes still work
- Test group expand/collapse still works
- Test drag and drop still works correctly

---

## Testing Plan

### Test Case 1: Drag Without Text Selection
1. Select 3 controls
2. Click anywhere in grid and drag to role
3. **Expected**: No text selection occurs during drag
4. **Expected**: Only drag helper visible

### Test Case 2: Long Drag Path
1. Select controls
2. Drag from top of grid to bottom of tree grid
3. Move mouse in circular pattern
4. **Expected**: No text selected anywhere along path

### Test Case 3: Checkboxes Still Work
1. Click checkbox to select/deselect
2. **Expected**: Checkbox toggles, no drag starts
3. **Expected**: Text can still be selected when NOT dragging

### Test Case 4: Group Controls Still Work
1. Click expand/collapse icon
2. **Expected**: Group expands/collapses
3. **Expected**: No drag starts

### Test Case 5: Text Selection Works When Not Dragging
1. Without selecting any controls
2. Try to select text in a control name
3. **Expected**: Text can be selected normally
4. **Expected**: No drag interference

### Test Case 6: Cancelled Drag Restores Selection
1. Start drag operation
2. Release outside grid (cancel)
3. Try to select text normally
4. **Expected**: Text selection works again

---

## Code Changes Summary

### Files to Modify

1. **index.css**
   - Add `.dragging-active` class with `user-select: none`

2. **super-admin-link-secured-controls-with-roles.tsx**
   - Line ~335: Add `e.preventDefault()` in `handleMouseDown`
   - Line ~505: Add `document.body.classList.add('dragging-active')`
   - Line ~580: Add `document.body.classList.remove('dragging-active')`

3. **admin-link-secured-controls-with-roles.tsx**
   - Line ~343: Add `e.preventDefault()` in `handleMouseDown`
   - Line ~516: Add `document.body.classList.add('dragging-active')`
   - Line ~591: Add `document.body.classList.remove('dragging-active')`

---

## Alternative: More Targeted Approach

If adding class to `document.body` is too broad, we can target only the grids:

```typescript
// Instead of document.body
const gridElement = gridRef.current?.element;
if (gridElement) {
    gridElement.classList.add('dragging-active');
}

// And in cleanup
if (gridElement) {
    gridElement.classList.remove('dragging-active');
}
```

This limits the no-select behavior to just the grid areas, allowing text selection elsewhere in the page.

**Pros**:
- More targeted, less side effects
- Other page elements unaffected

**Cons**:
- Slightly more complex
- Need to track gridElement reference

---

## Success Criteria

After implementation:
1. ✅ No text selection during drag operations
2. ✅ Drag helper is the only visual feedback
3. ✅ Checkboxes work normally (no drag when clicking checkbox)
4. ✅ Group expand/collapse works normally
5. ✅ Text selection works normally when NOT dragging
6. ✅ Drag and drop functionality unchanged
7. ✅ Clean visual experience during drag

---

## Risk Assessment

**Very Low Risk**:
- Simple CSS + JavaScript changes
- Easy to revert if issues occur
- Doesn't modify core drag logic
- Only affects visual behavior during drag

**Potential Issues**:
- None expected - standard approach for custom drag operations

---

## Timeline Estimate

- **CSS Changes**: 2 minutes
- **Super-Admin File**: 5 minutes
- **Admin File**: 5 minutes
- **Testing**: 10 minutes
- **Total**: ~20 minutes

---

## Browser Compatibility

The `user-select` property with vendor prefixes works in:
- ✅ Chrome/Edge (modern)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ IE 10+ (with -ms- prefix)

The `preventDefault()` approach works in all browsers.

---

## Summary

**Problem**: Text gets selected during custom drag operations, creating visual clutter.

**Solution**:
1. Add `e.preventDefault()` on mousedown (after interactive element checks)
2. Add `user-select: none` CSS class during active drag
3. Remove class on drag end

**Impact**: Clean drag experience with no text selection artifacts.

**Effort**: ~20 minutes including testing.

**Files**: 3 files to modify (index.css + 2 TypeScript files)
