# Permissions on Role basis
# There are 4 roles
    - built-in-user
    - built-in-sales-person
    - built-in-accountant
    - built-in-manager
# built-in-user
- Has view only permissions. Cannot save data.
- Vouchers: View all vouchers
- purchase sales: view all
- Reports: All transactions
- Inventory: Reports

# Built-in-sales-person
- Vouchers
    - View all vouchers
    - Receipts create, preview, view
- Purchase sales
    - Sales
        - create, view, preview,
    - Sales return
        - create, view, preview
    - Inventory
        - reports

# Built-in-accountant
- Vouchers
    - All vouchers
    - New entry not allowed
- Purchase sales
    - new entries not allowed
- Everything else allowed

# Admin
- Can do everything
