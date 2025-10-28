# Plan: Implement Access Controls from access-controls.md

## Overview
Add new access control entries to `access-controls.json` for various Masters and Inventory operations as specified in `access-controls.md`.

## Current Structure Analysis

The `access-controls.json` file follows this pattern:
- **controlNo**: Unique number identifier
- **controlName**: Dot-notation name (e.g., `masters.company-info.edit`)
- **controlType**: Either `"action"` or `"menu"`
- **descr**: Human-readable description
- **menuType** (for menu items): `"accounts"`
- **itemType** (for menu items): `"parent"` or `"child"`
- **menuId** (for menu items): String ID

### Current Control Number Ranges:
- 110-169: Voucher actions (Payment, Receipt, Contra, Journal)
- 201-256: Purchase/Sales actions
- 1000-1099: Menu items (vouchers parent)
- 1100-1199: Menu items (all vouchers child)
- 1010-1099: Menu items (purchase-sales parent)
- 1110-1199: Menu items (purchase-sales children)
- 1020-1099: Menu items (masters parent)
- 1200-1299: Menu items (masters children)
- 1300-1369: Menu items (final accounts children)
- 1350-1369: Menu items (options children)
- 1370-1379: Menu items (reports children)
- 1380-1399: Menu items (inventory children)

## Required Additions

### 1. Masters - Action Controls

#### Company Info (Control No: 301-306)
- `301`: `masters.company-info.edit` - Can edit Company Info

#### General Settings (Control No: 311-316)
- `311`: `masters.general-settings.edit` - Can edit General Settings

#### Accounts Master (Control No: 321-326)
- `321`: `masters.accounts-master.create` - Can create new Accounts
- `322`: `masters.accounts-master.edit` - Can edit existing Accounts
- `323`: `masters.accounts-master.delete` - Can delete Accounts

#### Opening Balances (Control No: 331-336)
- `331`: `masters.opening-balances.edit` - Can edit Opening Balances

#### Branches (Control No: 341-346)
- `341`: `masters.branches.create` - Can create new Branches
- `342`: `masters.branches.edit` - Can edit existing Branches
- `343`: `masters.branches.delete` - Can delete Branches

#### Financial Years (Control No: 351-356)
- `351`: `masters.financial-years.create` - Can create new Financial Years
- `352`: `masters.financial-years.edit` - Can edit existing Financial Years
- `353`: `masters.financial-years.delete` - Can delete Financial Years

### 2. Inventory - Action Controls

#### Categories (Control No: 401-406)
- `401`: `inventory.categories.create` - Can create new Categories
- `402`: `inventory.categories.edit` - Can edit existing Categories
- `403`: `inventory.categories.delete` - Can delete Categories

#### Brands (Control No: 411-416)
- `411`: `inventory.brands.create` - Can create new Brands
- `412`: `inventory.brands.edit` - Can edit existing Brands
- `413`: `inventory.brands.delete` - Can delete Brands

#### Product Master (Control No: 421-426)
- `421`: `inventory.product-master.create` - Can create new Products
- `422`: `inventory.product-master.edit` - Can edit existing Products
- `423`: `inventory.product-master.delete` - Can delete Products

#### Opening Stock (Control No: 431-436)
- `431`: `inventory.opening-stock.create` - Can create Opening Stock entries
- `432`: `inventory.opening-stock.edit` - Can edit Opening Stock entries
- `433`: `inventory.opening-stock.delete` - Can delete Opening Stock entries

#### Stock Journal (Control No: 441-446)
- `441`: `inventory.stock-journal.view` - Can view Stock Journal records
- `442`: `inventory.stock-journal.create` - Can create Stock Journal entries
- `443`: `inventory.stock-journal.edit` - Can edit Stock Journal entries
- `444`: `inventory.stock-journal.delete` - Can delete Stock Journal entries

#### Branch Transfer (Control No: 451-456)
- `451`: `inventory.branch-transfer.view` - Can view Branch Transfer records
- `452`: `inventory.branch-transfer.create` - Can create Branch Transfer entries
- `453`: `inventory.branch-transfer.edit` - Can edit Branch Transfer entries
- `454`: `inventory.branch-transfer.delete` - Can delete Branch Transfer entries

## Implementation Steps

### Step 1: Add Masters Action Controls (301-353)
Add 13 new control entries for Masters section actions:
- Company Info: edit
- General Settings: edit
- Accounts Master: create, edit, delete
- Opening Balances: edit
- Branches: create, edit, delete
- Financial Years: create, edit, delete

### Step 2: Add Inventory Action Controls (401-454)
Add 18 new control entries for Inventory section actions:
- Categories: create, edit, delete
- Brands: create, edit, delete
- Product Master: create, edit, delete
- Opening Stock: create, edit, delete
- Stock Journal: view, create, edit, delete
- Branch Transfer: view, create, edit, delete

### Step 3: Update Corresponding React Components
For each action control added, ensure the corresponding React component checks for permission using the control name. This will be done in a subsequent implementation phase.

## JSON Structure Template

```json
{
  "controlNo": <number>,
  "controlName": "<module>.<feature>.<action>",
  "controlType": "action",
  "descr": "Can <action> <feature>"
}
```

## Notes

- All new controls are of type `"action"` (not `"menu"`)
- Menu controls already exist for all these features (1200-1386)
- Control numbers follow sequential pattern
- Descriptions follow the pattern: "Can {action} {feature}"
- After adding to JSON, these controls need to be:
  1. Synced to database via super-admin interface
  2. Checked in React components using permission hooks
  3. Linked to appropriate roles

## Total Additions
- **Masters**: 13 action controls
- **Inventory**: 18 action controls
- **Grand Total**: 31 new access control entries
