set search_path to capitalchowringhee; -- get_sales_report
--WITH "branchId" AS (VALUES (1)), "finYearId" AS (VALUES (2025)), "productCode" as (VALUES (null::text)), "catId" AS (VALUES (null::int)), "brandId" AS (VALUES (null::int)), "tagId" AS (VALUES (null::int)), "startDate" AS (VALUES ('2025-04-01' :: DATE)), "endDate" AS (VALUES ('2026-03-31' :: DATE)), "days" AS (VALUES (0)),
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
                    --left join "StockJournal" j on h.id = j."tranHeaderId"
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
