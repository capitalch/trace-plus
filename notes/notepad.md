## Different steps for Hierarchy accounts
- Step 1: Basic without recursion: Array_agg for children
- Step 2: With recursion array_agg
- Step 3: Basic without recursion json_agg
- Step 4: With recursion json_agg

I have following tables in an accounting system PostgreSql. I want to create trial balance:
1) AccM: As Accounts Master: id, accCode, accName, accType(L forliability, A for Asset, E for expences, I for Income), parentId
2) AccOpBal: For opening balances of accounts: id, accId, dc(D for Debits, C for Credits), amount
3) TranD: For transaction details: id, accId, dc (D for Debits, C for Credits), amount
Create a trial balance query to be consumed by Syncfusion TreeGrid. It should be hierarchal. The parentId column defines the hierarchy in AccM table


## Recursive CTE example
WITH RECURSIVE child_cte AS (
    -- Start with the given parent ID (direct children)
    SELECT id
    FROM "AccM"
    WHERE "parentId" = %(parentId)s

    UNION ALL

    -- Recursively get the children of the children (grandchildren and beyond)
    SELECT a.id
    FROM "AccM" a
    INNER JOIN child_cte c ON a."parentId" = c.id
)
SELECT ARRAY_AGG(id) AS child_ids
FROM child_cte;