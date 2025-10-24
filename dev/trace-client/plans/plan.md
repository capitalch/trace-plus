# Plan: Change "Inherited From" to "Parent" Terminology

## Overview
This plan outlines the steps to refactor the terminology from "Inherited From" to "Parent" throughout the roles management feature. This change affects UI labels, variable names, function names, and internal documentation.

## Scope of Changes

### Files Affected
1. **src/features/security/admin/roles/admin-new-edit-role.tsx** (Primary file)
   - UI labels and form fields
   - Variable and function names
   - Type definitions
2. **plans/plan.md** (This file)
   - Will be updated with this new plan

## Detailed Refactoring Steps

### 1. UI Label Changes in admin-new-edit-role.tsx

**Location: Line 93**
- Change: `<span className="font-bold mb-1">Inherited from <WidgetAstrix /></span>`
- To: `<span className="font-bold mb-1">Parent <WidgetAstrix /></span>`

### 2. Variable and Property Name Changes

**Note:** The internal variable name `inheritedFrom` will be changed to `parent` throughout the file.

#### Props Parameter (Line 26)
- Change: `inheritedFrom,`
- To: `parent,`

#### Register Variable (Line 50-52)
- Change: `const registerInheritedFrom = register("inheritedFrom", {`
- To: `const registerParent = register("parent", {`

#### setValue Call (Line 64)
- Change: `setValue("inheritedFrom", inheritedFrom || "");`
- To: `setValue("parent", parent || "");`

#### Form Field Props (Lines 98-101)
- Change: `{...registerInheritedFrom}`
- To: `{...registerParent}`
- Change: `onChange={handleOnChangeInheritedFrom}`
- To: `onChange={handleOnChangeParent}`
- Change: `selectedValue={inheritedFrom}`
- To: `selectedValue={parent}`

#### Error Display (Line 103)
- Change: `{errors.inheritedFrom && <WidgetFormErrorMessage errorMessage={errors.inheritedFrom.message} />}`
- To: `{errors.parent && <WidgetFormErrorMessage errorMessage={errors.parent.message} />}`

#### Submit Handler (Line 131)
- Change: `parentId: data.inheritedFrom || null,`
- To: `parentId: data.parent || null,`
- Note: The database field `parentId` remains unchanged as it's the actual database column name

#### Handler Function Name (Lines 184-187)
- Change: `function handleOnChangeInheritedFrom(selectedObject: any) {`
- To: `function handleOnChangeParent(selectedObject: any) {`
- Change: `setValue("inheritedFrom", selectedObject?.id);`
- To: `setValue("parent", selectedObject?.id);`
- Change: `clearErrors("inheritedFrom");`
- To: `clearErrors("parent");`

### 3. Type Definition Changes

#### FormDataType Interface (Line 193)
- Change: `inheritedFrom: string;`
- To: `parent: string;`

#### AdminNewEditRoleType Interface (Line 201)
- Change: `inheritedFrom?: string;`
- To: `parent?: string;`

## Implementation Steps

1. **Update UI Label**
   - Change the display label from "Inherited from" to "Parent" on line 93

2. **Rename Variables and Properties**
   - Update all occurrences of `inheritedFrom` to `parent` in:
     - Function parameters
     - Register variables
     - setValue/clearErrors calls
     - Form field props
     - Error handling
     - Type definitions

3. **Rename Handler Function**
   - Change `handleOnChangeInheritedFrom` to `handleOnChangeParent`

4. **Update Type Definitions**
   - Update both `FormDataType` and `AdminNewEditRoleType` interfaces

5. **Testing Checklist**
   - Verify the form loads correctly with existing roles
   - Test creating a new role with a parent selection
   - Test editing an existing role and changing its parent
   - Verify validation errors display correctly for the parent field
   - Ensure the parent dropdown populates with builtin roles
   - Verify the parent value is correctly saved to the database (parentId column)
   - Check that all error messages display properly

## Database Considerations

- The database column name `parentId` in the `RoleM` table remains unchanged
- Only the form field name and UI terminology changes from "inheritedFrom" to "parent"
- The mapping between form field `parent` and database field `parentId` occurs in the submit handler (line 131)

## Verification Steps

1. Code review to ensure all instances are updated
2. Check for any remaining references to "inherited" or "inheritedFrom" in the file
3. Run TypeScript compiler to catch any type errors
4. Test the functionality manually
5. Verify no console errors appear when using the form

## Notes

- This is purely a terminology change for better clarity
- The underlying functionality remains the same
- The database schema does not need to be modified
- The change makes the code more intuitive as "parent" is a clearer term than "inherited from"
