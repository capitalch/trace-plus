set search_path to capitalchowringhee; -- Stock summary report with correct ageing
 WITH "branchId" AS (VALUES (NULL::INT)), "finYearId" AS (VALUES (2025)), "catId" AS (VALUES (NULL::INT)), "brandId"   AS (VALUES (NULL::INT)), "tagId" AS (VALUES (NULL::INT)), "onDate"    AS (VALUES (CURRENT_DATE)), "days" AS (VALUES (0)), "grossProfitFilter" AS (VALUES (0)),          
        --with "branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "tagId" as (values(%(tagId)s::int)), "brandId" as (values(%(brandId)s::int)), "catId" as (values(%(catId)s::int)), "onDate" as (values(%(onDate)s ::date)), "days" as (values(%(days)s::int)), "grossProfitFilter" as (values(%(grossProfitFilter)s::int)),
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
                    ("price" - "discount") AS "price", "discount", "tranDate", '' AS "dc"
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
                    "price", 0 AS "discount", "tranDate", "dc"
                FROM "TranH" h
                JOIN "StockJournal" s ON h."id" = s."tranHeaderId"
                WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)

                UNION ALL

                -- Branch Transfer Credits
                SELECT 
                    h."id", "productId", "tranTypeId", "qty", 
                    "price", 0 AS "discount", "tranDate", 'C' AS "dc"
                FROM "TranH" h
                JOIN "BranchTransfer" b ON h."id" = b."tranHeaderId"
                WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
                    AND "finYearId" = (TABLE "finYearId")
                    AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)

                UNION ALL

                -- Branch Transfer Debits
                SELECT 
                    h."id", "productId", "tranTypeId", "qty", 
                    "price", 0 AS "discount", "tranDate", 'D' AS "dc"
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
                        WHEN "tranTypeId" = 4 THEN "qty" * ("price" - "discount" - COALESCE("lastTranPurchasePrice", "openingPrice", "purPrice"))
                        WHEN "tranTypeId" = 9 THEN -"qty" * ("price" - "discount" - COALESCE("lastTranPurchasePrice", "openingPrice", "purPrice"))
                        ELSE 0
                    END AS "grossProfit"
                FROM cte00
            ),

            -- ========== AGGREGATE TRANSACTION TYPES ==========
            cte2 AS (
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
                    MAX(CASE WHEN "tranTypeId" IN (5,11) THEN "tranDate" END) AS "lastPurchaseDate",
                    SUM(
                        CASE 
                            WHEN "tranTypeId" = 4 THEN "grossProfit"
                            WHEN "tranTypeId" = 9 THEN -("grossProfit")
                            ELSE 0
                        END
                    ) AS "grossProfit"
                FROM cte000
                GROUP BY "productId", "tranTypeId"
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
                -- DATE_PART('day', COALESCE((TABLE "onDate"), CURRENT_DATE::timestamp) - "lastPurchaseDate"::timestamp) AS "age",
                --WHERE date_part('day', CURRENT_DATE::timestamp - COALESCE("lastPurchaseDate"::timestamp, (CURRENT_DATE - 360)::timestamp)) >= COALESCE((TABLE "days"), 0)
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
                    "lastPurchaseDate", "lastSaleDate",
                    --DATE_PART('day', COALESCE((TABLE "onDate"), CURRENT_DATE::timestamp) - "lastPurchaseDate"::timestamp) AS "age",
                    "info", "grossProfit", "age"
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
 --select * from cte8 where age < 0 -- where "tempAge" is null --<> "tempAge"
            -- ========== FINAL OUTPUT ==========
            --select SUM(op) op, SUM(dr) dr, SUM(cr) cr, SUM(clos) clos, sum("grossProfit") gp from cte8 c8
            SELECT * FROM cte8 c8
                where (((TABLE "grossProfitFilter") = 0)
                OR (((TABLE "grossProfitFilter") = 1) AND c8."grossProfit" >= 0)
                OR (((TABLE "grossProfitFilter") = -1) AND c8."grossProfit" < 0))