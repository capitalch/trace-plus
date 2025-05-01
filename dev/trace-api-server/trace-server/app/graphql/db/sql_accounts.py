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
                    COALESCE(c5."lastPurchasePrice", c4."openingPrice") AS "lastPurchasePrice",  
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
                    (COALESCE(c6."lastPurchasePrice", 0) * (1 + p."gstRate" / 100)) AS "lastPurchasePriceGst",  
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
                    (COALESCE(c6."openingPrice", 0) * (1 + p."gstRate" / 100)) AS "openingPriceGst"  
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
            "sale",   
            "saleDiscount",   
            "lastPurchasePrice",   
            "op",   
            "openingPrice",   
            "openingPriceGst"   
        FROM cte7
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
    get_extBusinessContactsAccM = """
        select * 
            from "ExtBusinessContactsAccM"
                where "accId" = %(accId)s
    """

    get_fin_years = """
        select "id", "startDate", "endDate"
                from "FinYearM" order by "id" DESC
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
        with "productCodeOrUpc" as (values(%(productCodeOrUpc)s))
        --with "productCodeOrUpc" as (values('1063'))
        select p."id" "productId",
			coalesce(o."openingPrice", p."purPrice", 0) as "lastPurchasePrice",
			c."catName",
			b."brandName",
			coalesce(p."hsn", c."hsn", 0) hsn,
			p."info",
			p."label",
			p."productCode",
			p."upcCode",
			coalesce(p."gstRate", 0) "gstRate"
            from "ProductM" p
                left join "ProductOpBal" o
                    on p."id" = o."productId"
                left join "CategoryM" c
                    on c."id" = p."catId"
                left join "BrandM" b
                    on b."id" = p."brandId"
            where ((p."productCode" = (table "productCodeOrUpc") or (p."upcCode" = (table "productCodeOrUpc")))) and p."isActive"
            order by p."id" limit 1
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

    get_sales_report = """
    --WITH "branchId" AS (VALUES (1)), "finYearId" AS (VALUES (2024)),"productCode" as (VALUES (null::text)), "catId" AS (VALUES (null::int)), "brandId" AS (VALUES (null::int)), "tagId" AS (VALUES (null::int)), "startDate" AS (VALUES ('2024-04-01' :: DATE)), "endDate" AS (VALUES ('2025-03-31' :: DATE)), "days" AS (VALUES (0)),
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
                 s."price", 
                 h."tranDate"
             FROM "TranH" h
             JOIN "TranD" d ON h.id = d."tranHeaderId"
             JOIN "SalePurchaseDetails" s ON d.id = s."tranDetailsId"
             WHERE 
                 s."productId" = cs."productId"
                 AND h."tranDate" <= cs."tranDate" -- Only purchases before sale date
                 AND "tranTypeId" = 5 -- purchase
                 AND COALESCE((TABLE "branchId"), "branchId") = "branchId"
                 AND "finYearId" = (TABLE "finYearId")
                 AND s."price" IS NOT NULL
                 AND s."price" <> 0
             ORDER BY h."tranDate" DESC
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
     cte_combined1 AS (
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
     cte_combined2 AS (
         SELECT c.*,
                COALESCE(qty * 
                         (c.price - COALESCE(c."lastPurchasePrice"
                                            , NULLIF(p."dealerPrice", 0)
                                            , NULLIF(p."purPrice", 0)))
                         , 0.00) AS "grossProfit"
         FROM cte_combined1 c
         LEFT JOIN "ProductM" p ON p.id = c."productId"
     ),

     -- Final Adjustment: Negate Values for Returns
     cte_final AS ( -- negate for sales return
         SELECT c."id",
                c."accId",
                c.accounts,
				c."brandName",
				c."catName",
				c."productCode",
				c."label",
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
                c."aggrSale",
                CASE WHEN "tranTypeId" = 4 THEN "qty" ELSE -"qty" END AS "qty",
                CASE WHEN "tranTypeId" = 4 THEN c."aggrSale" ELSE -c."aggrSale" END AS "aggrSale",
                CASE WHEN "tranTypeId" = 4 THEN "cgst" ELSE -"cgst" END AS "cgst",
                CASE WHEN "tranTypeId" = 4 THEN "sgst" ELSE -"sgst" END AS "sgst",
                CASE WHEN "tranTypeId" = 4 THEN "igst" ELSE -"igst" END AS "igst",
                CASE WHEN "tranTypeId" = 4 THEN "amount" ELSE -"amount" END AS "amount",
                CASE WHEN "tranTypeId" = 4 THEN 'Sale' ELSE 'Return' END AS "saleType",
                CASE WHEN "tranTypeId" = 4 THEN "grossProfit" ELSE -"grossProfit" END AS "grossProfit",
                date_part('day', COALESCE(c."tranDate"::timestamp, '2010-01-01'::timestamp) - COALESCE(c."lastPurchaseDate"::timestamp, '2010-01-01'::timestamp))::int as age

         FROM cte_combined2 c order by "tranDate", "salePurchaseDetailsId"
     )

        SELECT * FROM cte_final where age >= (table days)
    """
    
    get_sales_report2 = """
       -- with "branchId" as (values (1)), "finYearId" as (values (2024)), "tagId" as (values(0)), "startDate" as (values('2024-04-01' ::date)), "endDate" as (values('2025-03-31' ::date)), "days" as (values(0)),
            with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "tagId" as (values(%(tagId)s::int)), "startDate" as (values(%(startDate)s ::date)), "endDate" as (values(%(endDate)s:: date)), "days" as (values (COALESCE(%(days)s,0))),
            -- CTE1: Category leaf nodes
            cte1 as (
                with recursive rec as (
                    select id, "parentId", "isLeaf", "catName"
                    from "CategoryM"
                    where "tagId" = (select * from "tagId") or (select * from "tagId") = 0
                    
                    union
                    
                    select c.id, c."parentId", c."isLeaf", c."catName"
                    from "CategoryM" c
                    join rec on rec.id = c."parentId"
                ) 
                select * from rec where "isLeaf"
            ),

            -- CTE2: Transactions (sales, purchases, stock journals)
            cte2 as (
                select 
                    h.id, h.remarks as "commonRemarks", 
                    concat_ws(', ', d.remarks, s."jData"->>'remarks') as "lineRemarks", 
                    "tranDate", s."productId", "tranTypeId", "qty", 
                    ("price" - "discount") as "price", 
                    "cgst", "sgst", "igst", s.amount, "gstRate", 
                    s.id as "salePurchaseDetailsId", "autoRefNo", h.timestamp, 
                    concat_ws(' ', "contactName", "mobileNumber", "address1", "address2") as "contact",
                    '' as dc, s."jData"->>'serialNumbers' as "serialNumbers"
                from "TranH" h
                join "TranD" d on h.id = d."tranHeaderId"
                join "AccM" a on a.id = d."accId"
                join "SalePurchaseDetails" s on d.id = s."tranDetailsId"
                left join "Contacts" c on c.id = h."contactsId"
                where 
                    h."branchId" = (select * from "branchId") and 
                    h."finYearId" = (select * from "finYearId") and
                    "tranDate" <= (select * from "endDate") and
                    "tranTypeId" in (4, 5, 9, 10)
                
                union all
                
                select 
                    h.id, h.remarks as "commonRemarks", s."lineRemarks", "tranDate", 
                    s."productId", "tranTypeId", "qty", "price", 
                    0 as "cgst", 0 as "sgst", 0 as "igst", 0 as amount, 
                    0 as "gstRate", s.id as "salePurchaseDetailsId", 
                    "autoRefNo", h.timestamp, '' as contact, dc, 
                    s."jData"->>'serialNumbers'
                from "TranH" h
                join "StockJournal" s on h.id = s."tranHeaderId"
                where 
                    h."branchId" = (select * from "branchId") and 
                    h."finYearId" = (select * from "finYearId")
            ),

            -- CTE3: Non-sale account names
            cte3 as (
                select 
                    h.id, string_agg(a."accName", ', ') as accounts
                from "TranH" h
                join "TranD" d on h.id = d."tranHeaderId"
                join "AccM" a on a.id = d."accId"
                join "AccClassM" c on c.id = a."classId"
                where 
                    "tranTypeId" in (4, 5) and 
                    "accClass" <> 'sale' and 
                    h."branchId" = (select * from "branchId") and 
                    h."finYearId" = (select * from "finYearId")
                group by h.id
            ),

            -- CTE4: Sales with opening balances and last purchase info
            cte4 as (
                select 
                    c2.*, c3.accounts, p.qty as "opQty", p."openingPrice", 
                    p."lastPurchaseDate" as "opLastPurchaseDate",
                    (select distinct on ("productId") coalesce("price", 0)
                    from cte2
                    where "tranTypeId" in (5, 11) and 
                        "tranDate" <= c2."tranDate" and 
                        "productId" = c2."productId" and 
                        "price" is not null
                    order by "productId", "tranDate" desc, "salePurchaseDetailsId" desc) as "lastPurchasePrice",
                    (select distinct on ("productId") "tranDate"
                    from cte2
                    where "tranTypeId" in (5, 11) and 
                        "tranDate" <= c2."tranDate" and 
                        "productId" = c2."productId"
                    order by "productId", "tranDate" desc, "salePurchaseDetailsId" desc) as "lastPurchaseDate"
                from cte2 c2
                left join cte3 c3 on c2.id = c3.id
                left join "ProductOpBal" p on c2."productId" = p."productId" 
                    and p."branchId" = (select * from "branchId") 
                    and p."finYearId" = (select * from "finYearId")
                where c2."tranTypeId" in (4, 9)
            ),

            -- CTE5: Stock movements
            cte5 as (
                select 
                    "productId",
                    sum(case when "tranTypeId" = 4 then qty else 0 end) as sale,
                    sum(case when "tranTypeId" = 9 then qty else 0 end) as "saleRet",
                    sum(case when "tranTypeId" = 5 then qty else 0 end) as purchase,
                    sum(case when "tranTypeId" = 10 then qty else 0 end) as "purchaseRet",
                    sum(case when "tranTypeId" = 11 and dc = 'D' then qty else 0 end) as "stockJournalDebits",
                    sum(case when "tranTypeId" = 11 and dc = 'C' then qty else 0 end) as "stockJournalCredits"
                from cte2
                group by "productId"
            ),

            -- CTE6: Sales with gross profit and stock
            cte6 as (
                select 
                    c4."tranDate", c4."productId", c4.qty, c4.price, 
                    coalesce(c4."lastPurchasePrice", c4."openingPrice", 0) as "lastPurchasePrice",
                    coalesce(c4."lastPurchaseDate", c4."opLastPurchaseDate") as "lastPurchaseDate",
                    c4.qty * c4.price as "aggrSale",
                    c4.qty * (c4.price - coalesce(c4."lastPurchasePrice", c4."openingPrice", 0)) as "grossProfit",
                    c4.cgst, c4.sgst, c4.igst, c4.amount, c4."gstRate", 
                    c4."tranTypeId", c4."salePurchaseDetailsId", c4."autoRefNo", 
                    c4.contact, c4."commonRemarks", c4."lineRemarks", c4.accounts, 
                    c4."serialNumbers", c5.sale, c5."saleRet", c5.purchase, 
                    c5."purchaseRet", c5."stockJournalDebits", c5."stockJournalCredits",
                    coalesce(c4."opQty", 0) as op,
                    (coalesce(c4."opQty", 0) + c5.purchase - c5.sale - c5."purchaseRet" + 
                    c5."saleRet" + c5."stockJournalDebits" - c5."stockJournalCredits") as stock
                from cte4 c4
                left join cte5 c5 on c4."productId" = c5."productId"
            ),

            -- CTE7: Final result with adjustments
            cte7 as (
                select 
                    c6."tranDate", c6."productId", c6.price, c6."lastPurchasePrice", 
                    c6."gstRate", c6."tranTypeId", c6."salePurchaseDetailsId", 
                    c6."autoRefNo", c6.contact, c6."commonRemarks", c6."lineRemarks",
                    case when c6."tranTypeId" = 4 then c6.qty else -c6.qty end as qty,
                    case when c6."tranTypeId" = 4 then c6."aggrSale" else -c6."aggrSale" end as "aggrSale",
                    case when c6."tranTypeId" = 4 then c6.cgst else -c6.cgst end as cgst,
                    case when c6."tranTypeId" = 4 then c6.sgst else -c6.sgst end as sgst,
                    case when c6."tranTypeId" = 4 then c6.igst else -c6.igst end as igst,
                    case when c6."tranTypeId" = 4 then c6.amount else -c6.amount end as amount,
                    case when c6."tranTypeId" = 4 then 'Sale' else 'Return' end as "saleType",
                    case when c6."tranTypeId" = 4 then c6."grossProfit" else -c6."grossProfit" end as "grossProfit",
                    c6."lastPurchaseDate", c6.stock, c6.accounts, c6."serialNumbers",
                    p."productCode", c."catName", b."brandName", p.label, p.info,
                    date_part('day', c6."tranDate"::timestamp - c6."lastPurchaseDate"::timestamp) as age
                from cte6 c6
                join "ProductM" p on p.id = c6."productId"
                join cte1 c on c.id = p."catId"
                join "BrandM" b on b.id = p."brandId"
                where c6."tranDate" between (select * from "startDate") and (select * from "endDate")
                order by c6."tranDate", c6."salePurchaseDetailsId"
            )

            select * from cte7 where age >= (select * from "days");
    
    """
    
    get_sales_report1 = """
        --with "branchId" as (values (1)), "finYearId" as (values (2024)), "tagId" as (values(0)), "startDate" as (values('2024-04-01' ::date)), "endDate" as (values('2025-03-31' ::date)), "days" as (values(0)),
        with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "tagId" as (values(%(tagId)s::int)), "startDate" as (values(%(startDate)s ::date)), "endDate" as (values(%(endDate)s:: date)), "days" as (values (COALESCE(%(days)s,0))),
        cte as ( --filter on tagId in CategoryM
            with recursive rec as (
            select id, "parentId", "isLeaf", "catName"
                from "CategoryM"
                    where (("tagId" = (table "tagId")) or ((table "tagId") = 0))
            union
            select c.id, c."parentId", c."isLeaf", c."catName"
                from "CategoryM" c
                    join rec on
                        rec."id" = c."parentId"
            ) select * from rec where "isLeaf"
        ),
        
        cte0 as( --base cte: from tranD where 4,5,9,10, branchId, finYearId, tranDate <= endDate
        select h."id",h."remarks" as "commonRemarks", CONCAT_WS(', ', d.remarks, s."jData"->'remarks') as "lineRemarks", "tranDate", s."productId", "tranTypeId", "qty", ("price" - "discount") "price", "cgst", "sgst","igst"
            , s."amount", "gstRate", s."id" as "salePurchaseDetailsId", "autoRefNo", h."timestamp" , concat_ws(' ', "contactName", "mobileNumber", "address1", "address2") as "contact"
            , '' as "dc", s."jData"->>'serialNumbers' as "serialNumbers"
            from "TranH" h
                join "TranD" d
                    on h."id" = d."tranHeaderId"
                join "AccM" a
                            on a."id" = d."accId"
                join "SalePurchaseDetails" s
                    on d."id" = s."tranDetailsId"
                left join "Contacts" c
                    on c."id" = h."contactsId"
                where "branchId" = (table "branchId") and "finYearId" = (table "finYearId")
                and "tranDate" <=(table "endDate")
                and "tranTypeId" in (4, 5, 9, 10)
            union all
        select h."id",h."remarks" as "commonRemarks", s."lineRemarks" as "lineRemarks", "tranDate", s."productId", "tranTypeId", "qty", "price", 0 as "cgst", 0 as "sgst", 0 as "igst"
            , 0 as "amount", 0 as "gstRate", s."id" as "salePurchaseDetailsId", "autoRefNo", h."timestamp", '' as "contact"
            , "dc", s."jData"->>'serialNumbers' as "serialNumbers"
            from "TranH" h
                join "StockJournal" s
                    on h."id" = s."tranHeaderId"
            where "branchId" = (table "branchId") and "finYearId" = (table "finYearId")
        ),
		
		cte00 as ( -- get account names other than sale
		select h."id", string_agg(a."accName", ', ') as "accounts"
		from "TranH" h
			join "TranD" d
				on h."id" = d."tranHeaderId"
			join "AccM" a
				on a."id" = d."accId"
			join "AccClassM" c
				on c.id = a."classId"
		where ("tranTypeId" in (4,5)) and ("accClass" <> 'sale') and "branchId" = (table "branchId") and "finYearId" = (table "finYearId")
		group by h."id"),
		
        cte1 as( --from ProductOpBal where branch, finYear
            select "productId","qty", "openingPrice", "lastPurchaseDate"
                from "ProductOpBal" p 
                where "branchId" = (table "branchId") and "finYearId" = (table "finYearId")
        ), 
        cte2 as( -- compute last purchase date and last purchase price till sale date
            select c0.*, accounts, (
                select distinct on("productId") coalesce("price",0) as "price"
					from cte0
						where ("tranTypeId" in (5,11) and ("tranDate" <= c0."tranDate") and ("productId" = c0."productId") and ("price" <> 0) and ("price" is not null))
					order by "productId", "tranDate" DESC, "salePurchaseDetailsId" DESC
				
            ) as "lastPurchasePrice",
			(
				select distinct on("productId") "tranDate"
					from cte0
						where ("tranTypeId" in (5,11) and ("tranDate" <= c0."tranDate") and ("productId" = c0."productId"))
					order by "productId", "tranDate" DESC, "salePurchaseDetailsId" DESC
            ) as "lastPurchaseDate"
                from cte0 c0
					left join cte00 as c00
						on c0."id" = c00."id"
            where "tranTypeId" in (4, 9)
        ),
        
        cte3 as ( -- using ProductOpBal fill for missing lastPurchasePrice and lastPurchaseDate (c1 is ProductOpBal)
                select "tranDate", c2."productId", c2."qty", "price", "timestamp", "accounts","contact","commonRemarks","lineRemarks"
                , coalesce("lastPurchasePrice","openingPrice",0) as "lastPurchasePrice"
                , coalesce(c2."lastPurchaseDate", c1."lastPurchaseDate") as "lastPurchaseDate"
                , c2."qty" * "price" as "aggrSale", "cgst", "sgst", "igst"
                , "amount", "gstRate", "tranTypeId","salePurchaseDetailsId", "autoRefNo", c2."serialNumbers"
                    from cte2 c2
                        left join cte1 c1
                            on c2."productId" = c1."productId"
        ),
        
        cte4 as ( -- compute gross profit
                select cte3.*, "qty" * ("price" - "lastPurchasePrice") as "grossProfit"
                    from cte3
            
        ),
        cte5 as ( --negate for sales return
                select "tranDate", "productId", "price", "lastPurchasePrice", "gstRate","tranTypeId","salePurchaseDetailsId", "autoRefNo" , "contact","commonRemarks","lineRemarks"
                , CASE when "tranTypeId" = 4 then "qty" else -"qty" end as "qty"
                , CASE when "tranTypeId" = 4 then "aggrSale" else -"aggrSale" end as "aggrSale"
                , CASE when "tranTypeId" = 4 then "cgst" else -"cgst" end as "cgst"
                , CASE when "tranTypeId" = 4 then "sgst" else -"sgst" end as "sgst"
                , CASE when "tranTypeId" = 4 then "igst" else -"igst" end as "igst"
                , CASE when "tranTypeId" = 4 then "amount" else -"amount" end as "amount"
                , CASE when "tranTypeId" = 4 then 'Sale' else 'Return' end as "saleType"
                , CASE when "tranTypeId" = 4 then "grossProfit" else -"grossProfit" end as "grossProfit"
                , "lastPurchaseDate", "timestamp", "accounts", "serialNumbers"
                    from cte4
        ),
        cte6 as ( --for stock: cte0-> group by on productId, saleType, get columns as sale, ret, purchase
            select "productId","tranTypeId", 
                    SUM(CASE WHEN "tranTypeId" = 4 THEN "qty" ELSE 0 END) as "sale"
                    , SUM(CASE WHEN "tranTypeId" = 9 THEN "qty" ELSE 0 END) as "saleRet"
                    , SUM(CASE WHEN "tranTypeId" = 5 THEN "qty" ELSE 0 END) as "purchase"
                    , SUM(CASE WHEN "tranTypeId" = 10 THEN "qty" ELSE 0 END) as "purchaseRet"
                    , SUM(CASE WHEN (("tranTypeId" = 11) and ("dc" = 'D')) THEN "qty" ELSE 0 END) as "stockJournalDebits"
                    , SUM(CASE WHEN (("tranTypeId" = 11) and ("dc" = 'C')) THEN "qty" ELSE 0 END) as "stockJournalCredits"
                from cte0
                    group by "productId", "tranTypeId" 
                    order by "productId", "tranTypeId"
        ),
        cte7 as ( -- sum up using group by to get rid of multiple productId
            select "productId"
            , SUM("sale") as "sale"
            , SUM("saleRet") as "saleRet"
            , SUM("purchase") as "purchase"
            , SUM("purchaseRet") as "purchaseRet"
            , SUM("stockJournalDebits") as "stockJournalDebits"
            , SUM("stockJournalCredits") as "stockJournalCredits"
            from cte6
                group by "productId"
                order by "productId"
        ), 
        cte8 as ( --cte7 + cte1 -> combine op bal to get opening stock figure, also compute closing stock
            select c7."productId"
                , coalesce(c1.qty,0) as "op"
                , "sale"
                , "purchase"
                , "saleRet"
                , "purchaseRet"
                , "stockJournalDebits"
                , "stockJournalCredits"
                , (coalesce(c1.qty,0) + "purchase" - "sale" - "purchaseRet" + "saleRet" + "stockJournalDebits" - "stockJournalCredits") as "stock"
                    from cte7 c7
                        left join cte1 c1
                            on c1."productId" = c7."productId"
                    order by "productId"
        ), cte9 as
        (select c5.*, "productCode", 
		 "catName", 
		 "brandName", "label", "stock", "info" 
                -- ,(date_part('day', (CASE WHEN (table "endDate") > CURRENT_DATE then CURRENT_DATE ELSE (table "endDate") END)::timestamp - "lastPurchaseDate"::timestamp)) as "age"
				,(date_part('day', ("tranDate")::timestamp - "lastPurchaseDate"::timestamp)) as "age"
            from cte5 c5
                join "ProductM" p
                    on p."id" = c5."productId"
                join cte c --"CategoryM" c
                    on c."id" = p."catId"
                join "BrandM" b
                    on b.id = p."brandId"
                join cte8 c8
                    on c5."productId" = c8."productId"
            where "tranDate" between (table "startDate") and (table "endDate")
                order by "tranDate", "salePurchaseDetailsId") 
            select * from cte9 where "age" >= (table "days")
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
    increment_last_no = """
        WITH "finYearId" as (values (%(finYearId)s::int)), "branchId" as (values (%(branchId)s::int)), "tranTypeId" as (values (%(tranTypeId)s::int))
        --with "finYearId" as (VALUES (2024::int)), "branchId" as (VALUES (1::int)), "tranTypeId" as (VALUES (12::int))
            UPDATE "TranCounter"
            SET "lastNo" = "lastNo" + 1
            WHERE "finYearId" = (table "finYearId")
            AND "branchId" = (table "branchId")
            AND "tranTypeId" = (table "tranTypeId")
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
