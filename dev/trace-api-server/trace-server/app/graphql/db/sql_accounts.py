class SqlAccounts:

    does_acc_code_exist = """
        with "accCode" as (values (%(accCode)s::text))
        --with "accCode" AS (VALUES ('CashInHand1'::text))
        SELECT EXISTS (
            SELECT 1
                FROM "AccM"
            WHERE LOWER("accCode") = LOWER((table "accCode")))
    """

    does_acc_name_exist = """
    with "accName" as (values (%(accName)s::text))
        --with "accName" AS (VALUES ('Cash-In-Hand'::text))
        SELECT EXISTS (
            SELECT 1
                FROM "AccM"
            WHERE LOWER("accName") = LOWER((table "accName")))
    """

    get_account_balance = """
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
    """

    get_account_ledger = """
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
            "branchName"
        FROM "AccOpBal" a
        JOIN "BranchM" b ON b."id" = a."branchId"
        WHERE a."accId" = (TABLE "accId")
          AND "finYearId" = (TABLE "finYearId")
          AND COALESCE((TABLE "branchId"), a."branchId") = a."branchId"
    ),
    cte3 AS (
        SELECT d.id,
            "tranDate",
            "tranType",
            "autoRefNo",
            "userRefNo",
            d."remarks" AS "lineRemarks",
            "lineRefNo",
            "branchName",
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
        ORDER BY "tranDate", id
    )
    SELECT json_build_object(
            'accName', (SELECT "accName" FROM cte1),
            'opBalance', (SELECT json_agg(a) FROM cte2 a),
            'transactions', (SELECT json_agg(a) FROM cte3 a)
        ) as "jsonResult"
    """

    get_accounts_master = """
    -- modified by AI
        WITH RECURSIVE "children_cte" AS (
    SELECT 
        "parentId" AS "parent_id", 
        ARRAY_AGG("id") AS "child_ids"
    FROM 
        "AccM"
    GROUP BY 
        "parentId"
),
cte1 AS (
    SELECT 
        a."id", 
        a."accCode", 
        a."accName", 
        a."parentId", 
        a."accType", 
        a."isPrimary", 
        a."accLeaf", 
        a."classId", 
        c."accClass",

        -- Optimized parentAccLeaf with JOIN
        p."accLeaf" AS "parentAccLeaf",
		p."classId" AS "parentClassId",
		p."accType" AS "parentAccType",
        x."id" AS "extBusinessContactsAccMId",
        e."isAutoSubledger",
        cte."child_ids" AS "children",

        -- Simplified CASE for addressable
        (c."accClass" IN ('debtor', 'creditor', 'loan') AND a."accLeaf" IN ('Y', 'S')) AS "addressable",

        -- Simplified CASE for isAddressExists
        (x."id" IS NOT NULL) AS "isAddressExists"

            FROM 
                "AccM" a

            -- JOIN instead of subquery for parentAccLeaf
            LEFT JOIN 
                "AccM" p ON a."parentId" = p."id"

            LEFT JOIN 
                "children_cte" cte ON a."id" = cte."parent_id"

            JOIN 
                "AccClassM" c ON a."classId" = c."id"

            LEFT JOIN 
                "ExtBusinessContactsAccM" x ON a."id" = x."accId"

            LEFT JOIN 
                "ExtMiscAccM" e ON a."id" = e."accId"
        )
        SELECT 
            json_build_object(
                'accountsMaster', (SELECT json_agg(a) FROM cte1 a)
            ) AS "jsonResult"
    """

    get_account_parent_options = """
        with "accType" as (values (%(accType)s::text))
        --WITH "accType" AS (VALUES ('L'))
        SELECT 
            a.id as "accId", 
            "accClass", 
            "accLeaf", 
            "accName",
            "accType",
            CASE
                WHEN "accType" = 'A' then 'Asset'
				WHEN "accType" = 'L' then 'Liab'
				WHEN "accType" = 'I' then 'Income'
				WHEN "accType" = 'E' then 'Expence'
            END || ': ' ||
            CASE 
                WHEN "accLeaf" = 'L' THEN 'Ledger' 
                ELSE 'Group' 
            END || ': ' || "accClass" || ': ' || "accName" AS "fullName"
        FROM 
            "AccM" a
            JOIN "AccClassM" c ON c.id = a."classId"
        WHERE 
            "accLeaf" IN ('L', 'N')
            AND (
                CASE 
                    WHEN (table "accType") IN ('L', 'A') THEN a."accType" IN ('L', 'A')
                    ELSE a."accType" IN ('E', 'I')
                END
            )
        ORDER BY 
          "accType", "accLeaf", "accClass", "accName"
    """

    get_all_banks = """
        select a."id" as "accId", "accName"
            from "AccM" a 
                join "AccClassM" c
                    on c."id" = a."classId"			
        where "accClass" = 'bank'
            and "accLeaf" in ('Y', 'S')
        order by "accName"
    """

    get_balanceSheet_profitLoss = """
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
    """

    get_bank_op_balance = """
        select "id", "amount", "dc"
            from "BankOpBal"
                where "accId" = %(accId)s
                    and "finYearId" = %(finYearId)s
    """

    get_bank_recon = """ --optimized by ai
    with "finYearId" as (values (%(finYearId)s::int)), "accId" as (values(%(accId)s::int)), "startDate" 
    as (values(%(startDate)s::date)), "endDate" as (values(%(endDate)s::date)),
    --WITH "finYearId" AS (VALUES (2024)), "accId" AS (VALUES (310::int)), "startDate" AS (VALUES ('2024-04-01'::date)), 
    --    "endDate" AS (VALUES ('2025-03-31'::date)),
    cte1 AS (
        SELECT 
            d."id" AS "tranDetailsId",
            h."id",
            "tranDate",
            "tranTypeId",
            "userRefNo",
            h."remarks",
            "autoRefNo",
            "lineRefNo",
            "instrNo",
            d."remarks" AS "lineRemarks",
            CASE WHEN "dc" = 'D' THEN "amount" ELSE 0 END AS "credit",
            CASE WHEN "dc" = 'C' THEN "amount" ELSE 0 END AS "debit",
            x."clearDate", 
            x."clearRemarks", 
            x."id" AS "bankReconId",
            x."clearDate" AS "origClearDate",
            x."clearRemarks" AS "origClearRemarks"
        FROM "TranD" d
        LEFT JOIN "ExtBankReconTranD" x 
            ON d."id" = x."tranDetailsId"
        JOIN "TranH" h 
            ON h."id" = d."tranHeaderId"
        WHERE d."accId" = (table "accId")
            AND (
                h."finYearId" = (table "finYearId") 
                OR x."clearDate" BETWEEN (table "startDate") AND (table "endDate"))),
    cte2 as (
        select
        CASE WHEN "dc" = 'D' then "amount" ELSE 0.00 END as "debit"
        , CASE WHEN "dc" = 'C' then "amount" ELSE 0.00 END as "credit"
        , "dc"
        from "BankOpBal"
            where "accId" = (table "accId")
                and "finYearId" = (table "finYearId")),
    precomputed_acc_names AS (
        SELECT 
            d."tranHeaderId",
            STRING_AGG(a."accName", ', ') AS "accNames"
        FROM "TranD" d
        JOIN "AccM" a ON a."id" = d."accId"
        WHERE d."accId" <> (table "accId")
        GROUP BY d."tranHeaderId"),
    cte3 as (
        SELECT c1.*, p."accNames"
        FROM cte1 c1
        LEFT JOIN precomputed_acc_names p 
            ON p."tranHeaderId" = c1."id"
        ORDER BY 
            c1."clearDate", c1."tranDate", c1."id")
    select json_build_object(
            'bankRecon', (SELECT json_agg(a) from cte3 a)
            , 'opBalance', (SELECT row_to_json(b) from cte2 b)
            ) as "jsonResult"
    """

    get_extBusinessContactsAccM = """
    select * 
	    from "ExtBusinessContactsAccM"
		    where "accId" = %(accId)s
    """

    get_ledger_leaf_accounts = """
        select id, "accName", "accLeaf"
            from "AccM"
                where "accLeaf" in ('L','Y')
            order by "accName"
    """

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

    upsert_auto_subledger = """
        with "accId" as (values(%(accId)s::int)), "isAutoSubledger" as (values(%(isAutoSubledger)s::boolean)),
        --with "accId" as (values(346::int)), "isAutoSubledger" as (values(false::boolean)),
        upsert AS (
            UPDATE "ExtMiscAccM"
            SET "isAutoSubledger" = (table "isAutoSubledger")
            WHERE "accId" = (table "accId")
            RETURNING "id"
        )
        INSERT INTO "ExtMiscAccM" ("accId", "isAutoSubledger")
        SELECT (table "accId"), (table "isAutoSubledger")
        WHERE NOT EXISTS (SELECT 1 FROM upsert)
    """
