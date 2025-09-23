from psycopg import connect, sql


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

    does_catId_brandId_product_label_exist = """
        with "catId" as (values(%(catId)s::int)), "brandId" as (values(%(brandId)s::int)), "label" as (values(%(label)s::text))
        --with "catId" as (values(4::int)), "brandId" as (values(1::int)), "label" as (values ('ddd'::text))
        SELECT EXISTS (
            SELECT 1
                FROM "ProductM" p
			        INNER JOIN "CategoryM" c ON c."id" = p."catId"
			        INNER JOIN "BrandM" b ON b."id" = p."brandId"
			            WHERE "catId" = (table "catId")
							and "brandId" = (table"brandId")
							and LOWER("label") = LOWER((table "label")))
    """

    does_other_catId_brandId_product_label_exist = """
    with "catId" as (values(%(catId)s::int)), "brandId" as (values(%(brandId)s::int)), "label" as (values (%(label)s::text)), id as (values (%(id)s::int))
        --with "catId" as (values(4::int)), "brandId" as (values(1::int)), "label" as (values ('ddd'::text)), id as (VALUES (9::int))
        SELECT EXISTS (
            SELECT 1
                FROM "ProductM" p
			        INNER JOIN "CategoryM" c ON c."id" = p."catId"
			        INNER JOIN "BrandM" b ON b."id" = p."brandId"
			            WHERE "catId" = (table "catId")
							and "brandId" = (table"brandId")
							and LOWER("label") = LOWER((table "label"))
							and p."id" <> (table "id"))
    """

    does_category_name_exist = """
    with "catName" as (values (%(catName)s::text))
        --with "catName" AS (VALUES ('LED'::text))
        SELECT EXISTS (
            SELECT 1
                FROM "CategoryM"
            WHERE LOWER("catName") = LOWER((table "catName")))
    """

    does_other_category_name_exist = """
    with "catName" as (values (%(catName)s::text)), id as (values (%(id)s::int))
        --with "catName" AS (VALUES ('LED'::text)), id as (VALUES (25::int))
        SELECT EXISTS (
            SELECT 1
                FROM "CategoryM"
            WHERE (LOWER("catName") = LOWER((table "catName"))
				and "id" <> (table "id")))
    """

    does_purchase_invoice_exist = """
    --with "id" AS (VALUES (3333)), "finYearId" AS (VALUES (2024)), "tranTypeId" AS (VALUES (5)), "accId" AS (VALUES (1111)), "userRefNo" AS (VALUES ('kkk'))
	with "id" AS (VALUES (%(id)s::int)), "finYearId" AS (VALUES (%(finYearId)s::int)), "tranTypeId" AS (VALUES (%(tranTypeId)s::int)), "accId" AS (VALUES (%(accId)s::int)), "userRefNo" AS (VALUES (%(userRefNo)s::text))
            select true as "isExists" from "TranH" h 
                join "TranD" d
                    on h.id = d."tranHeaderId"
                where "finYearId" = (table "finYearId")
                    and "tranTypeId" = (table "tranTypeId")
                    and "accId" = (table "accId")
                    and lower(trim(h."userRefNo")) = lower(trim((table "userRefNo")))
                    and h."id" <> (table "id")
    """

    does_tag_name_exist = """
        with "tagName" as (values (%(tagName)s::text))
            --with "tagName" AS (VALUES ('tag1'::text))
            SELECT EXISTS (
                SELECT 1
                    FROM "TagsM"
                WHERE LOWER("tagName") = LOWER((table "tagName")))
    """

    does_other_tag_name_exist = """
        with "tagName" as (values (%(tagName)s::text)), id as (values (%(id)s::int))
        --with "tagName" AS (VALUES ('tag22'::text)), id as (VALUES (12::int))
        SELECT EXISTS (
            SELECT 1
                FROM "TagsM"
            WHERE (LOWER("tagName") = LOWER((table "tagName"))
				and "id" <> (table "id")))
    """

    does_upc_code_exist = """
    with "upcCode" as (values (%(upcCode)s::text))
        --with "upcCode" AS (VALUES (1::text))
    SELECT EXISTS (
                SELECT 1
                    FROM "ProductM"
                WHERE ("upcCode" = (table "upcCode")))
    """

    execute_stock_transfer = """
    --with "branchId" as (values (1)), "finYearId" as (values (2022)), "closingDate" as (values ('2023-03-31')),
        with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "closingDate" as (values (%(closingDate)s)),
        cte1 as (
            select "productId", (table "branchId") "branchId", ((table "finYearId") + 1) "finYearId", "clos" "qty", "price" "openingPrice", "lastPurchaseDate"
                from get_stock_on_date((table "branchId"), (table "finYearId"), (table "closingDate")::date)
        ),
        cte2 as (
            insert into "ProductOpBal" ("productId", "branchId", "finYearId", "qty", "openingPrice", "lastPurchaseDate")
                select "productId", "branchId", "finYearId", "qty", COALESCE("openingPrice",0), COALESCE("lastPurchaseDate", (table "closingDate"):: date)
                    from cte1 where not exists(
                        select 1 from "ProductOpBal"
                            where "productId" = cte1."productId"
                                and "branchId" = cte1."branchId"
                                and "finYearId" = cte1."finYearId"
                    )
                returning id
        ),
        cte_update as (
            update "ProductOpBal" p
                set qty = cte1.qty,
                "openingPrice" = COALESCE(cte1."openingPrice", 0),
                "lastPurchaseDate" = COALESCE(cte1."lastPurchaseDate", (table "closingDate"):: date)
            from cte1
            where
                p."productId" = cte1."productId"
                and p."branchId" = cte1."branchId"
                and p."finYearId" = cte1."finYearId"
        )
        select * from cte2
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
        SELECT "accName", "accClass"
        FROM "AccM" a
			join "AccClassM" c
				on c.id = a."classId"
        WHERE a."id" = (TABLE "accId")
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
			'accClass', (SELECT "accClass" FROM cte1),
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
            "parentId"),
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
                    --ORDER by a."accType", c."accClass", a."accName", a."accCode"
                )
                SELECT 
                    json_build_object(
                        'accountsMaster', (SELECT json_agg(a) FROM cte1 a)
                    ) AS "jsonResult"
    """

    get_accounts_master_export = """
        select a.*, "accClass"
            from "AccM" a
                join "AccClassM" c
                    on c."id" = a."classId"
                        order by a."id"
    """

    get_accounts_opening_balance = """
        with cte1 as 
            (select a."id", "accCode", "accName", "parentId", "accType", "isPrimary", "accLeaf","classId"
            , (select array_agg(id) from "AccM" m where a."id" = m."parentId" ) as "children"
                from "AccM" a 
                    where "accType" in ('A', 'L')
                        order by "accType", "accName", a."id"),
             "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
                --"branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)),
            opbal as (
                select "id" as "opId", "accId", "amount", "dc", "branchId"
                    from "AccOpBal"
                        where "finYearId" = (table "finYearId")
                            and "branchId" = (table "branchId"))
            select a."id", b."opId", "accType", "accLeaf", "accName"
                , "parentId"
                , CASE WHEN dc='D' then "amount" else 0  END as "debit"
                , CASE WHEN dc='C' then "amount" else 0 end as "credit"
                , "children"
                from cte1 a
                    left outer join opbal b
                        on a."id" = b."accId"                                                           
                    order by "accType","accLeaf", "accName"
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

    get_all_branches = """
    select "id", "branchCode", "branchName", "remarks"
        from "BranchM"
            order by "id"
    """

    get_all_branch_transfer_headers = """
    with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int))
        --with "branchId" as (values (1)), "finYearId" as (values (2024))
        select h.id
        , "tranDate"
        ,"autoRefNo"
        , "userRefNo"
        , h."remarks"
        , MIN(b."branchName") as "sourceBranchName"
        , MIN(b1."branchName") as "destBranchName"
        , string_agg(t."lineRefNo", ', ') as "lineRefNo"
        , string_agg(t."lineRemarks", ', ') as "lineRemarks"
        , string_agg("productCode", ', ') as "productCodes"
        , string_agg("catName" || ' ' || "brandName" || ' ' || "label" || ' ' || COALESCE("info",'') , ', ') as "productDetails"
        , string_agg(t."jData"->>'serialNumbers', ', ') as "serialNumbers"
		, SUM(qty * price) as amount
            from "TranH" h
                join "BranchM" b
                    on b.id = h."branchId"
                join "BranchTransfer" t
                    on h.id = t."tranHeaderId"
                join "ProductM" p
                    on p.id = t."productId"
                join "BrandM" br
                    on br.id = p."brandId"
                join "BranchM" b1
                    on b1.id = t."destBranchId"
				join "CategoryM" c
                    on c.id = p."catId"
			where "finYearId" = (table "finYearId") 
				and "branchId" = (table "branchId")
            group by h.id
			order by "tranDate" DESC, h.id DESC
    """

    get_all_brands = """
        SELECT 
            b."id",
            b."brandName",
            b."remarks",
            CASE WHEN MAX(p.id) IS NULL THEN FALSE ELSE TRUE END as "isUsed"
        FROM "BrandM" b
        LEFT JOIN "ProductM" p ON b.id = p."brandId"
        GROUP BY 
            b."id",
            b."brandName",
            b."remarks"
        ORDER BY "brandName"
    """

    get_all_debit_credit_notes = """
        --with "branchId" as (values (1)), "finYearId" as (values (2025)),"tranTypeId" as (values(7))
        with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "tranTypeId" as (values(%(tranTypeId)s))
	            select 
					ROW_NUMBER() OVER (ORDER BY "tranDate" DESC, h."id" DESC) AS "index",
					h."id", 
					h."tranDate", 
					h."autoRefNo", 
					h."userRefNo", 
					h."remarks",
					MAX(d."amount") "amount",
	                STRING_AGG(d."lineRefNo", ', ') "lineRefNo",
					STRING_AGG(d."remarks", ', ' ) "lineRemarks",
	                MAX(CASE WHEN "dc" = 'D' then "accName" else null END) "debitAccount",
	                MAX(CASE WHEN "dc" = 'C' then "accName" else null END) "creditAccount",
					MAX(e."gstin") "gstin",
					MAX(e."rate") "rate",
					MAX(e."cgst") "cgst",
					MAX(e."sgst") "sgst",
					MAX(e."igst") "igst",
					BOOL_OR(e."isInput") "input",
					MAX(e."hsn") "hsn"
	            from "TranH" h
					join "TranD" d
						on h."id" = d."tranHeaderId" 
					join "AccM" a
						on a."id" = d."accId"
					left outer join "ExtGstTranD" e
						on d."id" = e."tranDetailsId"
	            where "tranTypeId" = (table "tranTypeId") 
	                and "finYearId" =(table "finYearId") 
					and "branchId" = (table "branchId")
			
				group by h."id",
					h."tranDate", 
					h."autoRefNo", 
					h."userRefNo", 
					h."remarks"
				order by "tranDate" DESC, "id" DESC
    """

    get_all_gst_reports = """
        --with "branchId" as (values(null::int)), "finYearId" as (values(2022)), "startDate" as (values('2022-04-01'::date)), "endDate" as (values('2023-03-31'::date))
			with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "startDate" as (values(%(startDate)s ::date)), "endDate" as (values(%(endDate)s:: date))
			, cte1 as (
            select  "tranDate", "autoRefNo", "userRefNo", "tranType", "gstin", d."amount" - "cgst" - "sgst" - "igst" as "aggregate", "cgst", "sgst", "igst", d."amount",
                    "accName",h."remarks", "dc", "lineRefNo", d."remarks" as "lineRemarks"
                from "TranH" h
                    join "TranD" d
                        on h."id" = d."tranHeaderId"
                    join "ExtGstTranD" e
                        on d."id" = e."tranDetailsId"
                    join "AccM" a
                        on a."id" = d."accId"
                    join "TranTypeM" t
                        on t."id" = h."tranTypeId"
                where
                    ("cgst" <> 0 or
                    "sgst" <> 0 or
                    "igst" <> 0) and
                    "isInput" = true and
                    h."finYearId" = (table "finYearId") and
					COALESCE((TABLE "branchId"), h."branchId") = h."branchId" and
                    (h."tranDate" between (table "startDate") and (table "endDate"))
                order by h."tranDate", h."id"),
            
            -- gst-output-consolidated (ExtGstTrand) based on "isInput"
            cte2 as (
            select  "tranDate", "autoRefNo", "userRefNo", "tranType", "gstin", d."amount" - "cgst" - "sgst" - "igst" as "aggregate", "cgst", "sgst", "igst", d."amount",
                    "accName",h."remarks", "dc", "lineRefNo", d."remarks" as "lineRemarks"
                from "TranH" h
                    join "TranD" d
                        on h."id" = d."tranHeaderId"
                    join "ExtGstTranD" e
                        on d."id" = e."tranDetailsId"
                    join "AccM" a
                        on a."id" = d."accId"
                    join "TranTypeM" t
                        on t."id" = h."tranTypeId"
                where
                    ("cgst" <> 0 or
                    "sgst" <> 0 or
                    "igst" <> 0) and
                    "isInput" = false and
                    "finYearId" = (table "finYearId") and
					COALESCE((TABLE "branchId"),h. "branchId") = h."branchId" and
                    ("tranDate" between (table "startDate") and (table "endDate"))
                
                order by "tranDate", h."id"),
            
            -- gst-output-sales (considering only table SalePurchaseDetails)
            cte3 as (
                select  "tranDate", "autoRefNo", "userRefNo", "tranType", 
                (select "gstin" from "ExtGstTranD" where "tranDetailsId" = d."id") as "gstin",
                "gstRate",
                SUM(CASE WHEN "tranTypeId" = 4 THEN (s."amount" - "cgst" - "sgst" - "igst") ELSE -(s."amount" - "cgst" - "sgst" - "igst") END) as "aggregate",
                SUM(CASE WHEN "tranTypeId" = 4 THEN "cgst" ELSE -"cgst" END) as "cgst",
                SUM(CASE WHEN "tranTypeId" = 4 THEN "sgst" ELSE -"sgst" END) as "sgst",
                SUM(CASE WHEN "tranTypeId" = 4 THEN "igst" ELSE -"igst" END) as "igst",
                SUM(CASE WHEN "tranTypeId" = 4 THEN s."amount" ELSE -s."amount" END) as "amount",
                "accName", h."remarks", "dc", "lineRefNo", d."remarks" as "lineRemarks"
                        from "TranH" h
                            join "TranD" d
                                on h."id" = d."tranHeaderId"
                            join "AccM" a
                                on a."id" = d."accId"
                            join "TranTypeM" t
                                on t."id" = h."tranTypeId"
                            join "SalePurchaseDetails" s
                                on d."id" = s."tranDetailsId"
                        where
                            ("cgst" <> 0 or
                            "sgst" <> 0 or
                            "igst" <> 0) and
                            "tranTypeId" in (4,9) and
                            "finYearId" = (table "finYearId") and
							COALESCE((TABLE "branchId"), h."branchId") = h."branchId" and
							("tranDate" between (table "startDate") and (table "endDate"))
                    GROUP BY 
                        "tranDate", h."id", "tranDate", "autoRefNo", "userRefNo", "tranType", "gstin", "gstRate", "accName", h."remarks", "dc", "lineRefNo", d."remarks"     
                    order by "tranDate", h."id"
            ),

            -- gst-input-purchases (considering only table SalePurchaseDetails)
            cte4 as (
                select  "tranDate", "autoRefNo", "userRefNo", "tranType", 
                (select "gstin" from "ExtGstTranD" where "tranDetailsId" = d."id") as "gstin",
                "gstRate",
                SUM(CASE WHEN "tranTypeId" = 5 THEN (s."amount" - "cgst" - "sgst" - "igst") ELSE -(s."amount" - "cgst" - "sgst" - "igst") END) as "aggregate",
                SUM(CASE WHEN "tranTypeId" = 5 THEN "cgst" ELSE -"cgst" END) as "cgst",
                SUM(CASE WHEN "tranTypeId" = 5 THEN "sgst" ELSE -"sgst" END) as "sgst",
                SUM(CASE WHEN "tranTypeId" = 5 THEN "igst" ELSE -"igst" END) as "igst",
                SUM(CASE WHEN "tranTypeId" = 5 THEN s."amount" ELSE -s."amount" END) as "amount",
                "accName", h."remarks", "dc", "lineRefNo", d."remarks" as "lineRemarks"
                        from "TranH" h
                            join "TranD" d
                                on h."id" = d."tranHeaderId"
                            join "AccM" a
                                on a."id" = d."accId"
                            join "TranTypeM" t
                                on t."id" = h."tranTypeId"
                            join "SalePurchaseDetails" s
                                on d."id" = s."tranDetailsId"
                        where
                            ("cgst" <> 0 or
                            "sgst" <> 0 or
                            "igst" <> 0) and
                            "tranTypeId" in (5,10) and
                            "finYearId" = (table "finYearId") and
							COALESCE((TABLE "branchId"), h."branchId") = h."branchId" and
							("tranDate" between (table "startDate") and (table "endDate"))
                group by
					"tranDate", h."id", "autoRefNo", "userRefNo", "tranType", "gstin", "gstRate","accName", h."remarks", "dc", "lineRefNo", d."remarks"
                order by "tranDate", h."id"
            ),

            -- gst-input-vouchers
            cte5 as (
                select  "tranDate", "autoRefNo", "userRefNo", "tranType", 
                "gstin", "rate" as "gstRate",
                d."amount" - "cgst" - "sgst" - "igst" as "aggregate", "cgst", "sgst", "igst", d."amount",
                "accName", h."remarks", "dc", "lineRefNo", d."remarks" as "lineRemarks"
                        from "TranH" h
                            join "TranD" d
                                on h."id" = d."tranHeaderId"
                            join "ExtGstTranD" e
                                on d."id" = e."tranDetailsId"
                            join "AccM" a
                                on a."id" = d."accId"
                            join "TranTypeM" t
                                on t."id" = h."tranTypeId"
                        where
                            ("cgst" <> 0 or
                            "sgst" <> 0 or
                            "igst" <> 0) and
                            "rate" is not null and -- When it is not a sale / purchase i.e voucher, then "gstRate" value exists in "ExtGstTranD" table otherwise not
                            "isInput" = true and -- Only applicable for GST through vouchers
                            "finYearId" = (table "finYearId") and
							COALESCE((TABLE "branchId"), h."branchId") = h."branchId" and
							("tranDate" between (table "startDate") and (table "endDate"))
                        
                order by "tranDate", h."id"
            ),
			-- gst-output-sales-hsn (considering only table SalePurchaseDetails)
            cte6 as (
                select  "tranType", hsn,
 				COUNT(*) as "itemsCount",
				COUNT(DISTINCT h.id) as "saleBillsCount",				
                SUM(CASE WHEN "tranTypeId" = 4 THEN (s."amount" - "cgst" - "sgst" - "igst") ELSE -(s."amount" - "cgst" - "sgst" - "igst") END) as "aggregate",
                SUM(CASE WHEN "tranTypeId" = 4 THEN "cgst" ELSE -"cgst" END) as "cgst",
                SUM(CASE WHEN "tranTypeId" = 4 THEN "sgst" ELSE -"sgst" END) as "sgst",
                SUM(CASE WHEN "tranTypeId" = 4 THEN "igst" ELSE -"igst" END) as "igst",
                SUM(CASE WHEN "tranTypeId" = 4 THEN s."amount" ELSE -s."amount" END) as "amount",
                "accName", "dc"
                        from "TranH" h
                            join "TranD" d
                                on h."id" = d."tranHeaderId"
                            join "AccM" a
                                on a."id" = d."accId"
                            join "TranTypeM" t
                                on t."id" = h."tranTypeId"
                            join "SalePurchaseDetails" s
                                on d."id" = s."tranDetailsId"
                        where
                            ("cgst" <> 0 or
                            "sgst" <> 0 or
                            "igst" <> 0) and
                            "tranTypeId" in (4,9) and
                            "finYearId" = (table "finYearId") and
							COALESCE((TABLE "branchId"), h."branchId") = h."branchId" and
							("tranDate" between (table "startDate") and (table "endDate"))
                    GROUP BY 
                        "tranType", "accName", "dc", "hsn"
                    order by hsn),
			-- gst-output-sales-hsn-details (considering only table SalePurchaseDetails)
            cte7 as (
                select h."autoRefNo", "tranDate", "tranType", hsn,
				CASE WHEN "tranTypeId" = 4 THEN (s."amount" - "cgst" - "sgst" - "igst") ELSE -(s."amount" - "cgst" - "sgst" - "igst") END as "aggregate",
				CASE WHEN "tranTypeId" = 4 THEN "cgst" ELSE -"cgst" END as "cgst",
                CASE WHEN "tranTypeId" = 4 THEN "sgst" ELSE -"sgst" END as "sgst",
                CASE WHEN "tranTypeId" = 4 THEN "igst" ELSE -"igst" END as "igst",
                CASE WHEN "tranTypeId" = 4 THEN s."amount" ELSE -s."amount" END as "amount",
                "accName", "dc"
                        from "TranH" h
                            join "TranD" d
                                on h."id" = d."tranHeaderId"
                            join "AccM" a
                                on a."id" = d."accId"
                            join "TranTypeM" t
                                on t."id" = h."tranTypeId"
                            join "SalePurchaseDetails" s
                                on d."id" = s."tranDetailsId"
                        where
                            ("cgst" <> 0 or
                            "sgst" <> 0 or
                            "igst" <> 0) and
                            "tranTypeId" in (4,9) and
                            "finYearId" = (table "finYearId") and
							COALESCE((TABLE "branchId"), h."branchId") = h."branchId" and
							("tranDate" between (table "startDate") and (table "endDate"))
                    order by h.id)
            select json_build_object(
                    '01-gst-input-consolidated', (SELECT json_agg(row_to_json(a)) from cte1 a),
                    '02-gst-output-consolidated', (SELECT json_agg(row_to_json(b)) from cte2 b),
                    '03-gst-input-purchases', (SELECT json_agg(row_to_json(d)) from cte4 d),
                    '04-gst-output-sales', (SELECT json_agg(row_to_json(c)) from cte3 c), 
                    '05-gst-input-vouchers', (SELECT json_agg(row_to_json(e)) from cte5 e),
					'06-gst-output-sales-hsn', (SELECT json_agg(row_to_json(f)) from cte6 f),
					'07-gst-output-sales-hsn-details', (SELECT json_agg(row_to_json(f)) from cte7 f)
                ) as "jsonResult"
    """

    get_all_products = """
        with "isActive" as (values(%(isActive)s::boolean))
        --with "isActive" as (values(true::boolean))
        SELECT 
            ROW_NUMBER() OVER (ORDER BY c."catName", b."brandName", p."label") AS "index",
            p."id" AS "id",
            c."id" AS "catId",
            u."id" AS "unitId",
            b."id" AS "brandId",
            c."catName",
            p."hsn",
            b."brandName",
            p."info",
            u."unitName",
            p."label",
            p."jData",
            p."productCode",
            p."gstRate",
            p."upcCode",
            p."maxRetailPrice",
            p."salePrice",
            p."salePriceGst",
            p."dealerPrice",
            p."purPrice",
            p."purPriceGst",
            p."isActive"
        FROM "ProductM" p
        INNER JOIN "CategoryM" c ON c."id" = p."catId"
        INNER JOIN "UnitM" u ON u."id" = p."unitId"
        INNER JOIN "BrandM" b ON b."id" = p."brandId"
		where coalesce((TABLE "isActive"), p."isActive") = p."isActive"
        ORDER BY c."catName", b."brandName", p."label"
    """

    get_all_products_info_for_product_select = """
            --with "branchId" as (values(1)), "finYearId" as (values (2024)),
            with "branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
            cte0 AS (  
                --Base CTE used many times in next  
                SELECT   
                    "productId",   
                    "tranTypeId",   
                    "qty",   
                    "price",   
                    h."tranDate",   
                    '' AS "dc"  
                FROM "TranH" h  
                JOIN "TranD" d ON h."id" = d."tranHeaderId"  
                JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"  
                WHERE   
                    h."branchId" = (TABLE "branchId")   
                    AND h."finYearId" = (TABLE "finYearId")  
                
                UNION ALL  
                
                SELECT   
                    s."productId",   
                    "tranTypeId",   
                    s."qty",   
                    0 AS "price",   
                    h."tranDate",   
                    'D' AS "dc"  
                FROM "TranH" h  
                JOIN "StockJournal" s ON h."id" = s."tranHeaderId"  
                WHERE   
                    h."branchId" = (TABLE "branchId")   
                    AND h."finYearId" = (TABLE "finYearId")  
            ),  
            cte1 AS (   
                -- Opening balance  
                SELECT   
                    p.id,   
                    p."productId",   
                    p."qty",   
                    p."openingPrice",   
                    p."lastPurchaseDate"  
                FROM "ProductOpBal" p   
                WHERE   
                    p."branchId" = (TABLE "branchId")   
                    AND p."finYearId" = (TABLE "finYearId")  
            ),   
            cte2 AS (   
                -- Create columns for sale, saleRet, purchase etc.  
                SELECT   
                    "productId",  
                    "tranTypeId",   
                    SUM(CASE WHEN "tranTypeId" = 4 THEN "qty" ELSE 0 END) AS "sale",  
                    SUM(CASE WHEN "tranTypeId" = 9 THEN "qty" ELSE 0 END) AS "saleRet",  
                    SUM(CASE WHEN "tranTypeId" = 5 THEN "qty" ELSE 0 END) AS "purchase",  
                    SUM(CASE WHEN "tranTypeId" = 10 THEN "qty" ELSE 0 END) AS "purchaseRet",  
                    SUM(CASE WHEN "tranTypeId" = 11 AND "dc" = 'D' THEN "qty" ELSE 0 END) AS "stockJournalDebits",  
                    SUM(CASE WHEN "tranTypeId" = 11 AND "dc" = 'C' THEN "qty" ELSE 0 END) AS "stockJournalCredits",  
                    MAX(CASE WHEN "tranTypeId" = 4 THEN "tranDate" END) AS "lastSaleDate",  
                    MAX(CASE WHEN "tranTypeId" IN (5, 11) THEN "tranDate" END) AS "lastPurchaseDate"  
                FROM cte0  
                GROUP BY "productId", "tranTypeId"  
            ),   
            cte3 AS (   
                -- Sum columns grouped by productId  
                SELECT   
                    "productId",  
                    COALESCE(SUM("sale"), 0) AS "sale",  
                    COALESCE(SUM("purchase"), 0) AS "purchase",  
                    COALESCE(SUM("saleRet"), 0) AS "saleRet",  
                    COALESCE(SUM("purchaseRet"), 0) AS "purchaseRet",  
                    COALESCE(SUM("stockJournalDebits"), 0) AS "stockJournalDebits",  
                    COALESCE(SUM("stockJournalCredits"), 0) AS "stockJournalCredits",  
                    MAX("lastSaleDate") AS "lastSaleDate",  
                    MAX("lastPurchaseDate") AS "lastPurchaseDate"  
                FROM cte2  
                GROUP BY "productId"  
            ),   
            cte4 AS (   
                -- Join opening balance (cte1) with latest result set  
                SELECT   
                    COALESCE(c1."productId", c3."productId") AS "productId",  
                    COALESCE(c1.qty, 0) AS "op",  
                    COALESCE(c3."sale", 0) AS "sale",  
                    COALESCE(c3."purchase", 0) AS "purchase",  
                    COALESCE(c3."saleRet", 0) AS "saleRet",  
                    COALESCE(c3."purchaseRet", 0) AS "purchaseRet",  
                    COALESCE(c3."stockJournalDebits", 0) AS "stockJournalDebits",  
                    COALESCE(c3."stockJournalCredits", 0) AS "stockJournalCredits",  
                    COALESCE(c3."lastPurchaseDate", c1."lastPurchaseDate") AS "lastPurchaseDate",  
                    c1."openingPrice",   
                    c3."lastSaleDate"  
                FROM cte1 c1  
                FULL JOIN cte3 c3 ON c1."productId" = c3."productId"  
            ),   
            cte5 AS (   
                -- Get last purchase price for transacted products  
                SELECT   
                    "productId",   
                    "price" AS "lastPurchasePrice"  
                FROM (  
                    SELECT   
                        "productId",   
                        "price",   
                        ROW_NUMBER() OVER (PARTITION BY "productId" ORDER BY "tranDate" DESC) AS rn  
                    FROM cte0  
                    WHERE "tranTypeId" IN (5, 11)  
                ) AS t  
                WHERE rn = 1  
            ),   
            cte6 AS (  
                -- Combine last purchase price with latest result set  
                SELECT   
                    COALESCE(c4."productId", c5."productId") AS "productId",  
                    CASE 
				        WHEN c5."lastPurchasePrice" IS NULL OR c5."lastPurchasePrice" = 0 
				        THEN c4."openingPrice"
				        ELSE c5."lastPurchasePrice"
				    END AS "lastPurchasePrice",   
                    c4."lastPurchaseDate",  
                    (COALESCE(c4."op", 0) + COALESCE(c4."purchase", 0) - COALESCE(c4."purchaseRet", 0) - COALESCE(c4."sale", 0) + COALESCE(c4."saleRet", 0) + COALESCE(c4."stockJournalDebits", 0) - COALESCE(c4."stockJournalCredits", 0)) AS "clos",  
                    COALESCE(c4."sale", 0) AS "sale",  
                    COALESCE(c4."op", 0) AS "op",  
                    COALESCE(c4."openingPrice", 0) AS "openingPrice"  
                FROM cte4 c4  
                FULL JOIN cte5 c5 ON c4."productId" = c5."productId"  
            ),   
            cte7 AS (   
                -- Combine latest result set with ProductM and related tables  
                SELECT   
                    p."id",  
                    p."productCode",   
                    c."catName",   
                    b."brandName",   
                    p."label",   
                    COALESCE(c6."clos"::numeric(10, 2), 0) AS "clos",   
                    (ROUND(COALESCE(c6."lastPurchasePrice", 0) * (1 + p."gstRate" / 100),2)) AS "lastPurchasePriceGst",  
                    c6."lastPurchaseDate",  
                    (date_part('day',CURRENT_DATE::timestamp - "lastPurchaseDate"::timestamp)) as "age",  
                    p."catId",   
                    p."brandId",   
                    COALESCE(p."hsn", c."hsn") AS hsn,   
                    p."info",   
                    p."unitId",   
                    p."upcCode",   
                    p."gstRate",  
                    p."salePrice",   
                    p."salePriceGst",   
                    p."maxRetailPrice",  
                    COALESCE(c6."lastPurchasePrice", 0) AS "lastPurchasePrice",   
                    c6."sale",   
                    p."saleDiscount",  
                    COALESCE(c6."op", 0) AS "op",  
                    COALESCE(c6."openingPrice", 0) AS "openingPrice",   
                    (ROUND(COALESCE(c6."openingPrice", 0) * (1 + p."gstRate" / 100),2)) AS "openingPriceGst"  
                FROM cte6 c6  
                RIGHT JOIN "ProductM" p ON p."id" = c6."productId"  
                JOIN "CategoryM" c ON c."id" = p."catId"  
                JOIN "BrandM" b ON b."id" = p."brandId"  
                WHERE   
                    p."isActive"  
                ORDER BY   
                    b."brandName",   
                    c."catName",  
                    p."label",   
                    p."info"  
            )
        SELECT   
            "id",   
            "productCode",
            "id" as "productId",
            "catName",   
            "brandName",   
            "label",   
            "clos",   
            "lastPurchasePriceGst",   
            CASE WHEN "clos" > 0 THEN "age" ELSE 0 END AS "age",  
            "hsn",   
            "info",   
            "upcCode",   
            "gstRate",   
            "salePrice",   
            "salePriceGst",   
            "maxRetailPrice",
            ROUND(COALESCE(
                NULLIF("salePriceGst", 0),
                NULLIF(("salePrice"- "saleDiscount") * (1 + "gstRate" / 100.0), 0),
                "maxRetailPrice"
            ),2) AS "calculatedSalePriceGst",
            "sale",   
            "saleDiscount",   
            "lastPurchasePrice",   
            "op",   
            "openingPrice",   
            "openingPriceGst"   
        FROM cte7
    """

    get_all_purchases = """
        --with "branchId" as (values (1)), "finYearId" as (values (2025)),"tranTypeId" as (values(5))
        with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "tranTypeId" as (values(%(tranTypeId)s))
        , cte1 as (
			select "tranHeaderId", string_agg("accName",', ') as "accounts"
				from "TranD" d
					join "TranH" h
						on h."id" = d."tranHeaderId"
					join "AccM" a
						on a."id" = d."accId"
			where dc = CASE (table "tranTypeId") WHEN 5 then 'C' else 'D' END
			and "finYearId" = (table "finYearId") 
			and "branchId" = (table "branchId")
			group by "tranHeaderId"
		)
        select ROW_NUMBER() OVER (ORDER BY "tranDate" DESC, h."id" DESC) AS "index"
		, h."id" as "id", "autoRefNo", "userRefNo", h."remarks", "accounts", d."amount", string_agg("brandName" || ' ' || "label",', ') as "productDetails"
        , string_agg(s."jData"->>'serialNumbers', ', ') as "serialNumbers", string_agg("productCode", ', ') as "productCodes"
        , string_agg(s.hsn::text, ', ') as "hsns", SUM(s."qty") as "productQty"
        , SUM(s."qty" * (s."price" - s."discount")) as "aggr", SUM(s."cgst") as "cgst", SUM(s."sgst") as "sgst", SUM(s."igst") as "igst"
        ,	"tranDate", string_agg(s."jData"->>'remarks', ', ') as "lineRemarks"
            from "TranH" h
                join "TranD" d
                    on h."id" = d."tranHeaderId"
                join "SalePurchaseDetails" s
                    on d."id" = s."tranDetailsId"
                join "ProductM" p
                    on p."id" = s."productId"
                join "BrandM" b
                    on b."id" = p."brandId"
				join cte1 
					on cte1."tranHeaderId" = d."tranHeaderId"
            where "tranTypeId" = (table "tranTypeId") and
                "finYearId" = (table "finYearId") and
                "branchId" = (table "branchId")
            group by h."id", d."amount" , d."remarks", cte1."accounts"
            order by "tranDate" DESC
    """

    get_all_sales = """
        --WITH "branchId" AS (VALUES (1)), "finYearId" AS (VALUES (2024)), "tranTypeId" AS (VALUES (4))    
            WITH "branchId" AS (VALUES (%(branchId)s::int)), "finYearId" AS (VALUES (%(finYearId)s::int)), "tranTypeId" AS (VALUES (%(tranTypeId)s))
            , cte1 AS (  -- cte1 required for accounts other than sale
                SELECT
                    d."tranHeaderId",
                    string_agg(a."accName", ', ') AS "accounts",
                    -- Contacts details joined with '|', skipping NULLs
                    concat_ws(
                        ' | ',
                        c."contactName",
                        c."mobileNumber",
                        c."email",
                        c."address1",
                        c."address2",
                        c."gstin",
                        c."pin"
                    ) AS "contactDetails"
                FROM "TranD" d
                    JOIN "TranH" h ON h."id" = d."tranHeaderId"
                    JOIN "AccM" a ON a."id" = d."accId"
                    JOIN "Contacts" c ON c."id" = h."contactsId"
                WHERE d."dc" = CASE (TABLE "tranTypeId") WHEN 4 THEN 'D' ELSE 'C' END
                AND h."finYearId" = (TABLE "finYearId")
                AND h."branchId"  = (TABLE "branchId")
                GROUP BY d."tranHeaderId", c."contactName", c."mobileNumber",
                        c."email", c."address1", c."address2", c."gstin", c."pin"
            )
            SELECT
                ROW_NUMBER() OVER (ORDER BY h."tranDate" DESC, h."id" DESC) AS "index",
                h."id"          AS "id",
                h."autoRefNo",
                h."userRefNo",
                h."remarks",
                c."accounts",
                c."contactDetails",  -- new pipe-joined contact info
                d."amount",
                string_agg(b."brandName" || ' ' || p."label", ', ') AS "productDetails",
                string_agg(s."jData"->>'serialNumbers', ', ')      AS "serialNumbers",
                string_agg(p."productCode", ', ')                  AS "productCodes",
                string_agg(s.hsn::text, ', ')                      AS "hsns",
                SUM(s."qty")                                       AS "productQty",
                SUM(s."qty" * (s."price" - s."discount"))          AS "aggr",
                SUM(s."cgst")                                      AS "cgst",
                SUM(s."sgst")                                      AS "sgst",
                SUM(s."igst")                                      AS "igst",
                h."tranDate",
                string_agg(s."jData"->>'remarks', ', ')            AS "lineRemarks"
            FROM "TranH" h
                JOIN "TranD" d ON h."id" = d."tranHeaderId"
                JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"
                JOIN "ProductM" p ON p."id" = s."productId"
                JOIN "BrandM"  b ON b."id" = p."brandId"
                JOIN cte1      c ON c."tranHeaderId" = d."tranHeaderId"
            WHERE h."tranTypeId" = (TABLE "tranTypeId")
            AND h."finYearId"  = (TABLE "finYearId")
            AND h."branchId"   = (TABLE "branchId")
            GROUP BY
                h."id",
                d."amount",
                d."remarks",
                c."accounts",
                c."contactDetails"
            ORDER BY h."tranDate" DESC
    """

    get_all_schemas_in_database = """
        SELECT nspname
        FROM pg_namespace
        WHERE nspname NOT LIKE %(pg)s AND nspname <> %(inf)s
        ORDER BY nspname
    """

    get_all_stock_journals = """
        with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "noOfRows" as (values (%(noOfRows)s::int))
        --with "branchId" as (values (1)), "finYearId" as (values (2024)), "noOfRows" as (values (100))
		select h."id" 
		, "tranDate"
		, "autoRefNo"
		, "userRefNo"
		, h."remarks"
        , CASE when "dc"='D' then "qty" else 0 end as "debits"
        , CASE when "dc"='C' then "qty" else 0 end as "credits"
        , "productCode"
		, "brandName"
		, "label"
		, "catName"
		, "info"
		, "catName" || ' ' ||  "brandName" || ' ' || "label" || ' ' || COALESCE("info",'') as "productDetails"
        , "dc"
		, "lineRefNo"
		, "lineRemarks"
        , "qty"
        , "price"
        , ("qty" * "price") as "amount"
		, s."jData"->>'serialNumbers' as "serialNumbers"
            from "TranH" h
                join "StockJournal" s
                    on h."id" = s."tranHeaderId"
				join "ProductM" p
					on p."id" = s."productId"
				join "CategoryM" c
					on c."id" = p."catId"
				join "BrandM" b
					on b."id" = p."brandId"
        where "tranTypeId" = 11 
        and "finYearId" = (table "finYearId")
        and "branchId" = (table "branchId")
        order by "tranDate" DESC, "id" DESC LIMIT (table "noOfRows")
    """

    get_all_transactions = """
        --WITH "noOfRows" AS (VALUES (1000::int)), "tranTypeId" AS (VALUES (null::int)), "dateFormat" AS (VALUES ('dd/MM/yyyy'::text)), "branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)), "startDate" AS (VALUES ('2024-04-01'::date)), "endDate" AS (VALUES ('2025-03-31'::date)),"dateType" AS (VALUES ('entryDate'::text))
        with "noOfRows" as (values (%(noOfRows)s::int)),"tranTypeId" as (values (%(tranTypeId)s::int)), "dateFormat" as (values (%(dateFormat)s::text)), "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "startDate" as (values(%(startDate)s ::date)), "endDate" as (values(%(endDate)s:: date)), "dateType" AS (values (%(dateType)s::text))
            SELECT 
                ROW_NUMBER() OVER (ORDER BY "tranDate" DESC, h."id" DESC, d."id" DESC) AS "index",
                h."id",
                h."tranDate",
                "tranTypeId",
                h."autoRefNo",
                h."userRefNo",
                h."remarks",
                a."accName",
                h."tranTypeId",
                CASE WHEN "dc" = 'D' THEN "amount" ELSE 0.00 END AS "debit",
                CASE WHEN "dc" = 'C' THEN "amount" ELSE 0.00 END AS "credit",
                d."instrNo",
                d."lineRefNo",
                d."remarks" AS "lineRemarks",
                h."tags",
                h."timestamp"
            FROM "TranD" d
            JOIN "TranH" h ON h."id" = d."tranHeaderId"
            JOIN "AccM" a ON a."id" = d."accId"
            WHERE 
                "finYearId" = (TABLE "finYearId") 
                AND "branchId" = (TABLE "branchId")
                AND (
                    CASE 
                        WHEN (TABLE "dateType") = 'transactionDate' THEN h."tranDate" BETWEEN (TABLE "startDate") AND (TABLE "endDate")
                        WHEN (TABLE "dateType") = 'entryDate' THEN h."timestamp" BETWEEN (TABLE "startDate") AND (TABLE "endDate")
                        ELSE FALSE  -- Fallback case
                    END
                )
				AND (
					(TABLE "tranTypeId") IS NULL
					OR h."tranTypeId" = (TABLE "tranTypeId")
				)
            ORDER BY "tranDate" DESC, h."id" DESC, d."id" DESC
            LIMIT (TABLE "noOfRows");
    """

    get_all_transactions_export = """
        --with "tranTypeId" as (values(2::int)), "dateFormat" as (values ('dd/MM/yyyy'::text)), "branchId" as (values(null::int)), "finYearId" as (values(2023)), "startDate" as (values('2023-04-01'::date)), "endDate" as (values('2024-03-31'::date))
			with "tranTypeId" as (values (%(tranTypeId)s::int)), "dateFormat" as (values (%(dateFormat)s::text)), "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "startDate" as (values(%(startDate)s ::date)), "endDate" as (values(%(endDate)s:: date))
            select h."id" as "tranHeaderId", 
                to_char(h."tranDate", (table "dateFormat")) as "tranDate", 
                "autoRefNo", 
                "tags", 
                d."id" as "tranDetailsId",
                h."remarks" as "headerRemarks" , 
                "userRefNo", 
                "accName", 
                "dc", 
                d."remarks" as "lineRemarks",
                "amount", 
                "lineRefNo", 
                "tranTypeId", 
                d."instrNo", 
                "clearDate"
                    from "TranH" h 
                        join "TranD" d
                            on h."id" = d."tranHeaderId"				
                        join "AccM" a
                            on a."id" = d."accId"
                        left outer join "ExtBankReconTranD" b
                            on d."id" = b."tranDetailsId"	
                    where "tranTypeId" = (table "tranTypeId") 
                        and "finYearId" = (table "finYearId") 
                        and COALESCE((table "branchId"), h."branchId") = h."branchId"
                        and h."tranDate" between (table "startDate") and (table "endDate")
                        order by "tranDate" DESC, h."id", d."id" 
    """

    get_all_units = """
        select "id", "unitName" from "UnitM" order by "unitName"
    """

    get_all_vouchers_export = """
        --with "dateFormat" as (values ('dd/MM/yyyy'::text)), "branchId" as (values(null::int)), "finYearId" as (values(2023)), "startDate" as (values('2023-04-01'::date)), "endDate" as (values('2024-03-31'::date))
			with "dateFormat" as (values (%(dateFormat)s::text)), "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "startDate" as (values(%(startDate)s ::date)), "endDate" as (values(%(endDate)s:: date))
            select ROW_NUMBER() over (order by h."id") as "index"
            , h."id", to_char(h."tranDate", (table "dateFormat")) as "tranDate"
            , h."autoRefNo", h."userRefNo", h."finYearId", h."branchId", h."remarks", h."userRefNo"
            , a."accName"
            , CASE WHEN "dc" = 'D' THEN "amount" ELSE 0.00 END as "debit"
            , CASE WHEN "dc" = 'C' THEN "amount" ELSE 0.00 END as "credit"
            , d."instrNo", d."lineRefNo", d."remarks" as "lineRemarks"
			, h."timestamp"::text
            from "TranD" d
                join "TranH" h
                    on h."id" = d."tranHeaderId"
                join "AccM" a
                    on a."id" = d."accId"
            where "finYearId" = (table "finYearId") 
			and COALESCE((table "branchId"), h."branchId") = h."branchId"
            and h."tranDate" between (table "startDate") and (table "endDate")
            order by "id"
    """

    get_all_vouchers = """
        WITH "finYearId" as (values (%(finYearId)s::int)), "branchId" as (values (%(branchId)s::int)), "tranTypeId" as (values (%(tranTypeId)s::int))
	       -- with "finYearId" as (VALUES (2024::int)), "branchId" as (VALUES (1::int)), "tranTypeId" as (VALUES (2::int))
        select ROW_NUMBER() OVER (ORDER BY "tranDate" DESC, h."id" DESC, d."id" DESC) AS "index",
            h."id", "tranDate", "autoRefNo", "tags",
             h."remarks", "userRefNo", "accName", "dc", d."remarks" as "lineRemarks",
             CASE WHEN "dc" = 'D' THEN "amount" ELSE 0.00 END as "debit",
             CASE WHEN "dc" = 'C' THEN "amount" ELSE 0.00 END as "credit",
             "lineRefNo", d."instrNo", "clearDate", "gstin", "rate", "hsn", "cgst", "sgst", "igst", "isInput", "tranTypeId"
            from "TranH" h 
                join "TranD" d
                    on h."id" = d."tranHeaderId"				
                join "AccM" a
                    on a."id" = d."accId"
                left outer join "ExtBankReconTranD" b
					on d."id" = b."tranDetailsId"
				left outer join "ExtGstTranD" e
					on d."id" = e."tranDetailsId"
		where "tranTypeId" = (table "tranTypeId") 
            and "finYearId" = (table "finYearId")
            and "branchId" = (table "branchId")
            order by "tranDate" DESC, h."id" DESC, d."id" DESC
    """

    get_auto_subledger_details = """
        --WITH "branchId" AS (VALUES(1)), "finYearId" AS (VALUES(2025)), "accId" AS (VALUES(160)), "contactsId" AS (VALUES(107))
            WITH "branchId" AS (VALUES(%(branchId)s::int)), "finYearId" AS (VALUES(%(finYearId)s::int)), "accId" AS (VALUES(%(accId)s::int)), "contactsId" AS (VALUES(%(contactsId)s::int)),
        , inserting AS (
            -- insert a starter row only if it does not already exist
            INSERT INTO "AutoSubledgerCounter" ("finYearId", "branchId", "accId", "lastNo")
            SELECT (TABLE "finYearId"), (TABLE "branchId"), (TABLE "accId"), 1
            WHERE NOT EXISTS (
            SELECT 1
            FROM "AutoSubledgerCounter" d
            WHERE d."finYearId" = (TABLE "finYearId")
                AND d."branchId" = (TABLE "branchId")
                AND d."accId" = (TABLE "accId")
            )
            RETURNING id
        )

        SELECT json_build_object(
            'branchCode',
            (SELECT "branchCode" FROM "BranchM" WHERE "id" = (TABLE "branchId")),
            'autoSubledgerDetails',
            (
                SELECT row_to_json(t)
                FROM (
                SELECT d."lastNo", a."accType", a."classId", c."accClass"
                FROM "AutoSubledgerCounter" d
                JOIN "AccM" a ON a."id" = d."accId"
                JOIN "AccClassM" c ON c."id" = a."classId"
                WHERE d."finYearId" = (TABLE "finYearId")
                    AND d."branchId" = (TABLE "branchId")
                    AND d."accId" = (TABLE "accId")
                ) t
            ),
            'contactNameMobile',
            (
                SELECT row_to_json(x)
                FROM (
                SELECT "contactName", "mobileNumber"
                FROM "Contacts"
                WHERE "id" = (TABLE "contactsId")
                ) x
            )
        ) AS "jsonResult"
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

    get_branch_code_tran_code = """
    WITH "branchId" as (values (%(branchId)s::int)), "tranTypeId" as (values (%(tranTypeId)s::int))
     --with "branchId" as (VALUES (1::int)), "tranTypeId" as (VALUES (12::int))
		select 
			(select "branchCode" from "BranchM" where "id" = (table "branchId") ) as "branchCode",
			(select "tranCode" from "TranTypeM" where "id" = (table "tranTypeId")) as "tranCode"
    """

    get_brands_categories_tags = """
        with cte1 as(
			select "id", "brandName"
				from "BrandM"
					order by "brandName"
		), cte2 as (
			select "id", "catName", "parentId", "isLeaf"
				from "CategoryM"
					order by "catName"
		), cte3 as (
			select "id", "tagName"
				from "TagsM"
					order by "tagName"
		) select json_build_object(
			'brands', (select json_agg(a) from cte1 a),
			'categories',(select json_agg(b) from cte2 b),
			'tags',(select json_agg(c) from cte3 c)
		) as "jsonResult"
    """

    get_brands_categories_units = """
        with cte1 as (
            SELECT "id", "brandName"
	 			from "BrandM" order by "brandName"
        ),
        cte2 as (
            select "id", "catName" , (
				select "catName" from "CategoryM"
					where id = c."parentId"
			) as "parent"
                from "CategoryM" c
					where "isLeaf" = true order by "catName"
        ),
		cte22 as (
			select "id", "catName" || ' (' || "parent" || ')' as "catName"
				from cte2
		),
        cte3 as (
            select "id", "unitName" from "UnitM" order by "unitName"
        )
        SELECT
            json_build_object(
                'brands', (SELECT json_agg(a) from cte1 a)
                , 'categories', (SELECT json_agg(b) from cte22 b)
                , 'units',(SELECT json_agg(c) FROM cte3 c)
            ) as "jsonResult"
    """

    get_brands_on_catId = """
        with "catId" as (values(%(catId)s::int))
            --WITH "catId" AS (VALUES (4))
        select DISTINCT on(b.id, b."brandName")
            b.id, 
            b."brandName"
        from "BrandM" b
            join "ProductM" p
                on b.id = p."brandId"
        where p."catId" = (table "catId")
        order by "brandName"
    """

    get_branch_transfer_details_on_tran_header_id = """
    --with "id" as (values(10843))
        with "id" as (values(%(id)s::int))
        , cte1 as (
                select "id", "tranDate", "userRefNo", "remarks", "autoRefNo", "tranTypeId"
                    from "TranH"
                        where "id" = (table "id")
            )
        , cte2 as (
                select  t."id"
            , "tranHeaderId"
            , "productId"
            , "productCode"
            , "brandName"
            , "label"
            , "catName"
            , "info"
            , "qty"
            , "lineRemarks"
            , "lineRefNo"
            , t."jData"->>'serialNumbers' as "serialNumbers"
            , "price"
            , "destBranchId"
            , "upcCode"
            , "brandName" || ' ' || "catName" || ' ' || "label" || ' ' || COALESCE("info",'') as "productDetails"
		from cte1 c1
			join "BranchTransfer" t
				on c1."id" = t."tranHeaderId"
			join "ProductM" p
					on p."id" = t."productId"
			join "CategoryM" c
				on c."id" = p."catId"
			join "BrandM" b
				on b."id" = p."brandId"
			order by t."id"
            )
            select json_build_object(
                'tranH', (SELECT row_to_json(a) from cte1 a),
                'branchTransfers', (SELECT json_agg(b) from cte2 b)
            ) as "jsonResult"
    """

    get_contact_for_email = """
        select * from "Contacts"
	        where "email" = %(email)s limit 1
    """

    get_contact_for_mobile = """
        select * from "Contacts"
	        where "mobileNumber" = %(mobileNumber)s limit 1
    """

    get_contacts_on_regexp = """
        --with "searchString" as (values('9876'))
        with "searchString" as (VALUES (%(searchString)s::text))
        select * from "Contacts"
            where concat("mobileNumber", "otherMobileNumber", "email", "contactName"
                , "landPhone", "descr", "address1", "address2", "pin", "gstin") ~* (table "searchString")
        order by "contactName"
		    limit 100
    """

    get_current_orders = """
        WITH "branchId" AS (VALUES (%(branchId)s::int)), "finYearId" AS (VALUES (%(finYearId)s::int)), "noOfRows"  AS (VALUES (%(noOfRows)s::int)),
        --with "branchId" as (values(1)), "finYearId" as (values (2024)), "noOfRows" as (values (100)),
        -- Get current stock status
            "cteStock" AS (
                SELECT * 
                FROM get_stock_on_date((TABLE "branchId"), (TABLE "finYearId"), CURRENT_DATE)
            ),

        -- Fetch recent sales transactions for last 4 months
            cte1 AS (
                SELECT 
                    s."productId", 
                    SUM(s."qty") AS "qty", 
                    (CURRENT_DATE - h."tranDate"::DATE) AS "daysOld"
                FROM "TranH" h
                JOIN "TranD" d ON h."id" = d."tranHeaderId"
                JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"
                WHERE 
                    h."tranTypeId" = 4 
                    AND h."tranDate" >= (CURRENT_DATE - INTERVAL '4 months')
                    AND (COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
                GROUP BY s."productId", h."tranDate"
            ),

        -- Categorize sales by ageing and apply weighted priority
            cte2 AS (
                SELECT 
                    cte1.*,
                    CASE
                        WHEN "daysOld" BETWEEN 0 AND 30 THEN 'days0_30'
                        WHEN "daysOld" BETWEEN 31 AND 60 THEN 'days31_60'
                        WHEN "daysOld" BETWEEN 61 AND 90 THEN 'days61_90'
                        ELSE 'days90+'
                    END AS "daysLabel",
                    CASE
                        WHEN "daysOld" BETWEEN 0 AND 30 THEN 1.5 / 4
                        WHEN "daysOld" BETWEEN 31 AND 60 THEN 1.25 / 4
                        WHEN "daysOld" BETWEEN 61 AND 90 THEN 0.75 / 4
                        ELSE 0.5 / 4
                    END AS "weight"
                FROM cte1
            ),

        -- Sum weighted quantities per product per age group
            cte3 AS (
                SELECT 
                    "productId", 
                    SUM("qty") AS "qty", 
                    "daysLabel", 
                    "weight"
                FROM cte2
                GROUP BY "productId", "daysLabel", "weight"
            ),

        -- Compute final suggested order quantity using weight
            cte4 AS (
                SELECT 
                    "productId", 
                    SUM("qty" * "weight") AS "qty", 
                    TRUNC(SUM("qty" * "weight"), 0) AS "order"
                FROM cte3
                GROUP BY "productId"
            ),

        -- Enrich product info and compute difference from current stock
            cte5 AS (
                SELECT 
                    c4."productId",
                    p."productCode",
                    c4."qty",
                    COALESCE(s."clos"::INT, 0) AS "clos",
                    b."brandName",
                    c."catName",
                    p."label",
                    (c4."order" - COALESCE(s."clos", 0)::INT) AS "finalOrder",
                    p."info",
                    "price"
                FROM cte4 c4
                LEFT JOIN "cteStock" s ON c4."productId" = s."productId"
                JOIN "ProductM" p ON p."id" = c4."productId"
                JOIN "BrandM" b ON b."id" = p."brandId"
                JOIN "CategoryM" c ON c."id" = p."catId"
            ),

        -- Build final dataset with extra labels, urgency flag, and value
            cte6 AS (
                SELECT 
                    "productId",
                    "productCode",
                    "brandName", 
                    "catName", 
                    "label",
                    "catName" || ' ' || "brandName" || ' ' || "label" AS "productDetails",
                    "info", 
                    "clos", 
                    "finalOrder", 
                    "price" * "finalOrder" AS "orderValue", 
                    CASE 
                        WHEN "clos" = 0 THEN TRUE 
                        ELSE FALSE 
                    END AS "isUrgent"
                FROM cte5
                WHERE "finalOrder" > 0 AND "clos" >= 0
            )

        -- Final output with limit
        SELECT *
        FROM cte6
        ORDER BY "brandName", "catName", "label"
        LIMIT (TABLE "noOfRows")
    """

    get_debit_credit_note_details_on_id = """
        --with "id" as (values (10961)),
        with "id" as (values (%(id)s::int)),
        cte1 as (
			select 
				h."id", 
				h."tranDate", 
				h."userRefNo", 
				h."remarks", 
				h."autoRefNo", 
				h."tranTypeId"
			from "TranH" h
				where "id" = (table id)
            ),
		cte2 as (
			select 
				d."id", 
				d."accId", 
				d."dc", 
				d."amount", 
				d."remarks",
                d."lineRefNo"
				from "cte1" c1 join "TranD" d 
					on c1."id" = d."tranHeaderId"
		),
		cte3 as (
			select 
				x."id", 
				x."gstin", 
				x."cgst", 
				x."sgst", 
				x."igst",
				x."hsn",
                x."rate"
				from "cte2" c2 join "ExtGstTranD" x
					on c2."id" = x."tranDetailsId"
				where not(("cgst" = 0) AND ("sgst" = 0) AND ("igst" = 0))
				LIMIT 1
		),
		cte4 as (
			select e.*,
				a."accName"
				from "AccM" a join "ExtBusinessContactsAccM" e
                	on a."id" = e."accId"
                    	join cte2 c2
                        	on a."id" = c2."accId" limit 1
		)
		select json_build_object(
			'tranH', (SELECT row_to_json(a) from cte1 a),
			'tranD', (SELECT json_agg(b) from cte2 b),
			'businessContacts',(SELECT row_to_json(c) from cte4 c),
			'extGstTranD', (SELECT row_to_json(d) from cte3 d)
		) as "jsonResult"
    """

    get_extBusinessContactsAccM = """
        select * 
            from "ExtBusinessContactsAccM"
                where "accId" = %(accId)s
    """

    get_fin_years = """
        select "id", "startDate", "endDate"
                from "FinYearM" order by "id" DESC
    """

    get_gstin = """
        WITH "accId" AS (VALUES (%(accId)s::int))
            --with "accId" as (values (108))
            select "gstin"
                from "AccM" a
                    join "ExtBusinessContactsAccM" b
                        on a."id" = b."accId"
                where a."id" = (table "accId")
    """

    get_last_no = """
    WITH "finYearId" as (values (%(finYearId)s::int)), "branchId" as (values (%(branchId)s::int)), "tranTypeId" as (values (%(tranTypeId)s::int)),
     --with "finYearId" as (VALUES (2024::int)), "branchId" as (VALUES (1::int)), "tranTypeId" as (VALUES (12::int)),
        inserted AS (
            INSERT INTO "TranCounter" ("finYearId", "branchId", "tranTypeId", "lastNo")
            SELECT (table "finYearId"), (table "branchId"), (table "tranTypeId"), 0
            WHERE NOT EXISTS (
                SELECT 1 FROM "TranCounter" 
                WHERE "finYearId" = (table "finYearId") 
                AND "branchId" = (table "branchId") 
                AND "tranTypeId" = (table "tranTypeId")
            )
            RETURNING "lastNo"
        )
        SELECT "lastNo" FROM inserted
        UNION ALL
        SELECT "lastNo" 
        FROM "TranCounter"
        WHERE "finYearId" = (table "finYearId") 
        AND "branchId" = (table "branchId")
        AND "tranTypeId" = (table "tranTypeId")
    """

    get_ledger_leaf_accounts = """
        select id, "accName", "accLeaf"
            from "AccM"
                where "accLeaf" in ('L','Y')
            order by "accName"
    """

    get_ledger_leaf_subledger_accounts = """
        WITH RECURSIVE acc_tree AS (
        SELECT 
            id,
            "accCode",
            "accName",
            "accType",
            "parentId",
            "accLeaf",
            CASE 
            WHEN "accLeaf" = 'Y' THEN true
            WHEN "accLeaf" = 'N' THEN false
            WHEN "accLeaf" = 'L' THEN false
            WHEN "accLeaf" = 'S' THEN true
            END as "isLeaf",
            id AS leaf_ancestor
        FROM "AccM"
        WHERE "accLeaf" IN ('Y', 'S')  -- leaf nodes only

        UNION ALL

        SELECT 
            a.id,
            a."accCode",
            a."accName",
            a."accType",
            a."parentId",
            a."accLeaf",
            CASE 
            WHEN a."accLeaf" = 'Y' THEN true
            WHEN a."accLeaf" = 'N' THEN false
            WHEN a."accLeaf" = 'L' THEN false
            WHEN a."accLeaf" = 'S' THEN true
            END,
            acc_tree.leaf_ancestor
        FROM "AccM" a
        JOIN acc_tree ON a.id = acc_tree."parentId"
        )
        SELECT DISTINCT
        id,
        "accCode",
        "accName",
        "accType",
        "parentId",
        "accLeaf",
        "isLeaf"
        FROM acc_tree
        ORDER BY "accName";
    """

    get_leaf_categories = """
        select id, "catName","descr", "hsn"
            from "CategoryM"
        where "isLeaf" = true
            order by "catName"
    """

    get_leaf_categories_with_parent = """
        select distinct
            c."id", "catName" || ' (' || (
                select "catName" from "CategoryM"
                    where id = c."parentId"
                ) || ')' as "catName"
                from "CategoryM" c
                join "ProductM"p
                    on c.id = p."catId"	
                where "isLeaf" 
                order by "catName"
    """

    get_leaf_accounts_on_class_without_auto_subledgers = """
        with "accClassNames" as (values (%(accClassNames)s::text)),
				--WITH "accClassNames" AS (VALUES ('debtor,creditor'::text)),
				
				-- 1️⃣  All ledgers that are marked auto-subledger
				auto_ledgers AS (
				    SELECT x."accId"
				    FROM "ExtMiscAccM" x
				    WHERE x."isAutoSubledger" = TRUE
				),
				
				-- 2️⃣  Main query excluding both those ledgers and their children
				cte1 AS (
				    SELECT
				        a.id,
				        a."accName",
				        a."parentId",
				        a."accLeaf",
				        c."accClass",
				        x."isAutoSubledger"
				    FROM "AccM" a
				    JOIN "AccClassM" c ON c.id = a."classId"
				    LEFT JOIN "ExtMiscAccM" x ON a.id = x."accId"
				    WHERE a."accLeaf" IN ('Y','S','L')
				      AND (
				            (TABLE "accClassNames") IS NULL
				         OR c."accClass" = ANY(string_to_array((TABLE "accClassNames"), ','))
				      )
				      -- 🚫 Exclude rows that are auto-subledgers or whose parent is one
				      AND a.id       NOT IN (SELECT "accId" FROM auto_ledgers)
				      AND a."parentId" NOT IN (SELECT "accId" FROM auto_ledgers)
				)
				SELECT 
					c.id,
					c."accName",
					c."parentId",
					c."accLeaf",
					c."accClass",
					a."accName" as "accParent"
				FROM cte1 c
					join "AccM" a on a.id = c."parentId"
				where c."accLeaf" in ('Y','S')
				ORDER BY c."accName";
    """

    get_auto_subledger_accounts_with_ledgers_and_subledgers = """
        with "accClassNames" as (values (%(accClassNames)s::text))
			--WITH "accClassNames" AS (VALUES ('debtor'::text))
			, cte1 AS (
			    SELECT
			        a.id,
			        a."accName",
			        a."parentId",
			        a."accLeaf"
			    FROM "AccM" a
			    JOIN "AccClassM" c ON c.id = a."classId"
			    JOIN "ExtMiscAccM" x ON a.id = x."accId"
			    WHERE a."accLeaf" = 'L'               -- ledgers having subledger
			      AND x."isAutoSubledger"
			      AND (
			            (table "accClassNames") IS NULL
			         OR c."accClass" = ANY(string_to_array((table "accClassNames"), ','))
			      )
			),
			ordered AS (
			    SELECT
			        m.id,
			        m."accName",
			        c."accName" AS "accParent",
			        m."accLeaf",
			        m."parentId",
			        c.id AS root_id,
			        1 AS child_rank
			    FROM cte1 c
			    JOIN "AccM" m ON c.id = m."parentId"
			
			    UNION ALL
			
			    SELECT
			        c.id,
			        c."accName",
			        a."accName" AS "accParent",
			        c."accLeaf",
			        c."parentId",
			        c.id AS root_id,
			        0 AS child_rank
			    FROM cte1 c
			    JOIN "AccM" a ON a.id = c."parentId"
			)
			SELECT
			    id,
			    "accName",
			    "accParent",
			    "accLeaf",
			    "parentId",
			    CASE WHEN "accLeaf" = 'L' THEN TRUE ELSE FALSE END AS "isDisabled"
			FROM ordered
			ORDER BY
			    root_id,        -- group by parent ledger
			    child_rank,     -- parent first
			    "accName";
    """

    get_auto_subledger_accounts_on_class = """
        with "accClassNames" as (values (%(accClassNames)s::text))
        --with "accClassNames" as  (values ('sale,purchase,debtor,cash'::text))
        , cte1 as (
            SELECT 
                a.id,
                "accName",
                "parentId"
            FROM "AccM" a
                join "AccClassM" c on c."id" = a."classId"
				join "ExtMiscAccM" x on a."id" = x."accId"
            WHERE "accLeaf" IN ('L')
				AND x."isAutoSubledger"
                AND (
				((table "accClassNames") is null) OR
				("accClass" = ANY(string_to_array((table "accClassNames"),',')))
				)
        )
        select c."id",
				c."accName",
				a."accName" as "accParent",
				false as "isDisabled"
            FROM cte1 c 
                join "AccM" a on a.id = c."parentId"
            ORDER by c."accName"

    """

    get_leaf_subledger_accounts_on_class = """
        with "accClassNames" as (values (%(accClassNames)s::text)),
            --WITH "accClassNames" AS (VALUES ('sale,purchase,debtor,cash'::text)),
            cte1 AS (
                SELECT
                    a.id,
                    a."accName",
                    a."parentId",
                    CASE WHEN a."accLeaf" = 'Y' or a."accLeaf" = 'L' THEN false
                        WHEN a."accLeaf" = 'S' THEN true
                    END AS "isSubledger",
                    a."accLeaf",
                    Case when a."accLeaf" = 'L' then true else false end as "isDisabled"
                FROM "AccM" a
                JOIN "AccClassM" c ON c.id = a."classId"
                WHERE a."accLeaf" IN ('S','L','Y')
                AND (
                    (TABLE "accClassNames") IS NULL
                    OR c."accClass" = ANY(string_to_array((TABLE "accClassNames"), ','))
                )
            )
            SELECT c.id,
                c."accName",
                c."isSubledger",
                c."accLeaf",
                p."accName" as "accParent",
                c."isDisabled"
            FROM cte1 c
                join "AccM" p on p.id = c."parentId"
                
            ORDER BY
                -- group rows by the immediate parent’s id
                CASE WHEN c."accLeaf" = 'L' THEN c.id ELSE c."parentId" END,
                -- within each group, put the parent row first
                CASE WHEN c."accLeaf" = 'L' THEN 0 ELSE 1 END,
                -- finally, order children by name (or id if you prefer strict sequence)
                c."accName"
    """

    get_product_categories = """
       WITH RECURSIVE cte AS (
            SELECT 
                c."id", c."catName", c."descr", c."parentId", c."isLeaf", t."tagName", c."tagId",
                ARRAY(
                    SELECT id FROM "CategoryM" m WHERE c."id" = m."parentId"
                ) AS "children",
                c."id"::TEXT AS "path",
                EXISTS (
                    SELECT 1 FROM "ProductM" p WHERE p."catId" = c."id"
                ) AS "isUsed"
            FROM "CategoryM" c
            LEFT JOIN "TagsM" t ON t.id = c."tagId"
            WHERE "parentId" IS NULL  
            UNION ALL
            SELECT 
                c."id", c."catName", c."descr", c."parentId", c."isLeaf", t."tagName", c."tagId",
                ARRAY(
                    SELECT id FROM "CategoryM" m WHERE c."id" = m."parentId"
                ) AS "children",
                cte."path" || ',' || c."id"::TEXT AS "path",
                EXISTS (
                    SELECT 1 FROM "ProductM" p WHERE p."catId" = c."id"
                ) AS "isUsed"
            FROM "CategoryM" c 
            LEFT JOIN "TagsM" t ON t.id = c."tagId"
            JOIN cte ON cte."id" = c."parentId"
        ), 
        cte1 AS (
            SELECT * FROM cte ORDER BY "catName"
        )
        SELECT json_build_object(
            'productCategories', (SELECT json_agg(a) FROM cte1 a)
        ) AS "jsonResult"
    """

    get_product_on_id = """
        with "id" as (values(%(id)s::int))
            --WITH "id" AS (VALUES (232))
            SELECT 
                    p.id,
                    c."id" AS "catId",
                    u."id" AS "unitId",
                    b."id" AS "brandId",
                    p."hsn",
                    p."info",
                    p."label",
                    p."gstRate",
                    p."upcCode",
                    p."maxRetailPrice",
                    p."salePrice",
                    p."salePriceGst",
                    p."dealerPrice",
                    p."purPrice",
                    p."purPriceGst",
                    p."isActive"
                FROM "ProductM" p
                INNER JOIN "CategoryM" c ON c."id" = p."catId"
                INNER JOIN "UnitM" u ON u."id" = p."unitId"
                INNER JOIN "BrandM" b ON b."id" = p."brandId"
                where p."id" = (table "id")
    """

    get_product_labels_on_catId_brandId = """
        with "catId" as (values(%(catId)s::int)), "brandId" as (values(%(brandId)s::int))
		--WITH "catId" AS (VALUES (49)), "brandId" AS (VALUES (9))
            select DISTINCT on(p.id, p."label")
                p.id, 
                p."label"
            from "ProductM" p
            where p."catId" = (table "catId")
                and p."brandId" = (table "brandId")
            order by "label"
    """

    get_product_on_product_code_upc = """
        --WITH "productCodeOrUpc" AS (VALUES('1161')), "branchId" AS (VALUES(1)), "finYearId" AS (VALUES(2025)),
            WITH "productCodeOrUpc" AS (VALUES(%(productCodeOrUpc)s)), "branchId" AS (VALUES(%(branchId)s::int)), "finYearId" AS (VALUES(%(finYearId)s::int)),

            -- Get all stock movements for the specific product
            stock_movements AS (
                SELECT s."productId",
                    h."tranTypeId",
                    s."qty",
                    s."price",
                    h."tranDate"
                FROM "TranH" h
                JOIN "TranD" d ON h."id" = d."tranHeaderId"
                JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"
                JOIN "ProductM" p ON p."id" = s."productId"
                WHERE h."branchId" = (TABLE "branchId")
                AND h."finYearId" = (TABLE "finYearId")
                AND (p."productCode" = (TABLE "productCodeOrUpc") OR p."upcCode" = (TABLE "productCodeOrUpc"))
                
                UNION ALL
                
                SELECT sj."productId",
                    h."tranTypeId",
                    sj."qty",
                    0 AS "price",
                    h."tranDate"
                FROM "TranH" h
                JOIN "StockJournal" sj ON h."id" = sj."tranHeaderId"
                JOIN "ProductM" p ON p."id" = sj."productId"
                WHERE h."branchId" = (TABLE "branchId")
                AND h."finYearId" = (TABLE "finYearId")
                AND (p."productCode" = (TABLE "productCodeOrUpc") OR p."upcCode" = (TABLE "productCodeOrUpc"))
            ),

            -- Get last purchase details for each product
            last_purchase AS (
                SELECT 
                    sm."productId",
                    sm."price" AS "lastPurchasePrice",
                    sm."tranDate" AS "lastPurchaseDate",
                    ROW_NUMBER() OVER (PARTITION BY sm."productId" ORDER BY sm."tranDate" DESC, sm."price" DESC) as rn
                FROM stock_movements sm
                WHERE sm."tranTypeId" IN (5, 11) -- Purchase and stock journal entries
                AND sm."price" > 0
            ),

            -- Calculate stock summary
            stock_calc AS (
                SELECT 
                    COALESCE(sm."productId", ob."productId") AS "productId",
                    -- Stock calculation: opening + purchase - purchaseRet - sale + saleRet + stockJournalDebits - stockJournalCredits
                    COALESCE(ob."qty", 0) +
                    COALESCE(SUM(CASE WHEN sm."tranTypeId" = 5 THEN sm."qty" ELSE 0 END), 0) -
                    COALESCE(SUM(CASE WHEN sm."tranTypeId" = 10 THEN sm."qty" ELSE 0 END), 0) -
                    COALESCE(SUM(CASE WHEN sm."tranTypeId" = 4 THEN sm."qty" ELSE 0 END), 0) +
                    COALESCE(SUM(CASE WHEN sm."tranTypeId" = 9 THEN sm."qty" ELSE 0 END), 0) +
                    COALESCE(SUM(CASE WHEN sm."tranTypeId" = 11 THEN sm."qty" ELSE 0 END), 0) -
                    COALESCE(SUM(CASE WHEN sm."tranTypeId" = 12 THEN sm."qty" ELSE 0 END), 0) AS "clos"
                FROM stock_movements sm
                FULL OUTER JOIN "ProductOpBal" ob ON ob."productId" = sm."productId" 
                                                AND ob."branchId" = (TABLE "branchId")
                                                AND ob."finYearId" = (TABLE "finYearId")
                JOIN "ProductM" p ON p."id" = COALESCE(sm."productId", ob."productId")
                WHERE (p."productCode" = (TABLE "productCodeOrUpc") OR p."upcCode" = (TABLE "productCodeOrUpc"))
                GROUP BY COALESCE(sm."productId", ob."productId"), ob."qty"
            ),

            -- Get last purchase date for all movements (not just with price)
            last_movement AS (
                SELECT 
                    sm."productId",
                    sm."tranDate" AS "lastMovementDate",
                    ROW_NUMBER() OVER (PARTITION BY sm."productId" ORDER BY sm."tranDate" DESC) as rn
                FROM stock_movements sm
                WHERE sm."tranTypeId" IN (5, 11) -- Purchase and stock journal entries
            )

            SELECT 
                p."id" AS "productId",
                COALESCE(lp."lastPurchasePrice", ob."openingPrice", p."purPrice", 0) AS "lastPurchasePrice",
                c."catName",
                b."brandName",
                COALESCE(p."hsn", c."hsn", 0) AS hsn,
                p."info",
                p."label",
                p."productCode",
                p."upcCode",
                COALESCE(p."gstRate", 0) AS "gstRate",
                ROUND(COALESCE(
                    NULLIF(p."salePriceGst", 0),
                    NULLIF((p."salePrice" - p."saleDiscount") * (1 + p."gstRate" / 100.0), 0),
                    p."maxRetailPrice"
                ), 2) AS "calculatedSalePriceGst",
                COALESCE(sc."clos", ob."qty", 0) AS "clos",
                CASE 
                    WHEN lp."lastPurchaseDate" IS NOT NULL THEN 
                        (CURRENT_DATE - lp."lastPurchaseDate"::date)::integer
                    WHEN lm."lastMovementDate" IS NOT NULL THEN 
                        (CURRENT_DATE - lm."lastMovementDate"::date)::integer
                    WHEN ob."lastPurchaseDate" IS NOT NULL THEN 
                        (CURRENT_DATE - ob."lastPurchaseDate"::date)::integer
                    ELSE 0 
                END AS "age"
            FROM "ProductM" p
            LEFT JOIN stock_calc sc ON p."id" = sc."productId"
            LEFT JOIN last_purchase lp ON p."id" = lp."productId" AND lp.rn = 1
            LEFT JOIN last_movement lm ON p."id" = lm."productId" AND lm.rn = 1
            LEFT JOIN "ProductOpBal" ob ON ob."productId" = p."id" 
                                        AND ob."branchId" = (TABLE "branchId")
                                        AND ob."finYearId" = (TABLE "finYearId")
            LEFT JOIN "CategoryM" c ON c."id" = p."catId"
            LEFT JOIN "BrandM" b ON b."id" = p."brandId"
            WHERE (p."productCode" = (TABLE "productCodeOrUpc") OR p."upcCode" = (TABLE "productCodeOrUpc"))
            AND p."isActive" = true
            LIMIT 1;
    """

    get_products_for_purchase = """
        WITH last_purchase AS (
            SELECT DISTINCT ON (s."productId")
                s."productId",
                s."price",
                s."discount",
                s."hsn",
                s."gstRate"
            FROM "SalePurchaseDetails" s
            JOIN "TranD" d ON d."id" = s."tranDetailsId"
            JOIN "TranH" h ON h."id" = d."tranHeaderId"
            WHERE h."tranDate" <= CURRENT_DATE
            ORDER BY s."productId", h."tranDate" DESC, s."id" DESC
        ),
        opening as (
            SELECT DISTINCT ON (o."productId")
            o."productId",
            o."openingPrice"
            from "ProductOpBal" o
            ORDER BY o."productId", o."finYearId" DESC
        )
        SELECT 
            p."id" AS "productId",
            COALESCE(lp."price" - lp."discount", o."openingPrice", p."purPrice", 0) AS "lastPurchasePrice",
            c."catName",
            b."brandName",
            COALESCE(lp."hsn", p."hsn", c."hsn", 0) AS hsn,
            p."info",
            p."label",
            p."productCode",
            p."upcCode",
            COALESCE(lp."gstRate", p."gstRate", 0) AS "gstRate"
        FROM "ProductM" p
        LEFT JOIN last_purchase lp ON lp."productId" = p."id"
        LEFT JOIN "opening" o ON p."id" = o."productId"
        LEFT JOIN "CategoryM" c ON c."id" = p."catId"
        LEFT JOIN "BrandM" b ON b."id" = p."brandId"
        WHERE p."isActive"
        order by p."id"
    """

    get_products_opening_balances = """
        with 
            "branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
            --"branchId" as (values(1)), "finYearId" as (values (2024)),
            cte1 as (
                    select a."id", 
                    ROW_NUMBER() OVER (ORDER BY c."catName", b."brandName", p."label") AS "index",
                    "catName", 
                    "catId", 
                    "brandName", 
                    "brandId", 
                    "productId",
                    "label", 
                    "info", 
                    "qty", 
                    "openingPrice", 
                    "lastPurchaseDate", 
                    "productCode",
                    p."isActive"
                        from "ProductOpBal" a
                            join "ProductM" p
                                on p."id" = a."productId"
                            join "CategoryM" c
                                on c."id" = p."catId"
                            join "BrandM" b
                                on b."id" = p."brandId"
                        where "finYearId" = (table "finYearId") 
                            and "branchId" = (table "branchId")
                        order by a."id" DESC),
            cte2 as (
                select SUM("qty" * "openingPrice") as value
                    from "ProductOpBal"
                where "finYearId" = (table "finYearId") 
                    and "branchId" = (table "branchId"))
                select json_build_object(
                    'openingBalances',(SELECT json_agg(a) from cte1 a)
                    , 'value', (SELECT value from cte2)
                ) as "jsonResult"
    """

    get_purchase_price_variation = """
        --with "branchId" as (values (null::int)), "finYearId" as (values (2024)), "brandId" as (values (null::int)), "catId" as (values (null::int)),"tagId" as (values (null::int)),
        with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "brandId" as (values (%(brandId)s::int)), "catId" as (values (%(catId)s::int)),"tagId" as (values (%(tagId)s::int)),
        selected_products AS (
                SELECT *
                FROM get_products_on_brand_category_tag(
                (TABLE "brandId"),
                (TABLE "catId"),
                (TABLE "tagId")
            )
        ),

        recent_transactions as (
            select distinct on("productId", "price", "accId") "productId", 
                "tranDate", 
                ("price" - "discount") price, 
                "qty", 
                h."id" as "tranHeaderId"
                from "TranH" h
                    join "TranD" d
                        on h."id" = d."tranHeaderId"
                    join "SalePurchaseDetails" s
                        on d."id" = s."tranDetailsId"
                where COALESCE((table "branchId"), "branchId") = "branchId" 
                    and "finYearId" = (table "finYearId")
                    and "tranTypeId" = 5
                order by "productId","price", "accId", "tranDate"),
                
        customer_info as (
            select h."id" as "tranHeaderId", 
                "accName", 
                "contactName", 
                "mobileNumber", 
                "email"
            from "TranH" h
                join "TranD" d
                    on h."id" = d."tranHeaderId"
                join "AccM" a
                    on a."id" = d."accId"
                join "ExtBusinessContactsAccM" e
                    on a."id" = e."accId"
            where "tranTypeId" = 5),
            
        multi_transactions as (
            select "productId", COUNT("productId") as "productCount"
                from recent_transactions
            GROUP BY "productId"
            HAVING (COUNT("productId") > 1)),
            
        enriched_data AS (
            select p."productCode",
                b."brandName", 
                c."catName", 
                p."label",
                p."info",
                t."tranDate", 
                t."price", 
                t."qty", 
                i."accName", 
                i."contactName", 
                i."mobileNumber", 
                i."email"
            from recent_transactions t
            JOIN multi_transactions m ON t."productId" = m."productId"
            JOIN customer_info i ON t."tranHeaderId" = i."tranHeaderId"
            JOIN selected_products p ON p."id" = t."productId"
            JOIN "CategoryM" c ON c."id" = p."catId"
            JOIN "BrandM" b ON b."id" = p."brandId")
            
        select * from enriched_data 
        order by "brandName","catName","label", "productCode", "tranDate"
    """

    get_purchase_report = """
        --WITH "branchId" AS (VALUES (null::int)), "finYearId" AS (VALUES (2024)), "startDate" AS (VALUES ('2024-04-01'::date)), "endDate"   AS (VALUES ('2025-03-31'::date))
         WITH "branchId" AS (VALUES (%(branchId)s::int)), "finYearId" AS (VALUES (%(finYearId)s::int)), "startDate" AS (VALUES (%(startDate)s::date)), "endDate" AS (VALUES (%(endDate)s::date))
        SELECT 
            "autoRefNo",
            "userRefNo",
            "tranDate",
            s."productId",
            "productCode",
            --"catName" || ' ' || "brandName" || ' ' || "label" || ' ' || COLASCE("info",'') as "product",
            "catName",
            "brandName",
            "label",
            "info",
            "tranTypeId",
            "price",
            "discount",
            s."gstRate",
            s."id" AS "salePurchaseDetailsId",

            CASE 
                WHEN "tranTypeId" = 5 THEN 'Purchase' 
                ELSE 'Return' 
            END AS "purchaseType",

            CASE 
                WHEN "tranTypeId" = 5 THEN "qty" * ("price" - "discount") 
                ELSE -"qty" * ("price" - "discount") 
            END AS "aggrPurchase",

            CASE 
                WHEN "tranTypeId" = 5 THEN "qty" 
                ELSE -"qty" 
            END AS "qty",

            CASE 
                WHEN "tranTypeId" = 5 THEN "cgst" 
                ELSE -"cgst" 
            END AS "cgst",

            CASE 
                WHEN "tranTypeId" = 5 THEN "sgst" 
                ELSE -"sgst" 
            END AS "sgst",

            CASE 
                WHEN "tranTypeId" = 5 THEN "igst" 
                ELSE -"igst" 
            END AS "igst",

            CASE 
                WHEN "tranTypeId" = 5 THEN s."amount" 
                ELSE -s."amount" 
            END AS "amount",

            (
                SELECT DISTINCT "accName"
                FROM "AccM" a
                JOIN "AccClassM" m ON m."id" = a."classId"
                JOIN "TranD" t ON a."id" = t."accId"
                WHERE t."tranHeaderId" = h."id"
                AND "accClass" IN ('creditor', 'debtor', 'cash', 'bank', 'card', 'ecash')
            ) AS "party"

        FROM "TranH" h
        JOIN "TranD" d ON h."id" = d."tranHeaderId"
        JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"
        JOIN "ProductM" p ON p."id" = s."productId"
        JOIN "CategoryM" c ON c."id" = p."catId"
        JOIN "BrandM" b ON b."id" = p."brandId"

        WHERE 
            COALESCE((TABLE "branchId"), "branchId") =  "branchId"
            AND "finYearId" = (TABLE "finYearId")
            AND "tranDate" BETWEEN (TABLE "startDate") AND (TABLE "endDate")
            AND "tranTypeId" IN (5, 10)

        ORDER BY 
            "tranDate",
            "salePurchaseDetailsId"
    """

    get_sale_purchase_details_on_id = """
        --WITH "id" AS (VALUES (10835)), ----10825
		with "id" as (values (%(id)s::int)),
		cte1 AS (
		    SELECT
		        "id",
		        "tranDate",
		        "userRefNo",
		        "remarks",
		        "autoRefNo",
		        "jData",
		        "tranTypeId"
		    FROM "TranH"
		    WHERE "id" = (TABLE id)
		),
		cte5 AS (
		    SELECT
		        c.*
		    FROM "Contacts" c
		    JOIN "TranH" h ON c."id" = h."contactsId"
		    WHERE h."id" = (TABLE id)
		),
		cte2 AS (
		    SELECT
		        d."id",
		        d."accId",
		        d."dc",
		        d."amount",
		        d."instrNo",
		        d."remarks",
		        c2."accClass",
		        m."accName",
		        m."accCode",
				x."isAutoSubledger"
		    FROM cte1 c1
		    JOIN "TranD" d
		        ON c1."id" = d."tranHeaderId"
		    JOIN "AccM" m
		        ON m."id" = d."accId"
		    JOIN "AccClassM" c2
		        ON c2."id" = m."classId"
			LEFT JOIN "ExtMiscAccM" x
				on m."parentId" = x."accId" -- To find out if parent of account is isAutoSubledger
		),
		cte3 AS (
		    SELECT
		        x."id",
		        x."gstin",
		        x."cgst",
		        x."sgst",
		        x."igst"
		    FROM cte2 c2
		    JOIN "ExtGstTranD" x
		        ON c2."id" = x."tranDetailsId"
		),
		cte6 AS (
		    SELECT
		        e.*
		    FROM "AccM" a
		    JOIN "ExtBusinessContactsAccM" e
		        ON a."id" = e."accId"
		    JOIN cte2 c2
		        ON a."id" = c2."accId"
		    LIMIT 1
		),
		cte4 AS (
		    SELECT
		        s."id",
		        s."productId",
		        s."qty",
		        s."price",
		        s."priceGst",
		        s."discount",
		        s."cgst",
		        s."sgst",
		        s."igst",
		        s."amount",
		        s."hsn",
		        s."gstRate",
		        p."productCode",
		        p."upcCode",
		        c."catName",
		        b."brandName",
		        p."info",
		        p."label",
		        s."jData"->>'serialNumbers' AS "serialNumbers",
		        s."jData"->>'remarks'        AS "remarks"
		    FROM cte2 c2
		    JOIN "SalePurchaseDetails" s
		        ON c2."id" = s."tranDetailsId"
		    JOIN "ProductM" p
		        ON p."id" = s."productId"
		    JOIN "CategoryM" c
		        ON c."id" = p."catId"
		    JOIN "BrandM" b
		        ON b."id" = p."brandId"
		)
		SELECT json_build_object(
		    'tranH',              (SELECT row_to_json(a) FROM cte1 a),
		    'billTo',             (SELECT row_to_json(e) FROM cte5 e),
		    'businessContacts',   (SELECT row_to_json(f) FROM cte6 f),
		    'tranD',              (SELECT json_agg(b) FROM cte2 b),
		    'extGstTranD',        (SELECT row_to_json(c) FROM cte3 c),
		    'salePurchaseDetails',(SELECT json_agg(d) FROM cte4 d)
		) AS "jsonResult"
    """

    get_sales_report = """
            --WITH "branchId" AS (VALUES (1)), "finYearId" AS (VALUES (2024)), "productCode" as (VALUES (null::text)), "catId" AS (VALUES (null::int)), "brandId" AS (VALUES (null::int)), "tagId" AS (VALUES (null::int)), "startDate" AS (VALUES ('2024-04-01' :: DATE)), "endDate" AS (VALUES ('2025-03-31' :: DATE)), "days" AS (VALUES (0)),
            with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "productCode" as (VALUES (%(productCode)s::text)), "tagId" as (values(%(tagId)s::int)), "brandId" as (values(%(brandId)s::int)), "catId" as (values(%(catId)s::int)), "startDate" as (values(%(startDate)s ::date)), "endDate" as (values(%(endDate)s:: date)), "days" as (values (COALESCE(%(days)s,0))),

            filtered_products AS (
                SELECT id, "productCode", "catId", "brandId", label, info 
                FROM "ProductM"
                WHERE "productCode" = (TABLE "productCode")
                AND (TABLE "productCode") IS NOT NULL
            
                UNION ALL
            
                SELECT * FROM get_products_on_brand_category_tag(
                    (TABLE "brandId"),
                    (TABLE "catId"),
                    (TABLE "tagId")
                )
                WHERE (TABLE "productCode") IS NULL
            ),

            -- Other accounts involved in transactions (excluding Sale accounts)
            cte_other_accounts AS MATERIALIZED (
                SELECT h."id", STRING_AGG(a."accName", ', ') AS "accounts"
                FROM "TranH" h
                JOIN "TranD" d ON h."id" = d."tranHeaderId"
                JOIN "AccM" a ON a."id" = d."accId"
                JOIN "AccClassM" c ON c.id = a."classId"
                WHERE ("tranTypeId" IN (4, 9)) 
                AND ("accClass" <> 'sale') 
                AND COALESCE((TABLE "branchId"), "branchId") = "branchId"
                AND "finYearId" = (TABLE "finYearId")
                GROUP BY h."id"
            ),

            -- Base Sale and Sale Return Transactions
            cte_sale AS (
                SELECT 
                    h."id",
                    d."accId",
                    p."catId",
                    p."brandId",
                    p."productCode",
                    p."info",
                    p."label",
                    a.accounts,
                    h."remarks" AS "commonRemarks", 
                    CONCAT_WS(', ', d.remarks, s."jData" -> 'remarks') AS "lineRemarks",
                    "tranDate", 
                    s."productId", 
                    "tranTypeId", 
                    "qty", 
                    ("price" - "discount") AS "price", 
                    "cgst", 
                    "sgst",
                    "igst",
                    s."amount", 
                    "gstRate", 
                    s."id" AS "salePurchaseDetailsId", 
                    "autoRefNo", 
                    h."timestamp", 
                    CONCAT_WS(' ', "contactName", "mobileNumber", "address1", "address2") AS "contact",
                    s."jData" ->> 'serialNumbers' AS "serialNumbers"
                FROM "TranH" h
                JOIN "TranD" d ON h."id" = d."tranHeaderId"
                JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"
                JOIN filtered_products p ON p."id" = s."productId"
                LEFT JOIN "Contacts" c ON c."id" = h."contactsId"
                LEFT JOIN cte_other_accounts a ON h.id = a.id
                WHERE 
                    COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND "tranDate" BETWEEN (TABLE "startDate") AND (TABLE "endDate")
                    AND "tranTypeId" IN (4, 9)
            ),

            -- Find Last Purchase Before Each Sale
            cte_combined AS (
                SELECT 
                    cs.*,
                    lp."price" AS "lastPurchasePrice",
                    lp."tranDate" AS "lastPurchaseDate"
                FROM cte_sale cs
                LEFT JOIN LATERAL (
                    SELECT 
                        s."price" - s."discount" as "price",
                        h."tranDate"
                    FROM "TranH" h
                    JOIN "TranD" d ON h.id = d."tranHeaderId"
                    JOIN "SalePurchaseDetails" s ON d.id = s."tranDetailsId"
                    left join "StockJournal" j on h.id = j."tranHeaderId"
                    WHERE 
                        s."productId" = cs."productId"
                        AND h."tranDate" <= cs."tranDate" -- Only purchases before sale date
                        AND "tranTypeId" = 5 -- purchase
                        AND COALESCE((TABLE "branchId"), "branchId") = "branchId"
                        AND "finYearId" = (TABLE "finYearId")
                        AND s."price" IS NOT NULL
                        AND s."price" <> 0
                    
                    UNION
                    SELECT j.price,
                        h."tranDate"
                    FROM "TranH" h
                        join "StockJournal" j on h.id = j."tranHeaderId"
                    WHERE
                        j."productId" = cs."productId"
                        AND h."tranDate" <= cs."tranDate"
                        AND "tranTypeId" = 11 -- Stock Journal
                        AND COALESCE((TABLE "branchId"), "branchId") = "branchId"
                        AND "finYearId" = (TABLE "finYearId")
                        AND j."price" IS NOT NULL
                        AND j."price" <> 0
                        ORDER BY "tranDate" DESC
                    LIMIT 1
                ) lp ON TRUE
            ),

            -- Opening Balances (for fallback purchase info)
            cte_opbal AS (
                SELECT "productId", "qty", "openingPrice", "lastPurchaseDate"
                FROM "ProductOpBal" p 
                WHERE (COALESCE((TABLE "branchId"), "branchId") = "branchId") AND "finYearId" = (TABLE "finYearId")
            ),

            -- Merge Sale Data with Last Purchase or Opening Balances
            cte_merge AS (
                SELECT 
                    c."id",
                    c."accId",
                    c."catId",
                    c."brandId",
                    c."productCode",
                    c."info",
                    c."label",
                    b."brandName",
                    t."catName",
                    c.accounts,
                    c."commonRemarks",
                    c."lineRemarks",
                    c."tranDate",
                    c."productId",
                    c."tranTypeId",
                    c."qty",
                    c."price",
                    c."qty" * c."price" AS "aggrSale",
                    c."cgst",
                    c."sgst",
                    c."igst",
                    c."amount",
                    c."gstRate",
                    c."salePurchaseDetailsId",
                    c."autoRefNo",
                    c."timestamp",
                    c."contact",
                    c."serialNumbers",
                    -- If cte_combined has NULL, fallback to ProductOpBal
                    COALESCE(c."lastPurchasePrice", p."openingPrice") AS "lastPurchasePrice",
                    COALESCE(c."lastPurchaseDate", p."lastPurchaseDate") AS "lastPurchaseDate"
                FROM cte_combined c
                LEFT JOIN cte_opbal p ON p."productId" = c."productId"
                join "CategoryM" t on t.id = c."catId"
                join "BrandM" b on b.id = c."brandId"
            ),

            -- Compute Gross Profit per Line
            cte_compute_gp AS (
                SELECT c.*,
                        COALESCE(qty * 
                                (c.price - COALESCE(c."lastPurchasePrice"
                                                    , NULLIF(p."dealerPrice", 0)
                                                    , NULLIF(p."purPrice", 0)))
                                , 0.00) AS "grossProfit"
                FROM cte_merge c
                LEFT JOIN "ProductM" p ON p.id = c."productId"
            ),

			-- calculate stock
			-- ========== TRANSACTIONS UNION ==========
            cte_all_trans AS (
                -- Sales & Purchases
                SELECT 
                    h."id", s."productId", h."tranTypeId", s."qty", 
                    '' AS "dc"
                FROM "TranH" h
                JOIN "TranD" d ON h."id" = d."tranHeaderId"
                JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"
                WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND h."tranDate" <= COALESCE((TABLE "endDate"), CURRENT_DATE)

                UNION ALL

                -- Stock Journals
                SELECT 
                    h."id", s."productId", h."tranTypeId", s."qty", 
                    "dc"
                FROM "TranH" h
                JOIN "StockJournal" s ON h."id" = s."tranHeaderId"
                WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND h."tranDate" <= COALESCE((TABLE "endDate"), CURRENT_DATE)

                UNION ALL

                -- Branch Transfer Credits
                SELECT 
                    h."id", b."productId", h."tranTypeId", b."qty", 
                    'C' AS "dc"
                FROM "TranH" h
                JOIN "BranchTransfer" b ON h."id" = b."tranHeaderId"
                WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND h."tranDate" <= COALESCE((TABLE "endDate"), CURRENT_DATE)

                UNION ALL

                -- Branch Transfer Debits
                SELECT 
                    h."id", b."productId", h."tranTypeId", b."qty", 
                    'D' AS "dc"
                FROM "TranH" h
                JOIN "BranchTransfer" b ON h."id" = b."tranHeaderId"
				--right join cte_sale cs on cs."productId" = b."productId"
                WHERE COALESCE((TABLE "branchId"), "destBranchId") = "destBranchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND h."tranDate" <= COALESCE((TABLE "endDate"), CURRENT_DATE)
            ),
			-- Sum
			cte_sum_all_trans AS (
                SELECT 
                    "productId", "tranTypeId",
                    SUM(CASE WHEN "tranTypeId" = 4 THEN "qty" ELSE 0 END) AS "sale",
                    SUM(CASE WHEN "tranTypeId" = 9 THEN "qty" ELSE 0 END) AS "saleRet",
                    SUM(CASE WHEN "tranTypeId" = 5 THEN "qty" ELSE 0 END) AS "purchase",
                    SUM(CASE WHEN "tranTypeId" = 10 THEN "qty" ELSE 0 END) AS "purchaseRet",
                    SUM(CASE WHEN "tranTypeId" = 11 AND "dc" = 'D' THEN "qty" ELSE 0 END) AS "stockJournalDebits",
                    SUM(CASE WHEN "tranTypeId" = 11 AND "dc" = 'C' THEN "qty" ELSE 0 END) AS "stockJournalCredits",
                    SUM(CASE WHEN "tranTypeId" = 12 AND "dc" = 'D' THEN "qty" ELSE 0 END) AS "branchTransferDebits",
                    SUM(CASE WHEN "tranTypeId" = 12 AND "dc" = 'C' THEN "qty" ELSE 0 END) AS "branchTransferCredits"
                FROM cte_all_trans
                GROUP BY "productId", "tranTypeId"
            ),
			-- consolidate
			cte_consolidate_all_trans AS (
                SELECT 
                    "productId",
                    COALESCE(SUM("sale"), 0) AS "sale",
                    COALESCE(SUM("purchase"), 0) AS "purchase",
                    COALESCE(SUM("saleRet"), 0) AS "saleRet",
                    COALESCE(SUM("purchaseRet"), 0) AS "purchaseRet",
                    COALESCE(SUM("stockJournalDebits"), 0) AS "stockJournalDebits",
                    COALESCE(SUM("stockJournalCredits"), 0) AS "stockJournalCredits",
                    COALESCE(SUM("branchTransferDebits"), 0) AS "branchTransferDebits",
                    COALESCE(SUM("branchTransferCredits"), 0) AS "branchTransferCredits"
                FROM cte_sum_all_trans
                GROUP BY "productId"
            ),
			 -- comine with op balance 
			cte_combine_with_opbal AS (
                SELECT 
                    COALESCE(c1."productId", c2."productId") AS "productId",
                    COALESCE(c2."qty", 0) AS "op",
                    COALESCE("sale", 0) AS "sale",
                    COALESCE("purchase", 0) AS "purchase",
                    COALESCE("saleRet", 0) AS "saleRet",
                    COALESCE("purchaseRet", 0) AS "purchaseRet",
                    COALESCE("stockJournalDebits", 0) AS "stockJournalDebits",
                    COALESCE("stockJournalCredits", 0) AS "stockJournalCredits",
                    COALESCE("branchTransferDebits", 0) AS "branchTransferDebits",
                    COALESCE("branchTransferCredits", 0) AS "branchTransferCredits"
                FROM cte_consolidate_all_trans c1
                LEFT JOIN cte_opbal c2 ON c1."productId" = c2."productId"
            ),
			-- compute stock
			cte_compute_stock as (select c.*, COALESCE(
                        "op" + "purchase" - "purchaseRet" - "sale" + "saleRet" + 
                        "stockJournalDebits" - "stockJournalCredits" + 
                        "branchTransferDebits" - "branchTransferCredits", 0
                    ) AS "clos" from cte_combine_with_opbal c),
					
            -- Final Adjustment: Negate Values for Returns
            cte_final AS ( -- negate for sales return
                SELECT c."id",
                        c."accId",
                        c.accounts,
                        c."brandName",
                        c."catName",
                        c."productCode",
                        c."label",
						c."brandName" || ' ' || c.label as "product",
                        c."info",
                        c."commonRemarks",
                        c."lineRemarks",
                        c."tranDate",
                        c."productId",
                        c."tranTypeId",
                        c."price",
                        c."gstRate",
                        c."salePurchaseDetailsId",
                        c."autoRefNo",
                        c."timestamp",
                        c."contact",
                        c."serialNumbers",
                        c."lastPurchasePrice",
                        c."lastPurchaseDate",
                        --c."aggrSale",
						c1.clos as stock,
                        CASE WHEN "tranTypeId" = 4 THEN "qty" ELSE -"qty" END AS "qty",
                        CASE WHEN "tranTypeId" = 4 THEN c."aggrSale" ELSE -c."aggrSale" END AS "aggrSale",
                        CASE WHEN "tranTypeId" = 4 THEN "cgst" ELSE -"cgst" END AS "cgst",
                        CASE WHEN "tranTypeId" = 4 THEN "sgst" ELSE -"sgst" END AS "sgst",
                        CASE WHEN "tranTypeId" = 4 THEN "igst" ELSE -"igst" END AS "igst",
                        CASE WHEN "tranTypeId" = 4 THEN "amount" ELSE -"amount" END AS "amount",
                        CASE WHEN "tranTypeId" = 4 THEN 'Sale' ELSE 'Return' END AS "saleType",
                        CASE WHEN "tranTypeId" = 4 THEN "grossProfit" ELSE -"grossProfit" END AS "grossProfit",
                        date_part('day', COALESCE(c."tranDate"::timestamp, '2010-01-01'::timestamp) - COALESCE(c."lastPurchaseDate"::timestamp, '2010-01-01'::timestamp))::int as age

                FROM cte_compute_gp c 
					join cte_compute_stock c1 on c."productId" = c1."productId"
				order by "tranDate", "salePurchaseDetailsId"
            )
                SELECT * FROM cte_final where age >= (table days)
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

    get_stock_journal_on_tran_header_id = """
        with "id" as (values(%(id)s::int)),
	    --with "id" as (values(10834)),
		cte1 as (
            select "id", 
				"tranDate", 
				"userRefNo", 
				"remarks", 
				"autoRefNo", 
				"tranTypeId"
            from "TranH"
            	where "id" = (table "id")
        ), cte2 as (
			select 
				s."id",
				"productId", 
				"productCode",
                "upcCode",
				"brandName", 
				"label", 
				"catName", 
				"info",
				"catName" || ' ' ||  "brandName" || ' ' || "label" || ' ' || COALESCE("info",'') as "productDetails",
				qty, 
				s."price",
				s."jData"->>'serialNumbers' as "serialNumbers",
				"dc",
				"lineRefNo", 
				"lineRemarks",
                "tranHeaderId"
			from cte1 c1
				join "StockJournal" s
					on c1."id" = s."tranHeaderId"
				join "ProductM" p
					on p."id" = s."productId"
				join "CategoryM" c
					on c."id" = p."catId"
				join "BrandM" b
					on b."id" = p."brandId"
			order by s."id"
		)
		select json_build_object(
			'tranH', (SELECT row_to_json(a) from cte1 a),
			'stockJournals', (select json_agg(b) from cte2 b)
		) as "jsonResult"
    """

    get_stock_summary_report = """
        --WITH "branchId" AS (VALUES (NULL::INT)), "finYearId" AS (VALUES (2024)), "catId" AS (VALUES (NULL::INT)), "brandId"   AS (VALUES (NULL::INT)), "tagId" AS (VALUES (NULL::INT)), "onDate"    AS (VALUES (CURRENT_DATE)), "days" AS (VALUES (0)), "grossProfitFilter" AS (VALUES (0)),          
        with "branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "tagId" as (values(%(tagId)s::int)), "brandId" as (values(%(brandId)s::int)), "catId" as (values(%(catId)s::int)), "onDate" as (values(%(onDate)s ::date)), "days" as (values(%(days)s::int)), "grossProfitFilter" as (values(%(grossProfitFilter)s::int)),
            -- ========== PRODUCT FILTER ==========
            "cteProduct" AS (
                SELECT * 
                FROM get_products_on_brand_category_tag(
                    (TABLE "brandId"),
                    (TABLE "catId"),
                    (TABLE "tagId")
                )
            ),

            -- ========== TRANSACTIONS UNION ==========
            cte0 AS (
                -- Sales & Purchases
                SELECT 
                    h."id", "productId", "tranTypeId", "qty", 
                    ("price" - "discount") AS "price", "tranDate", '' AS "dc"
                FROM "TranH" h
                JOIN "TranD" d ON h."id" = d."tranHeaderId"
                JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"
                WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)

                UNION ALL

                -- Stock Journals
                SELECT 
                    h."id", "productId", "tranTypeId", "qty", 
                    "price", "tranDate", "dc"
                FROM "TranH" h
                JOIN "StockJournal" s ON h."id" = s."tranHeaderId"
                WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)

                UNION ALL

                -- Branch Transfer Credits
                SELECT 
                    h."id", "productId", "tranTypeId", "qty", 
                    "price", "tranDate", 'C' AS "dc"
                FROM "TranH" h
                JOIN "BranchTransfer" b ON h."id" = b."tranHeaderId"
                WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)

                UNION ALL

                -- Branch Transfer Debits
                SELECT 
                    h."id", "productId", "tranTypeId", "qty", 
                    "price", "tranDate", 'D' AS "dc"
                FROM "TranH" h
                JOIN "BranchTransfer" b ON h."id" = b."tranHeaderId"
                WHERE COALESCE((TABLE "branchId"), "destBranchId") = "destBranchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)
            ),

            -- ========== OPENING BALANCES ==========
            cte1 AS (
                SELECT 
                    "productId", 
                    SUM("qty") AS "qty", 
                    MAX("openingPrice") AS "openingPrice", 
                    MAX("lastPurchaseDate") AS "lastPurchaseDate"
                FROM "ProductOpBal"
                WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                GROUP BY "productId"
            ),

            -- ========== ADD LAST TRAN PURCHASE PRICE ==========
            cte00 AS (
                SELECT 
                    c0.*, 
                    (
                        SELECT DISTINCT ON ("productId") "price"
                        FROM cte0
                        WHERE "tranTypeId" IN (5,11)
                        AND "tranDate" <= c0."tranDate"
                        AND "productId" = c0."productId"
                        AND "price" IS NOT NULL AND "price" <> 0
						AND dc <> 'C'
                        ORDER BY "productId", "tranDate" DESC, "id" DESC
                    ) AS "lastTranPurchasePrice",
                    "openingPrice",
                    p."purPrice"
                FROM cte0 c0
                LEFT JOIN cte1 c1 ON c1."productId" = c0."productId"
                join "ProductM" p on p.id = c0."productId"
            ),

            -- ========== CALCULATE GROSS PROFIT ==========
            cte000 AS (
                SELECT 
                    cte00.*,
                    CASE 
                        WHEN "tranTypeId" = 4 THEN "qty" * ("price"  - COALESCE("lastTranPurchasePrice", "openingPrice"))
                        WHEN "tranTypeId" = 9 THEN -"qty" * ("price"  - COALESCE("lastTranPurchasePrice", "openingPrice"))
                        ELSE 0
                    END AS "grossProfit"
                FROM cte00
            ),

            -- ========== AGGREGATE TRANSACTION TYPES ==========
            cte22 AS (
                SELECT 
                    "productId", "tranTypeId",
                    SUM(CASE WHEN "tranTypeId" = 4 THEN "qty" ELSE 0 END) AS "sale",
                    SUM(CASE WHEN "tranTypeId" = 9 THEN "qty" ELSE 0 END) AS "saleRet",
                    SUM(CASE WHEN "tranTypeId" = 5 THEN "qty" ELSE 0 END) AS "purchase",
                    SUM(CASE WHEN "tranTypeId" = 10 THEN "qty" ELSE 0 END) AS "purchaseRet",
                    SUM(CASE WHEN "tranTypeId" = 11 AND "dc" = 'D' THEN "qty" ELSE 0 END) AS "stockJournalDebits",
                    SUM(CASE WHEN "tranTypeId" = 11 AND "dc" = 'C' THEN "qty" ELSE 0 END) AS "stockJournalCredits",
                    SUM(CASE WHEN "tranTypeId" = 12 AND "dc" = 'D' THEN "qty" ELSE 0 END) AS "branchTransferDebits",
                    SUM(CASE WHEN "tranTypeId" = 12 AND "dc" = 'C' THEN "qty" ELSE 0 END) AS "branchTransferCredits",
                    MAX(CASE WHEN "tranTypeId" = 4 THEN "tranDate" END) AS "lastSaleDate",
                    SUM( "grossProfit") AS "grossProfit"
                FROM cte000
                GROUP BY "productId", "tranTypeId"
            ),
			cte222 as (
				select c0."productId",
					MAX("tranDate") AS "lastPurchaseDate"
				FROM cte000 c0 left join cte22 c22 on c0."productId" = c22."productId"
					where c0."tranTypeId" in(5,11) and dc <> 'C'
                GROUP BY c0."productId"
			 ),
			cte2 as (
				select c22.*, c222."lastPurchaseDate"
				from cte22 as c22 left join cte222 as c222 on c22."productId" = c222."productId"
			),

            -- ========== COMBINE ALL TRANSACTION TYPES ==========
            cte3 AS (
                SELECT 
                    "productId",
                    COALESCE(SUM("sale"), 0) AS "sale",
                    COALESCE(SUM("purchase"), 0) AS "purchase",
                    COALESCE(SUM("saleRet"), 0) AS "saleRet",
                    COALESCE(SUM("purchaseRet"), 0) AS "purchaseRet",
                    COALESCE(SUM("stockJournalDebits"), 0) AS "stockJournalDebits",
                    COALESCE(SUM("stockJournalCredits"), 0) AS "stockJournalCredits",
                    COALESCE(SUM("branchTransferDebits"), 0) AS "branchTransferDebits",
                    COALESCE(SUM("branchTransferCredits"), 0) AS "branchTransferCredits",
                    COALESCE(SUM("grossProfit"), 0) AS "grossProfit",
                    MAX("lastSaleDate") AS "lastSaleDate",
                    MAX("lastPurchaseDate") AS "lastPurchaseDate"
                FROM cte2
                GROUP BY "productId"
            ),

            -- ========== MERGE OPENING BALANCE ==========
            cte4 AS (
                SELECT 
                    COALESCE(c1."productId", c3."productId") AS "productId",
                    COALESCE(c1."qty", 0) AS "op",
                    COALESCE("sale", 0) AS "sale",
                    COALESCE("purchase", 0) AS "purchase",
                    COALESCE("saleRet", 0) AS "saleRet",
                    COALESCE("purchaseRet", 0) AS "purchaseRet",
                    COALESCE("stockJournalDebits", 0) AS "stockJournalDebits",
                    COALESCE("stockJournalCredits", 0) AS "stockJournalCredits",
                    COALESCE("branchTransferDebits", 0) AS "branchTransferDebits",
                    COALESCE("branchTransferCredits", 0) AS "branchTransferCredits",
                    COALESCE(c3."lastPurchaseDate", c1."lastPurchaseDate") AS "lastPurchaseDate",
                    COALESCE("grossProfit", 0) AS "grossProfit",
                    "openingPrice", "lastSaleDate"
                FROM cte1 c1
                FULL JOIN cte3 c3 ON c1."productId" = c3."productId"
            ),

            -- ========== LAST PURCHASE PRICE ==========
            cte5 AS (
                SELECT DISTINCT ON ("productId") 
                    "productId", "price" AS "lastPurchasePrice"
                FROM cte0
                WHERE "tranTypeId" = 5
                ORDER BY "productId", "tranDate" DESC
            ),

            -- ========== FINAL CALCULATIONS ==========
            cte6 AS (
                SELECT 
                    COALESCE(c4."productId", c5."productId") AS "productId",
                    COALESCE("openingPrice", 0) AS "openingPrice",
                    "op", 
                    (COALESCE("op", 0) * COALESCE("openingPrice", 0))::NUMERIC(12,2) AS "opValue",
                    "sale", "purchase", "saleRet", "purchaseRet",
                    "stockJournalDebits", "stockJournalCredits",
                    "branchTransferDebits", "branchTransferCredits",
                    COALESCE("lastPurchasePrice", "openingPrice", "purPrice") AS "lastPurchasePrice",
                    "lastPurchaseDate", "lastSaleDate",
                    COALESCE(
                        "op" + "purchase" - "purchaseRet" - "sale" + "saleRet" + 
                        "stockJournalDebits" - "stockJournalCredits" + 
                        "branchTransferDebits" - "branchTransferCredits", 0
                    ) AS "clos",
                    "grossProfit",
                    DATE_PART('day', COALESCE((TABLE "onDate"), CURRENT_DATE::timestamp) - COALESCE("lastPurchaseDate"::timestamp, (CURRENT_DATE - 360)::timestamp)  ) AS "tempAge"
                FROM cte4 c4
                FULL JOIN cte5 c5 ON c4."productId" = c5."productId"
                join "ProductM" p on p.id = c4."productId"
            ),

            cte7 as (
                select c6.*,
                CASE WHEN clos = 0 THEN DATE_PART('day', COALESCE("lastSaleDate", (TABLE "onDate"), CURRENT_DATE::timestamp) - "lastPurchaseDate"::timestamp)
                ELSE "tempAge" END as "age"
                from cte6 c6
            ),

            -- ========== FINAL JOIN WITH PRODUCT INFO ==========
            cte8 AS (
                SELECT 
                    p."id" AS "productId", "productCode", "catName", "brandName", "label",
                    "brandName" || ' ' || "label" as "product",
                    "openingPrice", COALESCE("op", 0)::NUMERIC(10,2) AS "op", "opValue",
                    (COALESCE("purchase", 0) + COALESCE("saleRet", 0) + COALESCE("stockJournalDebits", 0) + COALESCE("branchTransferDebits", 0))::NUMERIC(10,2) AS "dr",
                    (COALESCE("sale", 0) + COALESCE("purchaseRet", 0) + COALESCE("stockJournalCredits", 0) + COALESCE("branchTransferCredits", 0))::NUMERIC(10,2) AS "cr",
                    COALESCE("sale", 0)::NUMERIC(10,2) AS "sale",
                    COALESCE("purchase", 0)::NUMERIC(10,2) AS "purchase",
                    COALESCE("saleRet", 0)::NUMERIC(10,2) AS "saleRet",
                    COALESCE("purchaseRet", 0)::NUMERIC(10,2) AS "purchaseRet",
                    COALESCE("stockJournalDebits", 0)::NUMERIC(10,2) AS "stockJournalDebits",
                    COALESCE("stockJournalCredits", 0)::NUMERIC(10,2) AS "stockJournalCredits",
                    COALESCE("branchTransferDebits", 0)::NUMERIC(10,2) AS "branchTransferDebits",
                    COALESCE("branchTransferCredits", 0)::NUMERIC(10,2) AS "branchTransferCredits",
                    COALESCE("clos", 0)::NUMERIC(10,2) AS "clos",
                    "lastPurchasePrice",
                    ("clos" * "lastPurchasePrice")::NUMERIC(12,2) AS "closValue",
                    "lastPurchaseDate", "lastSaleDate", "info", "grossProfit", "age"
                FROM cte7 c7
                RIGHT JOIN "cteProduct" p ON p."id" = c7."productId"
                JOIN "CategoryM" c ON c."id" = p."catId"
                JOIN "BrandM" b ON b."id" = p."brandId"
                WHERE NOT (
                    "clos" = 0 AND "op" = 0 AND "sale" = 0 AND "purchase" = 0 AND 
                    "saleRet" = 0 AND "purchaseRet" = 0 AND "stockJournalDebits" = 0 AND "stockJournalCredits" = 0
                ) AND
                GREATEST("age",0) >= COALESCE((TABLE "days"), 0)
                ORDER BY "catName", "brandName", "label"
            )
			
            SELECT * FROM cte8 c8
                where (((TABLE "grossProfitFilter") = 0)
                OR (((TABLE "grossProfitFilter") = 1) AND c8."grossProfit" >= 0)
                OR (((TABLE "grossProfitFilter") = -1) AND c8."grossProfit" < 0))
    """

    get_stock_trans_report = """
            --WITH "branchId" AS (VALUES (NULL::INT)), "finYearId" AS (VALUES (2024)), "productCode" as (VALUES (null::text)), "catId" AS (VALUES (NULL::INT)), "brandId"   AS (VALUES (NULL::INT)), "tagId" AS (VALUES (NULL::INT)),
                with "branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "productCode" as (VALUES (%(productCode)s::text)), "tagId" as (values(%(tagId)s::int)), "brandId" as (values(%(brandId)s::int)), "catId" as (values(%(catId)s::int)),
            "startDate" as (select "startDate" from "FinYearM" where "id" = (table "finYearId"))
            , "endDate" as (select "endDate" from "FinYearM" where "id" = (table "finYearId"))
            , "cteProduct" AS (
                SELECT id, "productCode", "catId", "brandId", label, info 
                FROM "ProductM"
                WHERE "productCode" = (TABLE "productCode")
                AND (TABLE "productCode") IS NOT NULL
            
                UNION ALL
            
                SELECT * FROM get_products_on_brand_category_tag(
                    (TABLE "brandId"),
                    (TABLE "catId"),
                    (TABLE "tagId")
                )
                WHERE (TABLE "productCode") IS NULL
            )
            , cte0 as ( -- opening balance
                select id, "productId", "qty", "openingPrice", "lastPurchaseDate"
                    from "ProductOpBal" p 
                where (COALESCE((TABLE "branchId"), "branchId") = "branchId")
                and "finYearId" =(table "finYearId")
                and qty <> 0
            )
            , cte1 as ( --all account names for tranHeaderId
                select h."id" as "tranHeaderId", STRING_AGG("accName", ', ') as "accountNames"
                    from "TranH" h
                        join "TranD" d
                            on h."id" = d."tranHeaderId"
                        join "AccM" a
                            on a."id" = d."accId"
                    where "tranTypeId" in(4,5,9,10,11,12)
                    group by h."id"
            )
            -- Transaction unions
            , cte2 as -- Sales purchases
            (select "productId"
                , "tranTypeId"
                , h."id" as "tranHeaderId"
                , "tranDate"
                , CASE WHEN h."tranTypeId" in (5, 9) then "qty" ELSE 0 END as "debits"
                , CASE WHEN h."tranTypeId" in (4, 10) then "qty" ELSE 0 END as "credits"
                , ("price" - "discount") "price"
                , CONCAT_WS(', ', "autoRefNo",  "userRefNo", h."remarks", d."instrNo", d."lineRefNo", d."remarks", s."jData"->'serialNumbers') as "remarks"
                , d."timestamp"
                , "qty"
                , '' as dc
            from "TranH" h
                join "TranD" d
                    on h."id" = d."tranHeaderId"
                join "SalePurchaseDetails" s
                    on d."id" = s."tranDetailsId"
                join "cteProduct" p
                    on p."id" = s."productId"
            WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                and "finYearId" = (table "finYearId")
                
            UNION ALL
            
            SELECT -- Stock Journals
                "productId"
                , "tranTypeId"
                , h."id" as "tranHeaderId"
                , "tranDate"
                , CASE WHEN dc = 'D' then "qty" ELSE 0 END as "debits"
                , CASE WHEN dc = 'C' then "qty" ELSE 0 END as "credits"
                , price
                , CONCAT_WS(', ', "autoRefNo",  "userRefNo", h."remarks", s."lineRefNo", s."lineRemarks", s."jData"->'serialNumbers') as "remarks"
                , s."timestamp"
                , "qty"
                , "dc"
            FROM "TranH" h
            JOIN "StockJournal" s ON h."id" = s."tranHeaderId"
            join "cteProduct" p on p."id" = s."productId"
            WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                AND "finYearId" = (TABLE "finYearId")
                
            UNION ALL
            
            SELECT -- Branch Transfer Credits
                "productId"
                , "tranTypeId"
                , h."id" as "tranHeaderId"
                , "tranDate"
                , 0 as "debits"
                , qty as "credits"
                , "price"
                , CONCAT_WS(', ', "autoRefNo",  "userRefNo", h."remarks", s."lineRefNo", s."lineRemarks", s."jData"->'serialNumbers') as "remarks"
                , s."timestamp"
                , qty
                , 'C' as dc
            FROM "TranH" h
            JOIN "BranchTransfer" s ON h."id" = s."tranHeaderId"
            join "cteProduct" p on p."id" = s."productId"
            WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                AND "finYearId" = (TABLE "finYearId")

            UNION ALL

            SELECT -- Branch Transfer Debits
                "productId"
                , "tranTypeId"
                , h."id" as "tranHeaderId"
                , "tranDate"
                , qty as "debits"
                , 0 as "credits"
                , "price"
                , CONCAT_WS(', ', "autoRefNo",  "userRefNo", h."remarks", s."lineRefNo", s."lineRemarks", s."jData"->'serialNumbers') as "remarks"
                , s."timestamp"
                , qty
                , 'D' as dc
            FROM "TranH" h
            JOIN "BranchTransfer" s ON h."id" = s."tranHeaderId"
            join "cteProduct" p on p."id" = s."productId"
            WHERE COALESCE((TABLE "branchId"), "destBranchId") = "destBranchId"
                AND "finYearId" = (TABLE "finYearId")
            )
            , cte22 as ( -- addlastTranPurchasePrice
                select c2.* , (
                    select DISTINCT on("productId") "price"
                    from cte2
                    WHERE "tranTypeId" IN (5,11)
                        and ("tranDate" <= c2."tranDate") 
                        and ("productId" = c2."productId")
                        AND "price" IS NOT NULL AND "price" <> 0
                        AND dc <> 'C'
                    order by "productId", "tranDate" DESC
                ) as "lastTranPurchasePrice"
                , "openingPrice"
                from cte2 c2
                    left join cte0 c0 on c0."productId" = c2."productId"
            )
            , cte222 as ( -- add gross profit
                select c22.*, 
                CASE WHEN "tranTypeId" =  4 then "qty" * ("price" - COALESCE("lastTranPurchasePrice", "openingPrice"))
                    WHEN "tranTypeId" = 9 then -("qty" * ("price" - COALESCE("lastTranPurchasePrice", "openingPrice"))) 
                    else 0
                    end
                as "grossProfit"
                from cte22 c22
            )
            , cte3 as ( -- get account names by joining cte1 with cte222
                select 
                c2."productId"
                , "tranTypeId"
                , "tranDate"
                , "debits"
                , "credits"
                , ("debits" - "credits") as "balance"
                , "price"
                , CONCAT_WS(', ',"accountNames", "remarks") as "remarks"
                , "timestamp"
                , "grossProfit"
                from cte222 c2
                     left join cte1 c1 on c2."tranHeaderId" = c1."tranHeaderId"
            )
            , cte4 as ( -- op balance with remarks 'Opening balance', for products having transactions
                select DISTINCT ON (c3."productId")
                c3."productId"
                , (table "startDate") as "tranDate"
                , CASE WHEN COALESCE(c0.qty,0) >= 0 then COALESCE(c0.qty,0) ELSE 0 END as "debits"
                , CASE WHEN COALESCE(c0.qty,0) < 0 then -"qty" ELSE 0 END as "credits"
                , COALESCE(c0.qty,0) as "balance"
                , 'Opening balance' as "remarks"
                , '2000-01-01 00:00:00.00+00'::timestamp as timestamp
                from cte3 c3
                    left join cte0 c0 on c3."productId" = c0."productId"
            )
            , cte5 as ( -- union cte3 and op balance
                select c3.*
                from cte3 c3

                UNION ALL 
                
                select "productId"
                , 0 as "tranTypeId"
                , "tranDate"
                , "debits"
                , "credits"
                , "balance"
                , 0 as "price"
                , "remarks"
                , "timestamp"
                , 0 as "grossProfit"
                from cte4 c4
            )
             , cte6 as ( -- compute summary from cte5
                select
                "productId"				
                , 100 as "tranTypeId"
                , (table "endDate") as "tranDate"
                , SUM("debits") as "debits"
                , SUM("credits") as "credits"
                , SUM("debits") - SUM("credits") as "balance"
				, 0 as "price"
				, 'Summary' as "remarks"
				, '9999-12-31 00:00:00.00+00'::timestamp as timestamp
                , SUM("grossProfit") as "grossProfit"
                from cte5 c5
                GROUP BY "productId"
             )
             , cte7 as ( -- union the results with summary cte5 + cte6
				select c5.*
				from cte5 c5

				union all
				
				select c6.*
				from cte6 c6
             )
			 , cte8 as ( -- final with misssing columns
				select
				"productId"
				, "catName"
                , p."productCode"
				, CONCAT_WS(' ', "brandName", "label") "product"
				, p."info"
				, "tranDate"
				, "tranType"
				, "tranTypeId"
				, "debits"
				, "credits"
				, "balance"
				, "price"
				, c7."remarks"
				, "grossProfit"
				, c7."timestamp"
				from cte7 c7
				join "ProductM" p on p."id" = c7."productId"
				join "CategoryM" c on c."id" = p."catId"
				join "BrandM" b on b."id" = p."brandId"
				left join "TranTypeM" t on t."id" = c7."tranTypeId"
			 )
            select * from cte8 order by "catName", "product", "tranDate", "timestamp"
    """

    get_subledger_accounts = """
        with "accId" as (values (%(accId)s::int))
         -- with "accId" AS (VALUES (1::int))
            select id, "accName", "accLeaf"
                from "AccM"
                    where "parentId" = (table "accId")
                order by "accName"
    """

    get_tags = """
        select id, "tagName"
            from "TagsM"
                order by "tagName"
    """

    get_trial_balance = """
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

    get_voucher_details_on_id = """
        WITH "id" as (values (%(id)s::int))
        --WITH "id" as (values (10576::int))
        , cte1 as (
            select "id", "tranDate", "autoRefNo", "tags", 
                    "remarks" , "userRefNo", "tranTypeId"
            from "TranH"		
                where "id" = (table id)),
                cte2 as (select t."id", "accId", a."accName", "remarks", "dc", "amount", "tranHeaderId", "lineRefNo", "instrNo",
                    (select row_to_json(t) from 
                        (
                            select *, CASE WHEN "rate" is not null 
                                THEN true 
                                ELSE false 
                                END as "isGst" 
                            from "ExtGstTranD" where "tranDetailsId" = t."id") t
                    ) as "gst"
                from "TranD" t
					join "AccM" a on a.id = t."accId"
                    where "tranHeaderId" =(table id))

                SELECT
                    json_build_object(
                        'tranHeader', (SELECT (row_to_json(a)) from cte1 a)
                        , 'tranDetails', (SELECT json_agg(row_to_json(b)) from cte2 b)
                    ) as "jsonResult"
    """

    increment_last_no = """
        WITH "finYearId" as (values (%(finYearId)s::int)), "branchId" as (values (%(branchId)s::int)), "tranTypeId" as (values (%(tranTypeId)s::int))
        --with "finYearId" as (VALUES (2024::int)), "branchId" as (VALUES (1::int)), "tranTypeId" as (VALUES (12::int))
            UPDATE "TranCounter"
            SET "lastNo" = "lastNo" + 1
            WHERE "finYearId" = (table "finYearId")
            AND "branchId" = (table "branchId")
            AND "tranTypeId" = (table "tranTypeId")
    """

    insert_account = """
        insert into "AccM"("accCode", "accName", "accType", "parentId", "accLeaf", "isPrimary", "classId")
            values(%(accCode)s, %(accName)s, %(accType)s, %(parentId)s, %(accLeaf)s, %(isPrimary)s, %(classId)s)
                returning "id"
    """

    insert_product = """
        WITH new_product_code AS (
            UPDATE "Settings"
            SET "intValue" = "intValue" + 1
            WHERE "key" = 'lastProductCode'
            RETURNING "intValue" AS "productCode"),
        inserted_product AS (
            INSERT INTO "ProductM" (
                "catId", "hsn", "brandId", "info", "unitId", "label", 
                "productCode", "upcCode", "gstRate", "maxRetailPrice", "salePrice",
                "salePriceGst", "dealerPrice", "purPrice", "purPriceGst"
            )
            SELECT 
                %(catId)s, %(hsn)s, %(brandId)s, %(info)s, %(unitId)s, %(label)s,  
                np."productCode", %(upcCode)s, %(gstRate)s, %(maxRetailPrice)s, %(salePrice)s, 
                %(salePriceGst)s, %(dealerPrice)s, %(purPrice)s, %(purPriceGst)s
            FROM new_product_code np
            RETURNING "id")
        SELECT "id" FROM inserted_product
    """

    test_connection = """
        select 'ok' as "connection"
    """

    update_last_no_auto_subledger = """
        update "AutoSubledgerCounter"
        set "lastNo" = %(lastNo)s
            where "finYearId" = %(finYearId)s 
                and "branchId" = %(branchId)s
                and "accId" = %(accId)s
    """

    def update_accounts_master(params):
        return sql.SQL(
            """
        do $$
        DECLARE 
            children INT[];
            parentClassId INT;
            parentAccType CHAR(1);
        begin
            update "AccM" 
                set "accCode" = {accCode}
                , "accName" = {accName}
                , "parentId" = {parentId}
                , "accLeaf" = {accLeaf}
                    where "id" = {accId};
                                                       
            select "classId", "accType" 
                into parentClassId, parentAccType 
                from "AccM" 
                where "id" = {parentId};
                                                       
            if {hasParentChanged} then
                WITH RECURSIVE hier AS (
                    SELECT id
                    FROM "AccM"
                    WHERE id = {accId}
                        UNION ALL
                    SELECT a.id
                    FROM "AccM" a
                    INNER JOIN hier h ON a."parentId" = h.id)
                select array_agg(id) into children from hier;
                
                update "AccM"
                    set "accType" = parentAccType,
                    "classId" = parentClassId
                where id = any(children);
                                                       
            end if;
        end $$;
    """
        ).format(
            accId=sql.Literal(params["accId"]),
            parentId=sql.Literal(params["parentId"]),
            accCode=sql.Literal(params["accCode"]),
            accName=sql.Literal(params["accName"]),
            accLeaf=sql.Literal(params["accLeaf"]),
            hasParentChanged=sql.Literal(params["hasParentChanged"]),
        )

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

    def upsert_general_settings(params):
        return sql.SQL(
            """
        do $$
        begin
            if exists( 
                select 1 from "Settings"	
                    where "key" = 'generalSettings') then
                        update "Settings"
                            set "jData" = {jData}
                                where "key" = 'generalSettings';
            else
            insert into "Settings" ("id", "key", "jData", "intValue")
                    values (3, 'generalSettings', {jData}, 0);
            end if;
        end $$;
    """
        ).format(jData=sql.Literal(params["jData"]))

    upsert_product_opening_balance = """
        with "productId" as (values(%(productId)s::int)), "branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "openingPrice" as (values(%(openingPrice)s::numeric)), "lastPurchaseDate" as (values(%(lastPurchaseDate)s::date)), "qty" as (values(%(qty)s::numeric)),
		--WITH "productId" AS (VALUES (49)), "branchId" as (values(1)), "finYearId" as (values (2024)), "openingPrice" AS (VALUES (100)), "lastPurchaseDate" as (values ('2023=03-12'::date)), "qty" as (values(10)),
            updated AS (
                UPDATE "ProductOpBal"
                SET "qty" = "qty" + (table "qty"),
                    "lastPurchaseDate" = COALESCE((table "lastPurchaseDate"),"ProductOpBal"."lastPurchaseDate"),
                    "openingPrice" = CASE 
                        WHEN (table "openingPrice") = 0 THEN "ProductOpBal"."openingPrice"
                        ELSE (table "openingPrice")
                    END
                WHERE "productId" = (table "productId")
                AND "branchId" = (table "branchId")
                AND "finYearId" = (table "finYearId")
                RETURNING *
            )
            INSERT INTO "ProductOpBal" ("productId", "branchId", "finYearId", "qty", "openingPrice", "lastPurchaseDate")
                SELECT (table "productId"), (table "branchId"), (table "finYearId"), (table "qty"), (table "openingPrice"), (table "lastPurchaseDate")
            WHERE NOT EXISTS (SELECT 1 FROM updated);
    """

    # Assisted by AI
    def upsert_transfer_closing_balance(params):
        return sql.SQL(
            """
            DO $$
            DECLARE 
                "profitOrLoss" DECIMAL(17,2);
            BEGIN
                --with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
                --    with "branchId" AS (VALUES (1::int)), "finYearId" AS (VALUES (2024)),
                    
                    -- Step 1: Delete Old Balances
                    DELETE FROM "AccOpBal"
                    WHERE ("finYearId" = ({finYearId} + 1) AND "branchId" = {branchId}) 
                    OR "amount" = 0;
                    
                    -- Step 2: Aggregate Initial Balances (from AccOpBal & TranD)
                    with initial_data AS (
                        SELECT 
                            a."id" AS "accId",
                            SUM(CASE WHEN b."dc" = 'C' THEN -b."amount" ELSE b."amount" END) AS amount,
                            b."finYearId",
                            b."branchId"
                        FROM "AccM" a
                        JOIN "AccOpBal" b ON a."id" = b."accId"
                        WHERE b."finYearId" = {finYearId}
                            AND b."branchId" = {branchId}
                            AND a."accType" IN ('A', 'L')
                            AND a."accLeaf" IN ('Y', 'S')
                        GROUP BY a."id", b."finYearId", b."branchId"
                        
                        UNION ALL

                        SELECT 
                            a."id" AS "accId",
                            SUM(CASE WHEN t."dc" = 'C' THEN -t."amount" ELSE t."amount" END) AS amount,
                            h."finYearId",
                            h."branchId"
                        FROM "AccM" a
                        JOIN "TranD" t ON a."id" = t."accId"
                        JOIN "TranH" h ON h."id" = t."tranHeaderId"
                        WHERE h."finYearId" = {finYearId}
                            AND h."branchId" = {branchId}
                            AND a."accType" IN ('A', 'L')
                            AND a."accLeaf" IN ('Y', 'S')
                        GROUP BY a."id", h."finYearId", h."branchId"
                    ),
                    
                    -- Step 3: Summarized Account Balances
                    summarized_data AS (
                        SELECT "accId", SUM("amount") AS "amount"
                        FROM "initial_data"
                        GROUP BY "accId"
                    ),

                    -- Step 4: Calculate Profit or Loss
                    profit_or_loss AS (
                        SELECT COALESCE(
                            SUM(CASE WHEN "t"."dc" = 'D' THEN "t"."amount" ELSE -"t"."amount" END), 0
                        ) AS "profitOrLoss"
                        FROM "AccM" "a"
                        JOIN "TranD" "t" ON "a"."id" = "t"."accId"
                        JOIN "TranH" "h" ON "h"."id" = "t"."tranHeaderId"
                        WHERE "h"."finYearId" = {finYearId}
                            AND "h"."branchId" = {branchId}
                            AND "a"."accType" IN ('E', 'I')
                            AND "a"."accLeaf" IN ('Y', 'S')
                    ),

                    -- Step 5: Ensure Capital Account Exists
                    capital_account AS (
                        SELECT 4 AS "accId", 0 AS "amount"
                        WHERE NOT EXISTS (SELECT 1 FROM "summarized_data" WHERE "accId" = 4)
                    ),

                    -- Step 6: Combine Account Balances and Profit/Loss Adjustment
                    final_balances AS (
                        SELECT "accId", "amount" FROM "summarized_data"
                        UNION ALL
                        SELECT * FROM "capital_account"
                    ),

                    -- Step 7: Adjust Profit/Loss for Capital Account
                    updated_balances AS (
                        SELECT 
                            "fb"."accId", 
                            "fb"."amount" + COALESCE("pl"."profitOrLoss", 0) AS "amount"
                        FROM "final_balances" "fb"
                        LEFT JOIN "profit_or_loss" "pl" 
                            ON "fb"."accId" = (SELECT "id" FROM "AccM" WHERE "accCode" = 'Capital')
                    )
                    
                    -- Step 8: Insert Updated Balances
                    INSERT INTO "AccOpBal"("accId", "finYearId", "branchId", "amount", "dc")
                    SELECT "accId", 
                        ({finYearId} + 1), 
                        {branchId}, 
                        ABS("amount"), 
                        CASE WHEN "amount" < 0 THEN 'C' ELSE 'D' END
                    FROM "updated_balances";
                END $$;
            """
        ).format(
            finYearId=sql.Literal(params["finYearId"]),
            branchId=sql.Literal(params["branchId"]),
        )

    def upsert_unit_info(params):
        return sql.SQL(
            """
        do $$
        begin
            if exists( 
                select 1 from "Settings"	
                    where "key" = 'unitInfo') then
                        update "Settings"
                            set "jData" = {jData}
                                where "key" = 'unitInfo';
            else
            insert into "Settings" ("id", "key", "jData", "intValue")
                    values (2, 'unitInfo', {jData}, 0);
            end if;
        end $$;
    """
        ).format(jData=sql.Literal(params["jData"]))
