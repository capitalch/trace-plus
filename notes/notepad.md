# Testing
- Initial
    - Pft         : 3,596,253.39
    - 1256,1257,1258 code 0 stock
- Purchase
    - code 1256 5 pcs, price: 353,002.47. amt: 2,082,715
    - Pft         : 1,513,538.39
    - stk         : 81,182,490.54
    - stk 1256    : 5
- Stk Jrnl
    - 1 pc 1256 break to 1257 + 1258
    - pft         : 1,513,538.39
    - stk         : 80,829,488.07
    - output product price is set to 0. So stock reduces by val of consumed product, Thus final profit reduces by value of consumed product

- To do
    - If output product already has value, don't change it. Otherwise change the value to final journal value




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