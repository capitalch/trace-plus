I have following tables in an accounting system PostgreSql. I want to create trial balance:
1) AccM: As Accounts Master: id, accCode, accName, accType(L forliability, A for Asset, E for expences, I for Income), parentId
2) AccOpBal: For opening balances of accounts: id, accId, dc(D for Debits, C for Credits), amount
3) TranD: For transaction details: id, accId, dc (D for Debits, C for Credits), amount
Create a trial balance query to be consumed by Syncfusion TreeGrid. It should be hierarchal. The parentId column defines the hierarchy in AccM table


set search_path to demounit1;
WITH RECURSIVE cte_hierarchy AS (
    -- Build the account hierarchy recursively
    SELECT 
        "id", "accCode", "accName", "accType", "parentId"
    FROM "AccM"
    WHERE "parentId" IS NULL
    UNION ALL
    SELECT 
        acc."id", acc."accCode", acc."accName", acc."accType", acc."parentId"
    FROM "AccM" acc
    INNER JOIN cte_hierarchy ch ON acc."parentId" = ch."id"
),
cte_opening_balances AS (
    -- Fetch opening balances for accounts
    SELECT 
        acc."id",
        SUM(CASE WHEN ob."dc" = 'D' THEN ob."amount" ELSE -ob."amount" END) AS "opening_balance"
    FROM "AccM" acc
    LEFT JOIN "AccOpBal" ob ON acc."id" = ob."accId"
    GROUP BY acc."id"
),
cte_transaction_sums AS (
    -- Calculate debit and credit totals from transactions
    SELECT 
        acc."id",
        SUM(CASE WHEN td."dc" = 'D' THEN td."amount" ELSE 0 END) AS "total_debit",
        SUM(CASE WHEN td."dc" = 'C' THEN td."amount" ELSE 0 END) AS "total_credit"
    FROM "AccM" acc
    LEFT JOIN "TranD" td ON acc."id" = td."accId"
    GROUP BY acc."id"
),
cte_trial_balance AS (
    -- Combine hierarchy, opening balances, and transaction sums
    SELECT 
        h."id",
        h."accCode",
        h."accName",
        h."accType",
        h."parentId",
        COALESCE(ob."opening_balance", 0) AS "opening_balance",
        COALESCE(ts."total_debit", 0) AS "total_debit",
        COALESCE(ts."total_credit", 0) AS "total_credit",
        COALESCE(ob."opening_balance", 0) + COALESCE(ts."total_debit", 0) - COALESCE(ts."total_credit", 0) AS "closing_balance"
    FROM cte_hierarchy h
    LEFT JOIN cte_opening_balances ob ON h."id" = ob."id"
    LEFT JOIN cte_transaction_sums ts ON h."id" = ts."id"
)
-- Select final data with hierarchy structure for TreeGrid
SELECT 
    "id",
    "accCode",
    "accName",
    "accType",
    "parentId",
    "opening_balance",
    "total_debit",
    "total_credit",
    "closing_balance"
FROM cte_trial_balance
ORDER BY "accType", "accName";