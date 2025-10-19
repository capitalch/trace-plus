# Permissions on Role basis
# There are 4 roles
    - built-in-user
    - built-in-sales-person
    - built-in-accountant
    - built-in-manager
# built-in-user
- Has view only permissions. Cannot save data.
- Cannot see Trial Balance, Balance Sheet, PL Account menu items in Final Accounts. These menu items are not visible for this role
- Cannot see Options menu item and its children
- Cannot see Stock Journal and Branch Transfer in Inventory menu item

# Built-in-sales-person
- Can only see the following menu items
    - Vouchers receipts
    - Sales
    - Sales Return
- Edit sales not allowed
- Edit sales return not allowed
- view Sales and Sales return allowed
- No other controls or menu items are visible

# Built-in-accountant
- New entry not allowed
- Edit entries allowed
- All menu items and its children are visible

# Admin
- Can do everything
