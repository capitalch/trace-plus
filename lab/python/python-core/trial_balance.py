import json

# query_output = [
#     # Level 1 (Top-Level Categories)
#     {"id": 1, "accName": "Assets", "accCode": "A001", "accType": "Assets", "opening": 1000.0, "opening_dc": "D", "debit": 500.0, "credit": 300.0, "closing": 1200.0, "closing_dc": "D", "children": [2, 3]},
#     {"id": 11, "accName": "Liabilities", "accCode": "L001", "accType": "Liabilities", "opening": -1500.0, "opening_dc": "C", "debit": 700.0, "credit": 200.0, "closing": -1000.0, "closing_dc": "C", "children": [12, 13]},
#     {"id": 17, "accName": "Capital", "accCode": "E001", "accType": "Equity", "opening": -2000.0, "opening_dc": "C", "debit": 1000.0, "credit": 500.0, "closing": -1500.0, "closing_dc": "C", "children": [18]},
#     {"id": 20, "accName": "Revenue", "accCode": "R001", "accType": "Income", "opening": 0.0, "opening_dc": "D", "debit": 3000.0, "credit": 2500.0, "closing": 500.0, "closing_dc": "D", "children": [21, 22]},
#     {"id": 30, "accName": "Expenses", "accCode": "E101", "accType": "Expense", "opening": 0.0, "opening_dc": "D", "debit": 2500.0, "credit": 1500.0, "closing": 1000.0, "closing_dc": "D", "children": [31, 32]},

#     # Level 2
#     {"id": 2, "accName": "Cash", "accCode": "A002", "accType": "Assets", "opening": 600.0, "opening_dc": "D", "debit": 200.0, "credit": 100.0, "closing": 700.0, "closing_dc": "D", "children": [4, 5]},
#     {"id": 3, "accName": "Bank", "accCode": "A003", "accType": "Assets", "opening": 400.0, "opening_dc": "D", "debit": 300.0, "credit": 200.0, "closing": 500.0, "closing_dc": "D", "children": [6]},
#     {"id": 12, "accName": "Loans", "accCode": "L002", "accType": "Liabilities", "opening": -1000.0, "opening_dc": "C", "debit": 400.0, "credit": 300.0, "closing": -900.0, "closing_dc": "C", "children": [14, 15]},
#     {"id": 13, "accName": "Overdraft", "accCode": "L003", "accType": "Liabilities", "opening": -500.0, "opening_dc": "C", "debit": 300.0, "credit": 200.0, "closing": -400.0, "closing_dc": "C", "children": []},
#     {"id": 18, "accName": "Owner's Capital", "accCode": "E002", "accType": "Equity", "opening": -2000.0, "opening_dc": "C", "debit": 1000.0, "credit": 500.0, "closing": -1500.0, "closing_dc": "C", "children": [19]},
#     {"id": 21, "accName": "Product Sales", "accCode": "R002", "accType": "Income", "opening": 0.0, "opening_dc": "D", "debit": 2000.0, "credit": 1500.0, "closing": 500.0, "closing_dc": "D", "children": [23, 24]},
#     {"id": 22, "accName": "Service Revenue", "accCode": "R003", "accType": "Income", "opening": 0.0, "opening_dc": "D", "debit": 1000.0, "credit": 1000.0, "closing": 0.0, "closing_dc": "D", "children": []},
#     {"id": 31, "accName": "Salaries", "accCode": "E102", "accType": "Expense", "opening": 0.0, "opening_dc": "D", "debit": 1500.0, "credit": 0.0, "closing": 1500.0, "closing_dc": "D", "children": []},
#     {"id": 32, "accName": "Office Supplies", "accCode": "E103", "accType": "Expense", "opening": 0.0, "opening_dc": "D", "debit": 1000.0, "credit": 500.0, "closing": 500.0, "closing_dc": "D", "children": []},

#     # Level 3
#     {"id": 4, "accName": "Petty Cash", "accCode": "A004", "accType": "Assets", "opening": 300.0, "opening_dc": "D", "debit": 100.0, "credit": 50.0, "closing": 350.0, "closing_dc": "D", "children": []},
#     {"id": 5, "accName": "Cash in Hand", "accCode": "A005", "accType": "Assets", "opening": 300.0, "opening_dc": "D", "debit": 150.0, "credit": 50.0, "closing": 400.0, "closing_dc": "D", "children": [7, 8]},
#     {"id": 6, "accName": "Savings Account", "accCode": "A006", "accType": "Assets", "opening": 400.0, "opening_dc": "D", "debit": 200.0, "credit": 100.0, "closing": 500.0, "closing_dc": "D", "children": [9]},
#     {"id": 14, "accName": "Personal Loans", "accCode": "L004", "accType": "Liabilities", "opening": -700.0, "opening_dc": "C", "debit": 300.0, "credit": 200.0, "closing": -600.0, "closing_dc": "C", "children": [16]},
#     {"id": 15, "accName": "Business Loans", "accCode": "L005", "accType": "Liabilities", "opening": -300.0, "opening_dc": "C", "debit": 100.0, "credit": 50.0, "closing": -250.0, "closing_dc": "C", "children": []},
#     {"id": 23, "accName": "Domestic Sales", "accCode": "R004", "accType": "Income", "opening": 0.0, "opening_dc": "D", "debit": 1500.0, "credit": 1000.0, "closing": 500.0, "closing_dc": "D", "children": []},
#     {"id": 24, "accName": "International Sales", "accCode": "R005", "accType": "Income", "opening": 0.0, "opening_dc": "D", "debit": 500.0, "credit": 500.0, "closing": 0.0, "closing_dc": "D", "children": []},
#     {"id": 19, "accName": "Retained Earnings", "accCode": "E003", "accType": "Equity", "opening": -500.0, "opening_dc": "C", "debit": 200.0, "credit": 100.0, "closing": -400.0, "closing_dc": "C", "children": []},
#     {"id": 7, "accName": "Safe Deposit", "accCode": "A007", "accType": "Assets", "opening": 150.0, "opening_dc": "D", "debit": 50.0, "credit": 20.0, "closing": 180.0, "closing_dc": "D", "children": []},
# ]
query_output = [
    {
        "id": 347,
        "accName": "2024-05-26 H/SAL/4/2024: 311/H/1 abcd:3333333333",
        "accCode": "311/H/1/2024",
        "accType": "A",
        "opening": 0.0,
        "opening_dc": "D",
        "debit": 2500.0,
        "credit": 0.0,
        "closing": 2500.0,
        "closing_dc": "D",
        "parentId": 311,
        "children": [None],
    },
    {
        "id": 312,
        "accName": "311/head/1/2022",
        "accCode": "311/head/1/2022",
        "accType": "A",
        "opening": 11500.0,
        "opening_dc": "D",
        "debit": 0.0,
        "credit": 0.0,
        "closing": 11500.0,
        "closing_dc": "D",
        "parentId": 311,
        "children": [None],
    },
    {
        "id": 313,
        "accName": "311/head/2/2022",
        "accCode": "311/head/2/2022",
        "accType": "A",
        "opening": 11500.0,
        "opening_dc": "D",
        "debit": 0.0,
        "credit": 0.0,
        "closing": 11500.0,
        "closing_dc": "D",
        "parentId": 311,
        "children": [None],
    },
    {
        "id": 311,
        "accName": "Bajaj Finance",
        "accCode": "bajajFinance",
        "accType": "A",
        "opening": 34500.0,
        "opening_dc": "D",
        "debit": 2500.0,
        "credit": 0.0,
        "closing": 37000.0,
        "closing_dc": "D",
        "parentId": 22,
        "children": [313, 312, 347, 314],
    }]


def build_nested_hierarchy_with_children(flat_data):
    # Create a dictionary mapping account IDs to their respective data
    id_to_node = {item["id"]: {**item, "children": []} for item in flat_data}

    # Iterate over each record to assign children nodes
    for item in flat_data:
        for child_id in item.get("children", []):
            if child_id in id_to_node:
                id_to_node[item["id"]]["children"].append(id_to_node[child_id])

    # Extract only the top-level nodes (those not referenced as children)
    all_children_ids = {
        child_id for item in flat_data for child_id in item.get("children", [])
    }
    roots = [
        node for node_id, node in id_to_node.items() if node_id not in all_children_ids
    ]

    return roots


# Build the hierarchy
nested_hierarchy = build_nested_hierarchy_with_children(query_output)

# Convert the result to a JSON string
nested_json = json.dumps(nested_hierarchy, indent=4)

# Print the JSON
print(nested_json)
