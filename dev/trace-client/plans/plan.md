# Plan: Fix Text Selection During Drag and Drop

## Problem Description

**Current Behavior**:
1. User selects multiple controls in the source grid
2. User drags the controls to the target grid
3. During or after the drag operation, text within some controls gets selected (highlighted)
4. This text selection is visually distracting and unintended

**Expected Behavior**:
1. User selects multiple controls
2. User drags controls to target
3. No text selection occurs during or after the drag operation
4. Only the intended drag-and-drop happens

**Root Cause**:
- During drag operations, mouse movements can trigger browser's default text selection behavior
- The `mousedown` and `mousemove` events may not be properly preventing text selection
- Text selection can occur in either the source or target grid during the drag operation

---

## Current Code Analysis

### File: `super-admin-link-secured-controls-with-roles.tsx`

#### Current handleMouseDown (Lines ~319-384):

```typescript
const handleMouseDown = (e: MouseEvent) => {
    // Get selected records
    const selectedRecords = gridRef.current?.getSelectedRecords();
    if (!selectedRecords || selectedRecords.length === 0) return;

    // Ignore clicks on interactive elements
    const target = e.target as HTMLElement;

    // Don't interfere with data rows (let Syncfusion's default drag work)
    if (target.closest('.e-row:not(.e-groupcaptionrow)')) {
        return;
    }

    // ... other interactive element checks ...

    // Prevent default text selection
    e.preventDefault();

    // Store start position for drag threshold
    dragStartPos = { x: e.clientX, y: e.clientY };
    isDragging = false;

    // Add mousemove listener to detect drag intent
    const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - dragStartPos.x;
        const dy = moveEvent.clientY - dragStartPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Require 5px movement to start drag (avoids accidental drags)
        if (distance > 5 && !isDragging) {
            isDragging = true;
            startCustomDrag(moveEvent, selectedRecords);
            cleanup();
        }
    };

    // ... cleanup handlers ...
};
```

**Problems Identified**:
1. **Only prevents default on group caption rows**: The code only calls `e.preventDefault()` when clicking group caption rows (line 353), but returns early for data rows (line 328-330)
2. **No text selection prevention on data rows**: When clicking data rows, the function returns early, so no prevention happens
3. **No user-select CSS**: There's no CSS to disable text selection globally during drag
4. **mousemove doesn't prevent default**: The `handleMouseMove` function doesn't call `preventDefault()`

---

## Solution Design

### Approach 1: Prevent Default on All Mousedown Events

Add `e.preventDefault()` for all row clicks, not just group caption rows.

**Pros**:
- Simple fix
- Prevents text selection at the source

**Cons**:
- May interfere with normal click behavior on data rows
- Doesn't address text selection during mousemove

---

### Approach 2: Add CSS user-select: none During Drag

Apply `user-select: none` CSS to the grid content while dragging.

**Pros**:
- Prevents text selection across entire grid
- Non-invasive to event handlers
- Works during entire drag operation

**Cons**:
- Need to manage CSS class addition/removal
- May affect nested elements

---

### Approach 3: Comprehensive Event Prevention

Combine multiple strategies:
1. Call `preventDefault()` on mousedown for all rows
2. Call `preventDefault()` on mousemove during drag
3. Add CSS `user-select: none` to grid during drag
4. Clear any existing text selection before starting drag

**Pros**:
- Most robust solution
- Handles all edge cases
- Works across different browsers

**Cons**:
- More complex implementation
- Multiple points of intervention

---

## Recommended Solution

**Hybrid Approach**: Use a combination of event prevention and CSS control.

### Implementation Steps:

1. **Add preventDefault on data row clicks** (for consistency)
2. **Add preventDefault on mousemove during drag**
3. **Apply user-select CSS to grid content during drag**
4. **Clear any existing text selection when drag starts**
5. **Remove user-select CSS when drag ends**

---

## Implementation Plan

### Step 1: Update handleMouseDown Function

**File**: `super-admin-link-secured-controls-with-roles.tsx`
**Location**: Lines ~319-384

**Changes**:

```typescript
const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Ignore clicks on interactive elements
    if (target.closest('.e-checkbox-wrapper') || target.closest('.e-checkselect')) {
        return;
    }
    if (target.closest('.e-recordplusexpand') || target.closest('.e-recordpluscollapse')) {
        return;
    }
    if (target.closest('.e-scrollbar')) {
        return;
    }
    if (target.closest('.e-toolbar')) {
        return;
    }

    // Get selected records
    const selectedRecords = gridRef.current?.getSelectedRecords();
    if (!selectedRecords || selectedRecords.length === 0) return;

    // Find the clicked row
    const clickedRow = target.closest('.e-row');
    if (!clickedRow) return;

    // Don't process if it's a group caption row (let default behavior work)
    if (clickedRow.classList.contains('e-groupcaptionrow')) {
        // For group captions, prevent text selection
        e.preventDefault();

        // Store start position for drag threshold
        dragStartPos = { x: e.clientX, y: e.clientY };
        isDragging = false;

        // Add mousemove listener
        const handleMouseMove = (moveEvent: MouseEvent) => {
            // Prevent text selection during move
            moveEvent.preventDefault();

            const dx = moveEvent.clientX - dragStartPos.x;
            const dy = moveEvent.clientY - dragStartPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 5 && !isDragging) {
                isDragging = true;

                // Clear any existing text selection
                clearTextSelection();

                // Add no-select class to grid content
                if (gridContent) {
                    gridContent.classList.add('no-text-select');
                }

                startCustomDrag(moveEvent, selectedRecords);
                cleanup();
            }
        };

        const handleMouseUp = () => {
            cleanup();
        };

        const cleanup = () => {
            // Remove no-select class
            if (gridContent) {
                gridContent.classList.remove('no-text-select');
            }

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    // For data rows, let SyncFusion's built-in drag handle it
    // but still prevent text selection
    if (!clickedRow.classList.contains('e-groupcaptionrow')) {
        e.preventDefault();
    }
};

// Helper function to clear text selection
function clearTextSelection() {
    if (window.getSelection) {
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
        }
    }
}
```

### Step 2: Add CSS for no-text-select

**Location**: Add to the component's style section or CSS file

```css
.no-text-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
```

**OR** add inline style in the useEffect:

```typescript
// In the useEffect setup
const gridContent = gridRef.current.element?.querySelector('.e-content');
if (gridContent) {
    // Add style element for no-text-select
    const style = document.createElement('style');
    style.textContent = `
        .no-text-select {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
    `;
    document.head.appendChild(style);
}
```

---

## Alternative Simpler Approach

If the comprehensive approach is too complex, we can try a simpler fix:

### Simple Fix: Just Prevent Default Everywhere

```typescript
const handleMouseDown = (e: MouseEvent) => {
    // Get selected records
    const selectedRecords = gridRef.current?.getSelectedRecords();
    if (!selectedRecords || selectedRecords.length === 0) return;

    // Ignore clicks on interactive elements
    const target = e.target as HTMLElement;

    // ... interactive element checks ...

    // ALWAYS prevent default to stop text selection
    e.preventDefault();

    // Don't interfere with data rows (let Syncfusion's default drag work)
    if (target.closest('.e-row:not(.e-groupcaptionrow)')) {
        return;
    }

    // ... rest of the logic ...
};
```

**Just move `e.preventDefault()` BEFORE the early return for data rows.**

---

## Testing Plan

### Test Case 1: Drag from Group Caption Area
**Steps**:
1. Select 3 controls
2. Click and drag from group caption area
3. Drop in target grid

**Expected**:
- No text selection occurs
- Drag operation works normally

### Test Case 2: Drag Multiple Selected Rows
**Steps**:
1. Select 5 controls using checkboxes
2. Click on one selected row and drag
3. Drop in target grid

**Expected**:
- No text selection in source grid
- No text selection in target grid
- All 5 controls are moved

### Test Case 3: Fast Drag Movement
**Steps**:
1. Select controls
2. Quickly drag across the grid with fast mouse movement
3. Drop in target

**Expected**:
- No text selection even with fast movement
- Drag helper follows cursor smoothly

### Test Case 4: Click Without Drag
**Steps**:
1. Select controls
2. Click on a row but don't drag (no movement)
3. Release mouse

**Expected**:
- No drag occurs (since no 5px threshold met)
- No text selection occurs
- Selection remains unchanged

### Test Case 5: Text Selection Before Drag
**Steps**:
1. Manually select some text in the grid (before any drag)
2. Then select controls
3. Start drag operation

**Expected**:
- Previous text selection is cleared when drag starts
- No text selection remains after drag

---

## Implementation Steps Summary

### ✅ Step 1: Analyze Current Code
- Identified that `e.preventDefault()` only happens for group caption rows
- Data rows return early without prevention

### ✅ Step 2: Choose Approach
- Decided on Simpler Approach first (move preventDefault before early return)
- If that doesn't work, implement comprehensive approach

### Step 3: Update Super-Admin File
- Move `e.preventDefault()` before the data row check
- Add `moveEvent.preventDefault()` in handleMouseMove
- Add `clearTextSelection()` helper function
- Add CSS class management for user-select

### Step 4: Update Admin File
- Apply same changes as super-admin file

### Step 5: Test All Scenarios
- Test drag from group caption
- Test drag from data rows
- Test fast movements
- Test text selection clearing

---

## Code Changes Summary

### Files to Modify

1. **super-admin-link-secured-controls-with-roles.tsx**
   - Lines ~319-384: Update `handleMouseDown` function
   - Add `clearTextSelection()` helper function
   - Add CSS class management or inline styles

2. **admin-link-secured-controls-with-roles.tsx**
   - Lines ~317-382: Apply same changes as super-admin

---

## Success Criteria

After implementation:
1. ✅ No text selection when dragging from group caption area
2. ✅ No text selection when dragging data rows (via SyncFusion)
3. ✅ No text selection during fast mouse movements
4. ✅ Existing text selection cleared when drag starts
5. ✅ Normal click behavior still works (checkboxes, expand/collapse)
6. ✅ Drag and drop functionality remains intact

---

## Risk Assessment

**Low Risk**:
- Moving `preventDefault()` is a small change
- Doesn't affect core drag logic
- Easy to test and verify

**Potential Issues**:
- May need to test on different browsers (Chrome, Firefox, Edge)
- Touch devices may behave differently (though this is mouse-focused)

**Mitigation**:
- Start with simplest approach
- Test thoroughly before moving to complex approach
- Keep both grids (left and right) in mind

---

## Timeline Estimate

- **Simple Fix (move preventDefault)**: 5 minutes
- **Test Simple Fix**: 5 minutes
- **If needed - Comprehensive Fix**: 15 minutes
- **Test Comprehensive Fix**: 10 minutes
- **Apply to Admin File**: 5 minutes
- **Total**: 20-40 minutes (depending on which approach is needed)

---

## Recommended Implementation Order

1. **Try Simple Fix First**:
   - Move `e.preventDefault()` before data row check (line 328)
   - Test if this alone solves the problem

2. **If Simple Fix Insufficient**:
   - Add `moveEvent.preventDefault()` in mousemove handler
   - Test again

3. **If Still Issues**:
   - Implement full comprehensive approach with CSS classes
   - Add `clearTextSelection()` helper
   - Test thoroughly

---

## Summary

**Problem**: Text gets selected when dragging controls

**Root Cause**: `preventDefault()` only called for group caption rows, not data rows

**Solution**:
1. Simple: Move `preventDefault()` before early return for data rows
2. Comprehensive: Add CSS user-select control and text selection clearing

**Impact**: Users can drag controls without unwanted text selection

**Effort**: 20-40 minutes including testing

**Files**: 2 TypeScript files (super-admin + admin variants)
