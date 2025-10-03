# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm start            # Start Vite dev server

# Build and deployment  
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build locally

# Code quality
npm run lint         # ESLint with TypeScript rules (max 0 warnings)
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 19.1 + TypeScript + Vite
- **State Management**: Redux Toolkit with feature-based slices
- **Forms**: React Hook Form with FormProvider pattern  
- **Styling**: Tailwind CSS 4.x (avoid raw/inline styles)
- **GraphQL**: Apollo Client with bearer token auth
- **UI Components**: Syncfusion + PrimeReact + custom controls
- **Communication**: RxJS-based Ibuki event bus for cross-component messaging

### Core Architectural Patterns

**Redux Store Structure:**
- Feature-based slices: `login`, `sales`, `vouchers`, `purchases`, etc.
- Global state reset mechanism via `doLogout` action
- Form data persistence: each form can save/restore state via Redux

**Form Architecture:**
- `FormProvider` wraps complex multi-section forms
- Modular form components: `InvoiceDetails`, `CustomerDetails`, `ItemsAndServices`
- Form state synced with Redux for persistence across navigations
- `setParentValue`/`triggerParent` pattern for child-to-parent form updates

**GraphQL Integration:**
- Centralized via `Utils.queryGraphQL()` and `Utils.mutateGraphQL()`
- Generic CRUD operations: `doGenericQuery`, `doGenericUpdate`
- Bearer token authentication, no-cache policy for fresh data

**Modal Management:**
- Two modal instances (ModalDialogA, ModalDialogB) managed via Ibuki
- Usage: `Utils.showHideModalDialogA({ isOpen: true, title, element })`
- Responsive sizing: sm, md, lg, xl

**Cross-Component Communication:**
- Ibuki RxJS event bus: `ibuki.emit()`, `ibuki.subscribe()`
- Supports regular, hot, and debounced emissions

### Key Directories

```
src/
├── app/                    # Store, GraphQL client, routing
├── controls/               # Reusable UI components and widgets
├── features/               # Feature-based organization
│   ├── accounts/           # Accounting, sales, purchases
│   ├── layouts/            # Navigation, sidebars
│   ├── login/              # Authentication
│   └── security/           # Admin, roles, users
├── utils/                  # Global types, utilities, hooks
```

**Feature Organization Example:**
```
features/accounts/purchase-sales/sales/
├── all-sales.tsx           # Main form with FormProvider
├── sales-slice.ts          # Redux state management
├── customer-details/       # Customer form section
├── invoice-details/        # Invoice form section  
├── items-and-services/     # Line items form section
└── sales-view/             # Read-only view components
```

### Important Conventions

**Styling Rules:**
- Use Tailwind classes exclusively (avoid raw/inline styles)
- Red colors only for validation errors and error states
- Follow existing component styling patterns

**Type Safety:**
- Comprehensive TypeScript usage throughout
- Business types in `utils/global-types-interfaces-enums.ts`
- Form types: `SalesFormDataType`, `ContactsType`, `TranHType`, `TranDType`

**Component Patterns:**
- `useUtilsInfo()` hook provides common data: `branchId`, `finYearId`, `buCode`
- `getValues()`, `setValue()`, `trigger()` for form management
- `setParentValue` pattern for nested form communication

**Error Handling:**
- `Utils.showErrorMessage()` for user-facing errors
- GraphQL errors handled centrally via Apollo Client
- SweetAlert2 for confirmations and notifications

### Database Integration

**Generic CRUD Pattern:**
```typescript
// Generic database operations via GraphQL
Utils.doGenericUpdate({
    buCode: string,
    dbName: string, 
    tableName: string,
    xData: object
})
```

**Key Database Tables:**
- `Contacts` - Customer/supplier data
- `TranH` - Transaction headers
- `TranD` - Transaction details/line items
- See `AllTables` in `app/maps/database-tables-map.ts`

### Common Utilities

**Utils Object** (`utils/utils.tsx`):
- `Utils.queryGraphQL()` / `Utils.mutateGraphQL()` - API calls
- `Utils.showHideModalDialogA()` / `Utils.showHideModalDialogB()` - Modals
- `Utils.toDecimalFormat()` - Number formatting  
- `Utils.getCompanyName()` - Business context
- `Utils.showErrorMessage()` - Error display

**Validators** (`utils/validators-hook.ts`):
- `isValidEmail()`, `isValidGstin()`, `checkMobileNo()`
- Use in form validation rules

### Development Notes

**Knowledgebase (from README.md):**
- ModalDialogA/B use `ibukiEmit` subscription pattern in `useEffect`
- `Utils.showModalDialogA()` and `Utils.showModalDialogB()` trigger via `ibukiEmit`

**When Creating Forms:**
- Use `useForm<TypeName>()` with proper TypeScript typing
- Include `FormProvider` for multi-section forms
- Implement form persistence via Redux if needed
- Follow validation pattern with `react-hook-form` rules
- Use `setParentValue` for child forms updating parent forms

**When Adding Features:**
- Create feature-specific Redux slice if state management needed
- Follow existing directory structure patterns  
- Use GraphQL via centralized `Utils` methods
- Implement proper error handling and loading states
- should be left aligned