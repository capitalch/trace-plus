# Plan: Upgrade admin-link-secured-controls-with-roles.tsx

## Overview
Upgrade `admin-link-secured-controls-with-roles.tsx` to match the pattern, features, and UI improvements from `super-admin-link-secured-controls-with-roles.tsx`.

## Key Differences Identified

### 1. **Missing State Management & Effects**
- Admin file lacks `selectedCount` state tracking
- Missing `useEffect` hooks for:
  - Initial data loading
  - ESC key listener for drag cancellation
  - Selection change tracking with polling

### 2. **UI/UX Improvements Needed**

#### Page Header Enhancement
- Current: Simple label with client name
- Target: Professional header with:
  - Icon integration (IconLink)
  - Larger, bold title with primary color
  - Descriptive subtitle explaining drag-and-drop functionality
  - Keyboard shortcuts hint panel (Tab navigation)

#### Grid Container Styling
- Current: Basic flex with fixed width calculation
- Target:
  - Modern card-based design with rounded borders and shadows
  - Responsive layout (flex-wrap lg:flex-nowrap)
  - Gradient header backgrounds (blue for controls, amber for roles)
  - Icon badges in section headers
  - Proper padding and spacing

#### Source Grid (Secured Controls)
- Add: SelectionIndicator component showing selected count
- Add: Grouping functionality with multi-level group caption templates
- Add: Visual grouping by `controlType` and `controlPrefix`
- Add: "Toggle Select" buttons in group headers
- Enhanced aggregate footer template

#### Target Grid (Roles)
- Enhanced section header with gradient background
- Better visual hierarchy with icon badges

### 3. **Functional Enhancements**

#### Drag & Drop Improvements
- Add `onRowDragStart` handler with visual ESC hint
- Better cancellation handling (3 levels):
  1. Silent cancel when dropped back on source
  2. Silent cancel when dropped in empty area
  3. Silent cancel when dropped on wrong grid
- Remove error alert on empty drop
- Improved grid refresh logic

#### Selection Management
- Add `SelectionIndicator` component with:
  - Visual count display
  - Clear selection button
  - Auto-hide when no selection
- Add `handleClearSelection` function
- Add polling for reliable selection tracking

#### Grouping Features
- Add `multiLevelGroupCaptionTemplate` function
- Add `handleSelectAllInGroup` function for group-level selection
- Support for 2-level grouping (Type → Prefix)
- Visual distinction between group levels (blue for Type, green for Prefix)

#### Visual Template Enhancements
- `nameColumnTemplate`: Better styling with icon containers and font weights
- `descrColumnTemplate`: Improved button styling with hover effects, transitions, and better accessibility
- `securedControlsAggrTemplate`: More professional count display with gradient badges
- Button improvements: Hover scale effects, focus rings, better color schemes

### 4. **Column Configuration**
- Add `controlPrefix` column to secured controls grid for grouping support
- Keep same link columns structure

### 5. **Code Quality**
- More descriptive comments
- Better organized helper functions
- Improved TypeScript typing
- Better error handling

## Implementation Steps

### Step 1: Add Required State and Effects
- [ ] Add `selectedCount` state
- [ ] Add `useEffect` for initial data loading
- [ ] Add `useEffect` for ESC key listener
- [ ] Add `useEffect` for selection tracking with polling

### Step 2: Update Page Header
- [ ] Replace simple label with comprehensive header section
- [ ] Add IconLink import and integration
- [ ] Add title with subtitle
- [ ] Add keyboard shortcuts hint panel

### Step 3: Restructure Layout Container
- [ ] Update main container styling to modern card-based design
- [ ] Add responsive wrapper classes

### Step 4: Enhance Source Grid Section
- [ ] Update section header with gradient and icons
- [ ] Add SelectionIndicator component
- [ ] Integrate SelectionIndicator before toolbar
- [ ] Add grouping configuration to grid
- [ ] Add `controlPrefix` column for grouping
- [ ] Update grid height calculation

### Step 5: Enhance Target Grid Section
- [ ] Update section header with gradient and icons
- [ ] Adjust height calculation

### Step 6: Add Selection Management Functions
- [ ] Add `SelectionIndicator` component function
- [ ] Add `handleClearSelection` function
- [ ] Add `handleSelectAllInGroup` function
- [ ] Add `multiLevelGroupCaptionTemplate` function

### Step 7: Improve Drag & Drop
- [ ] Add `onRowDragStart` handler
- [ ] Update `onSecuredControlsRowDrop` with 3-level cancellation
- [ ] Remove failure alert on empty drop
- [ ] Add grid refresh in drag start
- [ ] Add source grid refresh logic

### Step 8: Update Column Configuration
- [ ] Add `controlPrefix` column with proper configuration
- [ ] Update column widths if needed

### Step 9: Enhance Visual Templates
- [ ] Update `nameColumnTemplate` with better styling
- [ ] Update `descrColumnTemplate` with improved buttons
- [ ] Update `securedControlsAggrTemplate` with gradient badge
- [ ] Update button styling in all helper functions

### Step 10: Add Missing Imports
- [ ] Add IconSecuredControls
- [ ] Add IconRoles
- [ ] Verify all existing imports

### Step 11: Testing & Validation
- [ ] Test drag and drop functionality
- [ ] Test ESC key cancellation
- [ ] Test selection indicator
- [ ] Test group selection toggle
- [ ] Test responsive layout
- [ ] Verify all existing features still work
- [ ] Test auto-link functionality

## Notes
- Maintain existing admin-specific logic (clientId in sqlArgs)
- Keep auto-link functionality that exists in admin but not in super-admin
- Preserve existing modal integrations
- Follow CLAUDE.md instruction: Never use red color except for errors

## Color Scheme Changes Required
Per CLAUDE.md instructions, avoid red color usage except for errors:
- Line 240: Change child count `text-red-500` to `text-gray-600` (not an error indicator)
- Line 282: Change IconUnlink `text-red-500` to `text-amber-600` (matching super-admin pattern)
- Line 294: Change IconUnlink `text-red-500` to `text-amber-600` (matching super-admin pattern)

## Admin-Specific Features to Preserve
- Auto-link button and functionality (lines 255-272)
- AdminAutoLinkSecuredControlsFromBuiltinRolesModal integration
- Client name display in header
- ClientId in sqlArgs (line 83)
- SqlIdsMap.getAdminRolesSecuredControlsLink (line 84)
