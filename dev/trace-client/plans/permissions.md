# Permissions on Role basis
# There are roles
    - built-in-user
    - built-in-sales-person
    - built-in-accountant: removed
    - built-in-manager
    - built-in-reviewer
    - built-in-viewer
    - built-in-purchase-entry-operator
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

# Built-in-accountant: removed
- Vouchers
    - Everything except delete
- Purchase sales
    - All entries excepting delete
- Everything else allowed

# Built-in-Manager
- Can do everything

# built-in-reviewer
- Can only view
    - Final accounts
    - Reports -> All Transactions
    - Inventory reports
    - 

# built-in-viewer
    - Can view all but cannot enter or edit
