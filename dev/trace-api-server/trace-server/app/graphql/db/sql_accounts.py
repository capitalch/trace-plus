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
	) """
 
    get_trial_balance = """
           WITH RECURSIVE "AccountHierarchy" AS (
    -- Base case: Root level accounts
    SELECT 
        "m"."id",
        "m"."accCode",
        "m"."accName",
        "m"."accType",
        "m"."parentId",
        COALESCE("o"."opening", 0) AS "opening",
        COALESCE("t"."debit", 0) AS "debit",
        COALESCE("t"."credit", 0) AS "credit",
        COALESCE("o"."opening", 0) + COALESCE("t"."debit", 0) - COALESCE("t"."credit", 0) AS "closing",
        NULL::JSONB AS "children" -- Initialize children as NULL
    FROM "AccM" "m"
    LEFT JOIN (
        -- Calculate opening balances
        SELECT 
            "accId",
            SUM(CASE WHEN "dc" = 'D' THEN "amount" ELSE - "amount" END) AS "opening"
        FROM "AccOpBal"
        GROUP BY "accId"
    ) "o" ON "m"."id" = "o"."accId"
    LEFT JOIN (
        -- Calculate transaction sums
        SELECT 
            "accId",
            SUM(CASE WHEN "dc" = 'D' THEN "amount" ELSE 0 END) AS "debit",
            SUM(CASE WHEN "dc" = 'C' THEN "amount" ELSE 0 END) AS "credit"
        FROM "TranD"
        GROUP BY "accId"
    ) "t" ON "m"."id" = "t"."accId"
    WHERE "m"."parentId" IS NULL -- Start with root accounts

    UNION ALL

    -- Recursive case: Fetch child accounts
    SELECT 
        "m"."id",
        "m"."accCode",
        "m"."accName",
        "m"."accType",
        "m"."parentId",
        COALESCE("o"."opening", 0) AS "opening",
        COALESCE("t"."debit", 0) AS "debit",
        COALESCE("t"."credit", 0) AS "credit",
        COALESCE("o"."opening", 0) + COALESCE("t"."debit", 0) - COALESCE("t"."credit", 0) AS "closing",
        NULL::JSONB AS "children" -- Initialize children as NULL
    FROM "AccM" "m"
    LEFT JOIN (
        SELECT 
            "accId",
            SUM(CASE WHEN "dc" = 'D' THEN "amount" ELSE - "amount" END) AS "opening"
        FROM "AccOpBal"
        GROUP BY "accId"
    ) "o" ON "m"."id" = "o"."accId"
    LEFT JOIN (
        SELECT 
            "accId",
            SUM(CASE WHEN "dc" = 'D' THEN "amount" ELSE 0 END) AS "debit",
            SUM(CASE WHEN "dc" = 'C' THEN "amount" ELSE 0 END) AS "credit"
        FROM "TranD"
        GROUP BY "accId"
    ) "t" ON "m"."id" = "t"."accId"
    INNER JOIN "AccountHierarchy" "p" ON "m"."parentId" = "p"."id"
)
SELECT 
    "root"."id",
    "root"."accCode",
    "root"."accName",
    "root"."accType",
    "root"."parentId",
    "root"."opening",
    "root"."debit",
    "root"."credit",
    "root"."closing",
    (
        SELECT JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'id', "child"."id",
                'accCode', "child"."accCode",
                'accName', "child"."accName",
                'accType', "child"."accType",
                'parentId', "child"."parentId",
                'opening', "child"."opening",
                'debit', "child"."debit",
                'credit', "child"."credit",
                'closing', "child"."closing",
                'children', "child"."children"
            )
        )
        FROM "AccountHierarchy" "child"
        WHERE "child"."parentId" = "root"."id"
    ) AS "children"
FROM "AccountHierarchy" "root"
WHERE "root"."parentId" IS NULL
ORDER BY "root"."accType", "root"."accName";

    """
 
    test_connection = """
        select 'ok' as "connection"
    """