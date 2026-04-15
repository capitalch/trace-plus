# Plan: Fix Closing Column Values Missing on Expand/Collapse Switch Toggle

## Root Cause

When the expand switch is toggled, `isCollapsedRedux` changes → `enableCollapseAll` prop gets a new value on the already-mounted `TreeGridComponent`. Syncfusion internally re-initializes the grid in response to this prop change. During this re-initialization, Syncfusion creates new DOM cells for rows but the React-based cell templates (the closing column arrow functions) are not re-applied — leaving the closing column blank.

`enableCollapseAll` is a Syncfusion initial-render property. Changing it reactively via props after mount triggers an internal re-init path that breaks React template rendering.

The data is correct and templates work fine on initial mount — the problem is exclusively triggered by the prop change mid-lifecycle.

---

## Fix

**File:** `src/controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid.tsx`

### Step 1 — Force remount via `key` on `TreeGridComponent`

Add `key={String(isCollapsedRedux)}` to `TreeGridComponent`. When the switch is toggled, React unmounts the old instance and mounts a fresh one. On fresh mount, `enableCollapseAll` is correct from the start and all React cell templates render properly.

```tsx
<TreeGridComponent
    key={String(isCollapsedRedux)}   // ← add this
    ...
    enableCollapseAll={(isCollapsedRedux === undefined) ? true : isCollapsedRedux || false}
    ...
>
```

### Step 2 — Clear `expandedKeys` on toggle

When the switch is toggled, the user intends to expand-all or collapse-all. Any individually-tracked expanded rows in `expandedKeys` would conflict with the new intent (e.g., collapse-all, but `onRowDataBound` re-expands tracked rows). Clear `expandedKeys` when `isCollapsedRedux` changes.

Add a `useEffect`:

```tsx
useEffect(() => {
    if (context.CompSyncFusionTreeGrid[instance]) {
        context.CompSyncFusionTreeGrid[instance].expandedKeys = new Set()
    }
}, [isCollapsedRedux])
```

---

## Why This Works

- On fresh mount, `enableCollapseAll` is read once at initialization — Syncfusion never sees a mid-lifecycle prop change
- React cell templates are mounted correctly as part of the normal initial render
- No imperative API calls needed — Syncfusion handles expand/collapse state internally on mount
- `expandedKeys` is cleared so individual row expansion state doesn't override the switch intent

---

## Files to Change

| File | Change |
|---|---|
| `src/controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid.tsx` | Add `key={String(isCollapsedRedux)}` to `TreeGridComponent`; add `useEffect` to clear `expandedKeys` on toggle |
