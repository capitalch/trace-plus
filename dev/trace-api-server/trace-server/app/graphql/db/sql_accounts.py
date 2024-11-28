class SqlAccounts:
    get_settings_fin_years_branches = """
        with cte1 as (
		select id as "branchId", "branchName", "branchCode"
			from "BranchM"
				order by "branchName", "branchCode")
        , cte2 as (
            select id as "finYearId", "startDate", "endDate"
                from "FinYearM"
                    order by id)
        , cte3 as (
            select id as "settingsId", "key", "textValue", "jData", "intValue"
                from "Settings"
                    order by id)
        select json_build_object(
            'allBranches', (select json_agg(row_to_json(a)) from cte1 a)
            , 'allFinYears', (select json_agg(row_to_json(b)) from cte2 b)
            , 'allSettings', (select json_agg(row_to_json(c)) from cte3 c)
	) as "jsonResult" 
    """
 
    get_trialBalance_balanceSheet_profitAndLoss = """
        -- Recursive Query to Build Account Hierarchy
        WITH RECURSIVE hier AS (
            SELECT 
                "accId", 
                "opening", 
                "debit", 
                "credit", 
                "parentId"
            FROM cte1

            UNION ALL

            SELECT 
                a."id" AS "accId", 
                h."opening", 
                h."debit", 
                h."credit", 
                a."parentId"
            FROM hier h
            JOIN "AccM" a ON h."parentId" = a."id"
        ),
        -- Constants for branch and financial year
         "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
        --"branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)),

        -- Base data preparation
        cte1 AS (
            SELECT 
                d.id, 
                d."accId", 
                0.00 AS "opening",
                CASE WHEN d."dc" = 'D' THEN d."amount" ELSE 0.00 END AS "debit",
                CASE WHEN d."dc" = 'C' THEN d."amount" ELSE 0.00 END AS "credit",
                a."parentId"
            FROM "TranH" h
            JOIN "TranD" d ON h.id = d."tranHeaderId"
            JOIN "AccM" a ON a.id = d."accId"
            WHERE h."finYearId" = (TABLE "finYearId")
            AND h."branchId" = (TABLE "branchId")

            UNION ALL

            SELECT 
                b.id, 
                b."accId",
                CASE WHEN b."dc" = 'D' THEN b."amount" ELSE -b."amount" END AS "opening",
                0.00 AS "debit",
                0.00 AS "credit",
                a."parentId"
            FROM "AccOpBal" b
            JOIN "AccM" a ON a.id = b."accId"
            WHERE b."finYearId" = (TABLE "finYearId")
            AND b."branchId" = (TABLE "branchId")
        ),

        -- Summarize data at each hierarchy level
        cte2 AS (
            SELECT 
                h."accId", 
                a."accName", 
                a."accCode", 
                a."accType", 
                a."accLeaf",
                h."parentId",
                SUM(h."opening") AS "opening", 
                SUM(h."debit") AS "debit",
                SUM(h."credit") AS "credit",
                SUM(h."opening" + h."debit" - h."credit") AS "closing"
            FROM hier h
            JOIN "AccM" a ON a."id" = h."accId"
            GROUP BY 
                h."accId", 
                a."accName", 
                a."accCode", 
                a."accType", 
                a."accLeaf", 
                h."parentId"
            
        ),

        -- Calculate profit or loss
        cte3 AS (
            SELECT SUM(opening + debit - credit) AS "profitOrLoss"
            FROM cte1 c
            JOIN "AccM" a ON a."id" = c."accId"
            WHERE "accType" IN ('A', 'L')
        ),

        -- Final aggregation
        cte4 AS (
            SELECT 
                c."accId" AS id, 
                c."accName", 
                c."accCode",
                c."accType",
                ABS(c."opening") AS "opening", 
                CASE WHEN c."opening" < 0 THEN 'C' ELSE 'D' END AS "opening_dc",
                c."debit", 
                c."credit",
                ABS(c."closing") AS "closing",
                CASE WHEN c."closing" < 0 THEN 'C' ELSE 'D' END AS "closing_dc",
                c."parentId", 
                ARRAY_AGG(child."accId" ORDER BY child."accName") AS "children"
            FROM cte2 c
            LEFT JOIN cte2 child ON child."parentId" = c."accId"
            GROUP BY 
                c."accId", 
                c."accName", 
                c."accCode", 
                c."opening", 
                c."debit", 
                c."credit", 
                c."closing",
                c."parentId",
                c."accType"
            ORDER BY 
                c."accType", 
                c."accName"
        )

        -- Build JSON result
        SELECT JSON_BUILD_OBJECT(
            'trialBalance', (SELECT JSON_AGG(a) FROM cte4 a),
            'profitOrLoss', (SELECT "profitOrLoss" FROM cte3),
            'balanceSheet', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" IN ('A', 'L')),
            'profitAndLoss', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" IN ('E', 'I'))
        ) AS "jsonResult"
    """
 
    test_connection = """
        select 'ok' as "connection"
    """