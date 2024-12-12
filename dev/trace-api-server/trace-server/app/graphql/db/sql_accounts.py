class SqlAccounts:

    get_account_balance = '''
     with "accId" as (values (%(accId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "branchId" as (values (%(branchId)s::int))
     --with "accId" AS (VALUES (117::int)), "finYearId" as (VALUES (2024::int)), "branchId" as (VALUES (1::int))
        , cte1 as (
            SELECT "accId"
                , SUM(CASE WHEN d.dc = 'D' THEN d.amount ELSE -d.amount END) amount
                    FROM "TranH" h
                        join "TranD" d
                            on h.id = d."tranHeaderId"
                        where  "accId" = (table "accId") 
                            and "finYearId" = (table "finYearId")
                            and (select COALESCE((TABLE "branchId"), "branchId") = "branchId")
                    GROUP BY "accId"
            UNION
            SELECT "accId"
                , (CASE WHEN a.dc = 'D' THEN a.amount ELSE -a.amount END ) amount
                        from "AccOpBal" a
                    where  "accId" = (table "accId") 
                        and "finYearId" = (table "finYearId")
                        and (select COALESCE((TABLE "branchId"), "branchId") = "branchId")
            )
            select  SUM(amount) as "accountBalance"
                from cte1
            Group by "accId"
    '''
    
    get_account_ledger = '''
    with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "accId" as (values(%(accId)s::int)),
	--with "branchId" as (values (1::int)), "finYearId" as (values (2024)), "accId" as (values(129::int)),
    cte1 AS (
        SELECT "accName"
        FROM "AccM"
        WHERE "id" = (TABLE "accId")
    ),
    cte2 AS (
        SELECT 
            CASE WHEN "dc" = 'D' THEN "amount" ELSE 0.00 END AS "debit",
            CASE WHEN "dc" = 'C' THEN "amount" ELSE 0.00 END AS "credit",
            "branchCode"
        FROM "AccOpBal" a
        JOIN "BranchM" b ON b."id" = a."branchId"
        WHERE a."accId" = (TABLE "accId")
          AND "finYearId" = (TABLE "finYearId")
          AND COALESCE((TABLE "branchId"), a."branchId") = a."branchId"
    ),
    cte3 AS (
        SELECT 
            "tranDate",
            "tranType",
            "autoRefNo",
            "userRefNo",
            d."remarks" AS "lineRemarks",
            "lineRefNo",
            "branchCode",
            h."remarks",
            CASE WHEN d."dc" = 'D' THEN d."amount" ELSE 0.00 END AS "debit",
            CASE WHEN d."dc" = 'C' THEN d."amount" ELSE 0.00 END AS "credit",
            (
                SELECT string_agg("instrNo", ',')
                FROM "TranD" t1
                WHERE h."id" = t1."tranHeaderId"
            ) AS "instrNo",
            (
                SELECT string_agg(DISTINCT a1."accName", ', ')
                FROM "TranD" t1
                JOIN "AccM" a1 ON a1."id" = t1."accId"
                WHERE h."id" = t1."tranHeaderId"
                  AND t1."dc" <> d."dc"
            ) AS "otherAccounts"
        FROM "TranD" d
        JOIN "TranH" h ON h."id" = d."tranHeaderId"
        JOIN "BranchM" b ON b."id" = h."branchId"
        JOIN "TranTypeM" t ON t."id" = h."tranTypeId"
        WHERE d."accId" = (TABLE "accId")
          AND h."finYearId" = (TABLE "finYearId")
          AND COALESCE((TABLE "branchId"), h."branchId") = h."branchId"
    ),
    cte4 AS (
        SELECT "debit", "credit" FROM "cte2"
        UNION ALL
        SELECT "debit", "credit" FROM "cte3"
    ),
    cte5 AS (
        SELECT SUM("debit") AS "debits", SUM("credit") AS "credits"
        FROM "cte4"
    )
    SELECT json_build_object(
        'accName', (SELECT "accName" FROM cte1),
        'opBalance', (SELECT json_agg(a) FROM cte2 a),
        'transactions', (SELECT json_agg(a) FROM cte3 a),
        'sum', (SELECT json_agg(a) FROM cte5 a))
    '''
    
    get_balanceSheet_profitLoss = '''
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
        -- "branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)),
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
			AND (SELECT COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
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
			AND (SELECT COALESCE((TABLE "branchId"), b."branchId") = b."branchId")
        ),

        -- Summarize data at each hierarchy level
        cte2 AS (
            SELECT 
                h."accId", 
                a."accName", 
                a."accType", 
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
                a."accType", 
                h."parentId"
        ),

        -- Calculate profit or loss
        cte3 AS ( SELECT
			SUM(CASE WHEN "accType" in('L','A') THEN opening + debit - credit ELSE 0 END) as "profitOrLoss"
            FROM cte1 c
            JOIN "AccM" a ON a."id" = c."accId"
        ),

        -- Final aggregation
        cte4 AS (
            SELECT 
                c."accId" AS id, 
                c."accName", 
                c."accType",
                ABS(c."closing") AS "closing",
                CASE WHEN c."closing" < 0 THEN 'C' ELSE 'D' END AS "closing_dc",
                c."parentId", 
                ARRAY_AGG(child."accId" ORDER BY child."accName") AS "children"
            FROM cte2 c
            LEFT JOIN cte2 child ON child."parentId" = c."accId"
            where (c.closing != 0)
            GROUP BY 
                c."accId", 
                c."accName",
                c."closing",
                c."parentId",
                c."accType"
            ORDER BY 
                c."accType", 
                c."accName"
        )
        -- Build JSON result
        SELECT JSON_BUILD_OBJECT(
			'profitOrLoss', (SELECT "profitOrLoss" FROM cte3),
			'liabilities', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" = 'L'),
			'assets', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" = 'A'),
			'expenses', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" = 'E'),
			'incomes', (SELECT JSON_AGG(a) FROM cte4 a WHERE "accType" = 'I')
        ) AS "jsonResult"
    '''

    get_ledger_leaf_accounts = '''
        select id, "accName", "accLeaf"
            from "AccM"
                where "accLeaf" in ('L','Y')
            order by "accName"
    '''

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
    
    get_subledger_accounts = """
        with "accId" as (values (%(accId)s::int))
         -- with "accId" AS (VALUES (1::int))
            select id, "accName", "accLeaf"
                from "AccM"
                    where "parentId" = (table "accId")
                order by "accName"
    """
    
    get_trialBalance = """
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
        -- "branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)),

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
			AND (SELECT COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
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
			AND (SELECT COALESCE((TABLE "branchId"), b."branchId") = b."branchId")
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
        cte3 AS ( SELECT
			SUM(CASE WHEN "accType" in('L','A') THEN opening + debit - credit ELSE 0 END) as "profitOrLoss"
            FROM cte1 c
            JOIN "AccM" a ON a."id" = c."accId"
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
            where (c.opening != 0) or (c.debit !=0 ) or (c.credit !=0 )
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
            'profitOrLoss', (SELECT "profitOrLoss" FROM cte3)
        ) AS "jsonResult"
    """
 
    test_connection = """
        select 'ok' as "connection"
    """