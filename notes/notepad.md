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

set search_path to demounit1; -- Optimized query from AI
WITH branchId AS (VALUES (1::int)),
     finYearId AS (VALUES (2024)),
     accId AS (VALUES (129::int)),
     cte1 AS (
         SELECT "accName"
         FROM "AccM"
         WHERE id = (TABLE accId)
     ),
     cte2 AS (
         SELECT 
             CASE WHEN "dc" = 'D' THEN "amount" ELSE 0.00 END AS "debit",
             CASE WHEN "dc" = 'C' THEN "amount" ELSE 0.00 END AS "credit",
             "branchCode"
         FROM "AccOpBal" a
         JOIN "BranchM" b ON b.id = a."branchId"
         WHERE a."accId" = (TABLE accId)
           AND "finYearId" = (TABLE finYearId)
           AND COALESCE((TABLE branchId), a."branchId") = a."branchId"
     ),
     cte3 AS (
         SELECT 
             d."tranDate",
             t."tranType",
             h."autoRefNo",
             h."userRefNo",
             d."remarks" AS "lineRemarks",
             d."lineRefNo",
             b."branchCode",
             h."remarks",
             CASE WHEN d."dc" = 'D' THEN d."amount" ELSE 0.00 END AS "debit",
             CASE WHEN d."dc" = 'C' THEN d."amount" ELSE 0.00 END AS "credit",
             (
                 SELECT string_agg("instrNo", ',')
                 FROM "TranD" t1
                 WHERE h.id = t1."tranHeaderId"
             ) AS "instrNo",
             (
                 SELECT string_agg(DISTINCT a1."accName", ', ')
                 FROM "TranD" t1
                 JOIN "AccM" a1 ON a1."id" = t1."accId"
                 WHERE h."id" = t1."tranHeaderId"
                   AND t1."dc" <> d."dc"
             ) AS "otherAccounts"
         FROM "TranD" d
         JOIN "TranH" h ON h.id = d."tranHeaderId"
         JOIN "BranchM" b ON b.id = h."branchId"
         JOIN "TranTypeM" t ON t.id = h."tranTypeId"
         WHERE d."accId" = (TABLE accId)
           AND h."finYearId" = (TABLE finYearId)
           AND COALESCE((TABLE branchId), h."branchId") = h."branchId"
     ),
     cte4 AS (
         SELECT "debit", "credit" FROM cte2
         UNION ALL
         SELECT "debit", "credit" FROM cte3
     ),
     cte5 AS (
         SELECT SUM("debit") AS "debits", SUM("credit") AS "credits"
         FROM cte4
     )
SELECT json_build_object(
           'accName', (SELECT "accName" FROM cte1),
           'opBalance', (SELECT json_agg(a) FROM cte2 a),
           'transactions', (SELECT json_agg(a) FROM cte3 a),
           'sum', (SELECT json_agg(a) FROM cte5 a)
       );

