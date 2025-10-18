# Plan: Understanding Users, Roles, and Secured Controls Management

## Executive Summary

This document provides a comprehensive explanation of how users, roles, and secured controls (permissions) are managed in the Trace Plus software. The system implements a **Role-Based Access Control (RBAC)** architecture with a three-tier user hierarchy and fine-grained permission management through secured controls.

---

## 1. User Hierarchy and Types

The system has three distinct user types, forming a hierarchical access structure:

### 1.1 User Types Enum

**Location**: `src/utils/global-types-interfaces-enums.ts`

```tsx
export enum UserTypesEnum {
  SuperAdmin = "S",  // Super Administrator
  Admin = "A",       // Client Administrator
  BusinessUser = "B" // Regular Business User
}
```

### 1.2 User Type Definitions

#### **Super Admin (S)**
- **Purpose**: System-level administration across all clients
- **Scope**: Global - manages the entire platform
- **Database**: Stored in global security database (`GLOBAL_SECURITY_DATABASE_NAME`)
- **Key Responsibilities**:
  - Create and manage clients (organizations)
  - Create admin users for each client
  - Define and manage secured controls (system-wide permissions)
  - Create super admin roles
  - Manage global database connections
  - View system-wide statistics

**Dashboard Metrics** (`super-admin-dashboard.tsx`):
- Database connections (active/idle/total)
- Clients (active/inactive/total)
- Admin users (active/inactive/total)
- Non-admin users (active/inactive/total)
- Roles (super admin/admin/total)
- Databases count
- Secured controls count

#### **Admin (A)**
- **Purpose**: Client-level administration
- **Scope**: Specific to one client/organization
- **Database**: Client's own database + global security database
- **Key Responsibilities**:
  - Create and manage business units within their client
  - Create and manage business users
  - Create admin-level roles
  - Link secured controls to roles
  - Link users to business units
  - Manage client-specific settings

**Dashboard Metrics** (`admin-dashboard.tsx`):
- Business units count
- Roles count
- Business users count

#### **Business User (B)**
- **Purpose**: Day-to-day business operations
- **Scope**: Specific business units within a client
- **Access**: Limited to assigned business units and role permissions
- **Key Responsibilities**:
  - Perform accounting, sales, purchases, inventory operations
  - Access based on assigned role's secured controls
  - Work within assigned business units

---

## 2. Login State Management

### 2.1 Login State Structure

**Location**: `src/features/login/login-slice.ts`

The Redux login state stores all authentication and authorization data:

```tsx
export type LoginType = {
  accSettings?: AccSettingType[]
  allBranches?: BranchType[]
  allBusinessUnits?: BusinessUnitType[]       // All BUs in the system
  allFinYears?: FinYearType[]
  allSecuredControls?: SecuredControlType[]   // ALL controls in system
  currentBranch?: BranchType
  currentBusinessUnit?: BusinessUnitType       // User's selected BU
  currentDateFormat?: string
  currentFinYear?: FinYearType
  isLoggedIn: boolean
  role?: RoleType                              // User's role
  token: string | undefined                    // JWT token
  userBusinessUnits?: BusinessUnitType[]       // BUs assigned to user
  userDetails?: UserDetailsType                // User info
  userSecuredControls?: SecuredControlType[]   // User's permissions
}
```

### 2.2 User Details Type

```tsx
export type UserDetailsType = {
  branchIds?: String
  clientCode?: string
  clientId?: number
  clientName?: string
  dbName?: string
  dbParams?: string
  decodedDbParamsObject?: { [key: string]: string | undefined }
  hash?: string
  id?: number
  isUserActive?: boolean
  isClientActive?: boolean
  isExternalDb?: boolean
  lastUsedBranchId?: number
  lastUsedBuId?: number
  lastUsedFinYearId?: number
  mobileNo?: string
  uid?: string
  userEmail?: string
  userName?: string
  userType?: 'S' | 'A' | 'B' | undefined     // The key field!
}
```

### 2.3 Login Flow

**Location**: `src/features/login/login-hook.tsx`

**Process** (`onSubmit` function):

1. **User submits credentials** (username, password, optional clientId)
2. **POST request** to `/api/login` endpoint
3. **Server responds** with:
   - `accessToken`: JWT token for authentication
   - `payload`: Complete user data including:
     - `userDetails` (including `userType`)
     - `role`
     - `userSecuredControls` (user's permissions)
     - `allSecuredControls` (all available permissions)
     - `userBusinessUnits` (assigned BUs)
     - `allBusinessUnits` (all BUs in client)

4. **Client stores data**:
   ```tsx
   dispatch(doLogin({
     allBusinessUnits: payloadData.allBusinessUnits,
     allSecuredControls: payloadData.allSecuredControls,
     isLoggedIn: true,
     role: payloadData.role,
     token: accessToken,
     userBusinessUnits: payloadData.userBusinessUnits,
     userDetails: payloadData.userDetails,
     userSecuredControls: payloadData.userSecuredControls
   }))
   ```

5. **Navigate** to home page

---

## 3. Roles System

### 3.1 Role Data Structure

**Location**: `src/features/login/login-slice.ts`

```tsx
export type RoleType = {
  clientId?: number    // Which client this role belongs to
  roleId?: number      // Unique role ID
  roleName?: string    // Display name
}
```

### 3.2 Role Types and Hierarchy

The system supports different role types based on user level:

**Super Admin Roles**:
- Created by Super Admins
- Stored in global security database
- Can be assigned to Admin users
- Managed via `super-admin-roles.tsx`

**Admin Roles**:
- Created by Admins for their client
- Stored in global security database with `clientId`
- Can be assigned to Business Users
- Managed via `admin-roles.tsx`

### 3.3 Role Management Features

**Location**: `src/features/security/super-admin/roles/super-admin-roles.tsx`
**Location**: `src/features/security/admin/roles/admin-roles.tsx`

**Common Fields**:
- `roleName`: Name of the role
- `descr`: Description
- `rank`: Hierarchy level (higher rank = more authority)

**Operations**:
- Create new roles
- Edit existing roles
- Delete roles
- View all roles in grid
- Link secured controls to roles

---

## 4. Secured Controls (Permissions)

### 4.1 What are Secured Controls?

Secured Controls are **fine-grained permissions** that control access to specific features and functionality in the application. They act as the atomic units of permission in the RBAC system.

### 4.2 Secured Control Data Structure

**Location**: `src/features/login/login-slice.ts`

```tsx
export type SecuredControlType = {
  controlName?: string    // Unique identifier (e.g., "sales.create")
  controlNo?: number      // Numeric code
  controlType?: string    // Category/type of control
  descr?: string          // Description
  id?: number             // Primary key
}
```

### 4.3 Secured Controls Management

**Location**: `src/features/security/super-admin/secured-controls/super-admin-secured-controls.tsx`

**Only Super Admins** can create and manage secured controls because they are system-wide definitions.

**Fields**:
- `controlName`: Unique name (likely used in code to check permissions)
- `controlNo`: Numeric identifier
- `controlType`: Categorization (e.g., "menu", "button", "feature")
- `descr`: Human-readable description

**Operations**:
- Create new secured controls
- Edit existing controls
- Delete controls
- View all controls in grid

### 4.4 How Secured Controls Work

1. **Definition**: Super Admin creates secured controls (e.g., "Sales Invoice Create")
2. **Assignment**: Admin links secured controls to roles
3. **User Access**: When user logs in, they receive `userSecuredControls[]` based on their role
4. **Runtime Check**: Application checks if user has required control before showing/enabling features

**Example Flow**:
```
Super Admin creates: { controlName: "sales.invoice.create", ... }
     ↓
Admin links it to role: "Sales Manager"
     ↓
Business User with "Sales Manager" role logs in
     ↓
userSecuredControls includes "sales.invoice.create"
     ↓
UI enables "Create Sales Invoice" button
```

---

## 5. Linking System: Roles ↔ Secured Controls

### 5.1 Role-SecuredControl Link Management

**Location**: `src/features/security/admin/link-unlink-secured-controls.tsx/admin-link-secured-controls-with-roles.tsx`

This is a **many-to-many relationship**:
- One role can have many secured controls
- One secured control can be linked to many roles

### 5.2 Link Interface

The UI uses a **dual-pane drag-and-drop interface**:

**Left Pane**: Available Secured Controls
- Displays all secured controls in the system
- Grid with checkbox selection
- Supports drag-and-drop
- Sortable and filterable

**Right Pane**: Roles with Linked Controls
- Tree grid showing roles and their secured controls
- Parent nodes: Roles
- Child nodes: Secured controls linked to that role
- Shows count of controls per role

### 5.3 Linking Operations

**Drag & Drop** (`onSecuredControlsRowDrop` function):
1. User drags secured control(s) from left pane
2. Drops on a role in right pane
3. System checks if control already linked to that role
4. Creates link records in `RoleSecuredControlX` table
5. Refreshes the tree grid

**Manual Link** (Click link icon):
1. Click link icon on a role
2. Modal opens with dropdown of available controls
3. Select control and submit
4. Link is created

**Unlink**:
- Click unlink icon on a secured control under a role
- Confirm dialog appears
- Link is deleted from `RoleSecuredControlX` table

**Unlink All**:
- Click unlink all icon on a role (if it has controls)
- Confirms and removes all secured control links for that role

**Auto Link from Built-in Roles**:
- Feature to copy secured controls from predefined roles
- Useful for quickly setting up common role patterns

### 5.4 Database Table

**Table**: `RoleSecuredControlX` (cross-reference table)

**Fields**:
```tsx
{
  id: number              // Primary key
  roleId: number         // Foreign key to RoleM
  securedControlId: number // Foreign key to SecuredControlM
}
```

---

## 6. User Management

### 6.1 Admin User Management (by Super Admin)

**Location**: `src/features/security/super-admin/admin-users/super-admin-admin-users.tsx`

**Super Admin creates Admin users** who will manage individual clients.

**Fields**:
- Client assignment (which organization)
- Username/UID
- User name
- Mobile number
- Email
- Description
- Active status
- Timestamp

**Operations**:
- Create new admin user
- Edit admin user
- Delete admin user
- Activate/deactivate user

### 6.2 Business User Management (by Admin)

**Location**: `src/features/security/admin/business users/admin-business-users.tsx`

**Admin creates Business Users** for their client.

**Fields**:
- Role assignment (which admin role)
- Username/UID
- User name
- Mobile number
- Email
- Description
- Active status
- Timestamp

**Key Difference**: Business users are assigned a **role** which contains secured controls.

### 6.3 User-BusinessUnit Linking

**Location**: `src/features/security/admin/link-unlink-users/admin-link-users-with-bu.tsx`

**Purpose**: Control which business units a business user can access.

**Relationship**: Many-to-many
- One user can access multiple business units
- One business unit can have multiple users

**Why This Matters**:
- Large organizations have multiple business units (e.g., departments, locations, divisions)
- Users should only see data for their assigned business units
- A user might work across multiple business units

---

## 7. Business Units

### 7.1 Business Unit Structure

**Location**: `src/features/login/login-slice.ts`

```tsx
export type BusinessUnitType = {
  buCode?: string    // Business unit code
  buId?: number      // Primary key
  buName?: string    // Display name
}
```

### 7.2 Business Unit Purpose

Business Units represent **organizational divisions** within a client:
- Departments (Sales, Accounts, HR)
- Locations (Branch A, Branch B, Warehouse)
- Subsidiaries
- Cost centers
- Any organizational structure

**Data Isolation**: Transactions, accounts, and reports are filtered by business unit, ensuring users only see relevant data.

### 7.3 Business Unit in Login State

When a user logs in:
- `allBusinessUnits`: All BUs in the client (for selection)
- `userBusinessUnits`: BUs the user is assigned to
- `currentBusinessUnit`: The BU currently selected for work

---

## 8. Authorization Flow

### 8.1 Login & Initial Authorization

```
1. User enters credentials + clientId (if applicable)
   ↓
2. Server validates credentials
   ↓
3. Server queries:
   - User record (gets userType, roleId)
   - Role record (gets role details)
   - RoleSecuredControlX (gets linked secured controls)
   - BusinessUnitUserX (gets assigned business units)
   ↓
4. Server returns:
   - JWT token
   - userDetails (including userType: S/A/B)
   - role
   - userSecuredControls[] (permissions)
   - userBusinessUnits[] (accessible BUs)
   - allSecuredControls[] (for admin purposes)
   - allBusinessUnits[] (for selection)
   ↓
5. Client stores in Redux login state
   ↓
6. Application renders based on userType
```

### 8.2 Runtime Permission Checks

Throughout the application, features check permissions:

**Example**: Show "Create Sale" button only if user has permission

```tsx
const userSecuredControls = useSelector((state) => state.login.userSecuredControls)

const hasCreateSalePermission = userSecuredControls?.some(
  control => control.controlName === 'sales.create'
)

return (
  <div>
    {hasCreateSalePermission && (
      <button>Create Sale</button>
    )}
  </div>
)
```

### 8.3 Menu Access Control

**Location**: `src/features/layouts/master-menu-data.ts`

Menus are configured with required secured controls:

```tsx
{
  label: 'Sales',
  requiredControl: 'sales.access',
  children: [
    {
      label: 'Create Invoice',
      requiredControl: 'sales.invoice.create'
    }
  ]
}
```

The menu system filters out items where user lacks required controls.

### 8.4 Business Unit Filtering

When querying data:

```tsx
const currentBusinessUnit = useSelector((state) => state.login.currentBusinessUnit)

// Query only includes data for current BU
const query = {
  tableName: 'Sales',
  filter: { buId: currentBusinessUnit.buId }
}
```

---

## 9. Database Architecture

### 9.1 Security Database

A **global security database** (`GLOBAL_SECURITY_DATABASE_NAME`) stores:
- `UserM`: All users (Super Admin, Admin, Business Users)
- `RoleM`: All roles
- `SecuredControlM`: All secured control definitions
- `RoleSecuredControlX`: Role-to-Control links
- `BusinessUnitUserX`: User-to-BusinessUnit links
- `ClientM`: Client/organization records

### 9.2 Client Databases

Each client can have their own database for:
- Business units
- Transactions (sales, purchases, payments)
- Inventory
- Accounts
- Reports

**External Database Support**: Clients can use external databases (configured via `dbParams`)

### 9.3 Data Isolation Strategy

**Multi-tenancy** is achieved through:
1. **Database-level**: Separate client databases
2. **Row-level**: `clientId` field in security tables
3. **Business Unit-level**: `buId` field in transaction tables

---

## 10. Key Features & Workflows

### 10.1 Super Admin Workflow

1. **Setup Client**:
   - Create client record
   - Configure database (built-in or external)
   - Create admin user for the client

2. **Manage Secured Controls**:
   - Define all secured controls for the system
   - Organize by type (menu, button, feature, report)

3. **Create Super Admin Roles**:
   - Define roles for admin users
   - Link secured controls to roles

4. **Monitor System**:
   - View dashboard metrics
   - Manage database connections
   - Handle system-wide settings

### 10.2 Admin Workflow

1. **Setup Business Units**:
   - Create business units (departments, locations)
   - Configure business unit schemas

2. **Create Roles**:
   - Define roles for business users
   - Link secured controls to roles

3. **Manage Business Users**:
   - Create business user accounts
   - Assign roles to users
   - Link users to business units

4. **Configure Access**:
   - Fine-tune which controls are linked to which roles
   - Adjust user-business unit assignments

### 10.3 Business User Workflow

1. **Login**:
   - Authenticate with credentials
   - System loads assigned business units and permissions

2. **Select Business Unit**:
   - Choose which business unit to work in
   - All subsequent operations are scoped to this BU

3. **Perform Operations**:
   - Use features based on role permissions
   - Create transactions, run reports, etc.
   - Limited to assigned business units

---

## 11. Security Considerations

### 11.1 Authentication

- **JWT Tokens**: Used for API authentication
- **Token Storage**: Stored in Redux state
- **Token Expiration**: Handled by backend
- **Logout**: Clears all Redux state

### 11.2 Authorization Layers

1. **User Type** (S/A/B): Broadest level
2. **Secured Controls**: Fine-grained permissions
3. **Business Unit Assignment**: Data access scope
4. **Branch Assignment**: Further data filtering (for multi-branch orgs)

### 11.3 Permission Enforcement

**Client-Side**:
- UI elements hidden/disabled based on permissions
- Menu items filtered
- Routes protected

**Server-Side** (assumed):
- API endpoints verify JWT token
- Backend checks user permissions before operations
- Database queries filter by client/BU/branch

---

## 12. Advantages of This Architecture

### 12.1 Flexibility

- **Granular Control**: Secured controls allow very specific permissions
- **Scalable Hierarchy**: S → A → B structure scales to large organizations
- **Multi-Tenancy**: Clean separation between clients

### 12.2 Maintainability

- **Centralized Definitions**: All controls defined in one place
- **Reusable Roles**: Roles can be cloned/templated
- **Clear Separation**: User types have distinct responsibilities

### 12.3 Usability

- **Drag-and-Drop**: Intuitive role-permission linking
- **Business Unit Selection**: Easy switching between organizational units
- **Dashboard Visibility**: Admins can see usage metrics

---

## 13. Data Flow Diagrams

### 13.1 User Creation Flow

```
Super Admin                      Admin                  Business User
     |                            |                            |
     |--Create Client             |                            |
     |--Create Admin User ------->|                            |
     |                            |--Create Business Units     |
     |                            |--Create Admin Roles        |
     |--Define Secured Controls   |                            |
     |                            |--Link Controls to Roles    |
     |                            |--Create Business User ---->|
     |                            |--Assign Role to User       |
     |                            |--Link User to BUs          |
```

### 13.2 Permission Check Flow

```
User Action (e.g., "Create Sale")
     ↓
UI Component Renders
     ↓
Check: Does userSecuredControls[] include "sales.create"?
     ↓
   YES ↓                    NO ↓
Show Button             Hide Button
     ↓
User Clicks
     ↓
API Request (with JWT)
     ↓
Server Validates Token
     ↓
Server Checks User Permissions
     ↓
  ALLOWED ↓             DENIED ↓
Execute Action        Return 403
     ↓
Return Success
     ↓
UI Updates
```

### 13.3 Data Scoping Flow

```
User Logs In
     ↓
Receives: userBusinessUnits = [BU1, BU2, BU3]
     ↓
User Selects: currentBusinessUnit = BU2
     ↓
User Queries Data (e.g., "Get Sales")
     ↓
Query Filters: WHERE buId = BU2
     ↓
Returns: Only sales for BU2
     ↓
User Sees: Scoped data only
```

---

## 14. Related Code Files Reference

### 14.1 Login & Auth
- `src/features/login/login-slice.ts` - Redux state
- `src/features/login/login-hook.tsx` - Login logic
- `src/features/login/login.tsx` - Login UI

### 14.2 Super Admin
- `src/features/security/super-admin/dashboard/super-admin-dashboard.tsx`
- `src/features/security/super-admin/admin-users/super-admin-admin-users.tsx`
- `src/features/security/super-admin/clients/super-admin-clients.tsx`
- `src/features/security/super-admin/roles/super-admin-roles.tsx`
- `src/features/security/super-admin/secured-controls/super-admin-secured-controls.tsx`
- `src/features/security/super-admin/link-unlink-secured-controls/super-admin-link-secured-controls-with-roles.tsx`

### 14.3 Admin
- `src/features/security/admin/dashboard/admin-dashboard.tsx`
- `src/features/security/admin/business users/admin-business-users.tsx`
- `src/features/security/admin/business-units/admin-business-units.tsx`
- `src/features/security/admin/roles/admin-roles.tsx`
- `src/features/security/admin/link-unlink-secured-controls.tsx/admin-link-secured-controls-with-roles.tsx`
- `src/features/security/admin/link-unlink-users/admin-link-users-with-bu.tsx`

### 14.4 Layouts & Navigation
- `src/features/layouts/nav-bar/nav-bar-hook.tsx` - Menu rendering based on user type
- `src/features/layouts/master-menu-data.ts` - Menu definitions
- `src/features/layouts/layouts-slice.ts` - UI state

### 14.5 Types & Enums
- `src/utils/global-types-interfaces-enums.ts` - UserTypesEnum, etc.
- `src/app/global-constants.ts` - GLOBAL_SECURITY_DATABASE_NAME

---

## 15. Summary

The Trace Plus security system is a comprehensive **Role-Based Access Control (RBAC)** implementation with:

1. **Three-tier user hierarchy**: Super Admin → Admin → Business User
2. **Fine-grained permissions**: Secured controls define specific feature access
3. **Role-based assignment**: Users inherit permissions from their role
4. **Organizational scoping**: Business units provide data isolation
5. **Client multi-tenancy**: Separate databases and configurations per client
6. **Flexible linking**: Drag-and-drop interface for role-permission management
7. **Runtime authorization**: Client-side and server-side permission checks
8. **Comprehensive dashboards**: Visibility into users, roles, and access

This architecture provides enterprise-grade security, scalability, and flexibility for multi-tenant accounting/ERP software.
