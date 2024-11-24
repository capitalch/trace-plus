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

## Final approach for simplicity
set search_path to demounit1;
-- Basic without recursion: Array_agg for children
with cte as (
    select h."ID", h."Name", h."Title", e."ID" as "ChildID"
        from "Employees" h
            left join "Employees" e
                on h."ID" = e."ManagerID"
), cte1 as (
select "ID", "Name", "Title", array_agg("ChildID") as children from cte
    GROUP BY "ID","Name", "Title"
        ORDER BY "ID"
)
select JSON_AGG(c) from cte1 c

## Original
set search_path to demounit1;
-- Original
with recursive cte as (
        select * from cte1
            union all
        select a."id", a."accName", a."accType", a."parentId", a."accLeaf"
        , c."opening"
        , c."sign"
        , c."opening_dc"
        , c."debit", c."credit"
            from cte c
                join "AccM" a
                    on c."parentId" = a."id"
        )
        --, "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
        , "branchId" as (values (1::int)), "finYearId" as (values (2024)),
        cte1 as (
            select a."id", "accName", "accType", "parentId", "accLeaf"
                , 0.00 as "opening"
                , 1 as "sign"
                , '' as "opening_dc"
                , CASE WHEN t."dc" = 'D' THEN t."amount" else 0.00 END as "debit"
                , CASE WHEN t."dc" = 'C' THEN t."amount" else 0.00 END as "credit"
            from "AccM" a
                join "TranD" t
                    on t."accId" = a."id"
                join "TranH" h
                    on h."id" = t."tranHeaderId"
                        where "finYearId" = (table "finYearId") 
                            --and "branchId" = (table "branchId")
                            AND (SELECT COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
                union all
            select a."id", "accName", "accType", "parentId", "accLeaf"
                , "amount" as "opening"
                , CASE WHEN "dc" = 'D' THEN 1 ELSE -1 END as "sign"
                , "dc" as "opening_dc"
                , 0 as "debit"
                , 0 as "credit"
            from "AccM" a
                join "AccOpBal" b
                    on a."id" = b."accId"
                        where "finYearId" = (table "finYearId") 
                            --and "branchId" = (table "branchId")
                            AND (SELECT COALESCE((TABLE "branchId"), b."branchId") = b."branchId")
                                order by "accType", "accName"
            ),
        cte2 as (
            select "id", "accName", "accType", "parentId", "accLeaf"
                , SUM("opening" * "sign") as "opening"
                , SUM("debit") as "debit"
                , SUM("credit") as "credit"
                from cte
                    group by "id", "accName", "accType", "parentId", "accLeaf"
                        --order by "id"
                        order by "accType", "accName"
            ) select 
                "id", "accName", "accType", "parentId", "accLeaf"
                , ABS("opening") as "opening"
                , CASE WHEN "opening" < 0 THEN 'C' ELSE 'D' END as "opening_dc"
                , "debit"
                , "credit"
                , (select ARRAY_AGG("id") from cte2 where "parentId" = a."id") as "children"
                , ABS("opening" + "debit" - "credit") as "closing"
                , CASE WHEN ("opening" + "debit" - "credit") < 0 THEN 'C' ELSE 'D' END as "closing_dc"
            from cte2 a
                order by "accType", "accName"


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