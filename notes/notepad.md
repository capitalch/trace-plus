# trace-plus inventory report
get_stock_summary_report = """
        -- ========================================
-- STOCK REGISTER REPORT WITH GROSS PROFIT
-- ========================================
-- This query generates a comprehensive stock register showing:
-- - Opening balance, purchases, sales, returns
-- - Stock journals and branch transfers
-- - Closing stock with valuation
-- - Gross profit analysis
-- - Product ageing based on last purchase date

-- ========== DEFAULT PARAMETER VALUES (FOR TESTING) ==========
-- WITH "branchId" AS (VALUES (NULL::INT)), 
--      "finYearId" AS (VALUES (2024)), 
--      "catId" AS (VALUES (NULL::INT)), 
--      "brandId" AS (VALUES (NULL::INT)), 
--      "tagId" AS (VALUES (NULL::INT)), 
--      "onDate" AS (VALUES (CURRENT_DATE)), 
--      "days" AS (VALUES (0)), 
--      "grossProfitFilter" AS (VALUES (0)),

-- ========== RUNTIME PARAMETERS ==========
WITH "branchId" AS (VALUES(%(branchId)s::INT)), 
     "finYearId" AS (VALUES(%(finYearId)s::INT)), 
     "tagId" AS (VALUES(%(tagId)s::INT)), 
     "brandId" AS (VALUES(%(brandId)s::INT)), 
     "catId" AS (VALUES(%(catId)s::INT)), 
     "onDate" AS (VALUES(%(onDate)s::DATE)), 
     "days" AS (VALUES(%(days)s::INT)), 
     "grossProfitFilter" AS (VALUES(%(grossProfitFilter)s::INT)),

-- ========== PRODUCT FILTER ==========
-- Get filtered products based on brand, category, or tag
"cteProduct" AS (
    SELECT * 
    FROM get_products_on_brand_category_tag(
        (TABLE "brandId"),
        (TABLE "catId"),
        (TABLE "tagId")
    )
),

-- ========== TRANSACTIONS UNION ==========
-- Combine all transaction types: Sales, Purchases, Stock Journals, Branch Transfers
cte0 AS (
    -- Sales & Purchases (tranTypeId: 4=Sale, 5=Purchase, 9=SaleReturn, 10=PurchaseReturn)
    SELECT 
        h."id", 
        "productId", 
        "tranTypeId", 
        "qty", 
        ("price" - "discount") AS "price", 
        "tranDate", 
        '' AS "dc"
    FROM "TranH" h
    JOIN "TranD" d ON h."id" = d."tranHeaderId"
    JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"
    WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
        AND "finYearId" = (TABLE "finYearId")
        AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)

    UNION ALL

    -- Stock Journals (tranTypeId: 11, dc: D=Debit, C=Credit)
    SELECT 
        h."id", 
        "productId", 
        "tranTypeId", 
        "qty", 
        "price", 
        "tranDate", 
        "dc"
    FROM "TranH" h
    JOIN "StockJournal" s ON h."id" = s."tranHeaderId"
    WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
        AND "finYearId" = (TABLE "finYearId")
        AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)

    UNION ALL

    -- Branch Transfer Credits (tranTypeId: 12, Stock IN to this branch)
    SELECT 
        h."id", 
        "productId", 
        "tranTypeId", 
        "qty", 
        "price", 
        "tranDate", 
        'C' AS "dc"
    FROM "TranH" h
    JOIN "BranchTransfer" b ON h."id" = b."tranHeaderId"
    WHERE COALESCE((TABLE "branchId"), "branchId") = "branchId"
        AND "finYearId" = (TABLE "finYearId")
        AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)

    UNION ALL

    -- Branch Transfer Debits (tranTypeId: 12, Stock OUT from this branch)
    SELECT 
        h."id", 
        "productId", 
        "tranTypeId", 
        "qty", 
        "price", 
        "tranDate", 
        'D' AS "dc"
    FROM "TranH" h
    JOIN "BranchTransfer" b ON h."id" = b."tranHeaderId"
    WHERE COALESCE((TABLE "branchId"), "destBranchId") = "destBranchId"
        AND "finYearId" = (TABLE "finYearId")
        AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)
),

-- ========== OPENING BALANCES ==========
-- Get opening stock quantities and prices for each product
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

-- ========== ADD LAST TRANSACTION PURCHASE PRICE ==========
-- For each transaction, find the most recent purchase price before that transaction
-- This is used for gross profit calculation
cte00 AS (
    SELECT 
        c0.*, 
        (
            SELECT DISTINCT ON ("productId") "price"
            FROM cte0
            WHERE "tranTypeId" IN (5, 11)  -- Purchase or Stock Journal
                AND "tranDate" <= c0."tranDate"
                AND "productId" = c0."productId"
                AND "price" IS NOT NULL 
                AND "price" <> 0
                AND dc <> 'C'  -- Exclude credit entries
            ORDER BY "productId", "tranDate" DESC, "id" DESC
        ) AS "lastTranPurchasePrice",
        "openingPrice",
        p."purPrice"
    FROM cte0 c0
    LEFT JOIN cte1 c1 ON c1."productId" = c0."productId"
    JOIN "ProductM" p ON p.id = c0."productId"
),

-- ========== CALCULATE GROSS PROFIT ==========
-- Gross Profit = Sale Price - Last Purchase Price (for sales only)
cte000 AS (
    SELECT 
        cte00.*,
        CASE 
            WHEN "tranTypeId" = 4 THEN  -- Sale
                "qty" * ("price" - COALESCE("lastTranPurchasePrice", "openingPrice"))
            WHEN "tranTypeId" = 9 THEN  -- Sale Return (negative profit)
                -"qty" * ("price" - COALESCE("lastTranPurchasePrice", "openingPrice"))
            ELSE 0
        END AS "grossProfit"
    FROM cte00
),

-- ========== AGGREGATE TRANSACTION TYPES ==========
-- Group transactions by product and type, sum quantities
cte22 AS (
    SELECT 
        "productId", 
        "tranTypeId",
        SUM(CASE WHEN "tranTypeId" = 4 THEN "qty" ELSE 0 END) AS "sale",
        SUM(CASE WHEN "tranTypeId" = 9 THEN "qty" ELSE 0 END) AS "saleRet",
        SUM(CASE WHEN "tranTypeId" = 5 THEN "qty" ELSE 0 END) AS "purchase",
        SUM(CASE WHEN "tranTypeId" = 10 THEN "qty" ELSE 0 END) AS "purchaseRet",
        SUM(CASE WHEN "tranTypeId" = 11 AND "dc" = 'D' THEN "qty" ELSE 0 END) AS "stockJournalDebits",
        SUM(CASE WHEN "tranTypeId" = 11 AND "dc" = 'C' THEN "qty" ELSE 0 END) AS "stockJournalCredits",
        SUM(CASE WHEN "tranTypeId" = 12 AND "dc" = 'D' THEN "qty" ELSE 0 END) AS "branchTransferDebits",
        SUM(CASE WHEN "tranTypeId" = 12 AND "dc" = 'C' THEN "qty" ELSE 0 END) AS "branchTransferCredits",
        MAX(CASE WHEN "tranTypeId" = 4 THEN "tranDate" END) AS "lastSaleDate",
        SUM("grossProfit") AS "grossProfit",
        MAX("lastTranPurchasePrice") AS "lastTranPurchasePrice"
    FROM cte000
    GROUP BY "productId", "tranTypeId"
),

-- ========== GET LAST PURCHASE DATE ==========
-- Find the most recent purchase/stock journal date for each product (excluding credits)
cte222 AS (
    SELECT 
        c0."productId",
        MAX("tranDate") AS "lastPurchaseDate"
    FROM cte000 c0 
    LEFT JOIN cte22 c22 ON c0."productId" = c22."productId"
    WHERE c0."tranTypeId" IN (5, 11)  -- Purchase or Stock Journal
        AND dc <> 'C'  -- Exclude credit entries
    GROUP BY c0."productId"
),

-- ========== COMBINE AGGREGATIONS WITH LAST PURCHASE DATE ==========
cte2 AS (
    SELECT 
        c22.*, 
        c222."lastPurchaseDate"
    FROM cte22 AS c22 
    LEFT JOIN cte222 AS c222 ON c22."productId" = c222."productId"
),

-- ========== COMBINE ALL TRANSACTION TYPES BY PRODUCT ==========
-- Sum all transaction types for each product
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
        MAX("lastPurchaseDate") AS "lastPurchaseDate",
        MAX("lastTranPurchasePrice") AS "lastTranPurchasePrice"
    FROM cte2
    GROUP BY "productId"
),

-- ========== MERGE OPENING BALANCE WITH TRANSACTIONS ==========
-- Combine opening balances with transaction summaries
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
        "lastTranPurchasePrice",
        "openingPrice", 
        "lastSaleDate"
    FROM cte1 c1
    FULL JOIN cte3 c3 ON c1."productId" = c3."productId"
),

-- ========== GET DISTINCT LAST PURCHASE PRICE ==========
-- Get the most recent purchase price for each product
cte5 AS (
    SELECT DISTINCT ON ("productId") 
        "productId", 
        "price" AS "lastPurchasePrice"
    FROM cte0
    WHERE "tranTypeId" = 5  -- Purchase only
    ORDER BY "productId", "tranDate" DESC
),

-- ========== CALCULATE CLOSING STOCK & VALUES ==========
-- Calculate closing quantities and values
-- Closing Stock = Opening + Purchase + SaleReturn + StockJournalDebits + BranchTransferDebits
--               - Sale - PurchaseReturn - StockJournalCredits - BranchTransferCredits
cte6 AS (
    SELECT 
        COALESCE(c4."productId", c5."productId") AS "productId",
        COALESCE("openingPrice", 0) AS "openingPrice",
        "op", 
        (COALESCE("op", 0) * COALESCE("openingPrice", 0))::NUMERIC(12,2) AS "opValue",
        "sale", 
        "purchase", 
        "saleRet", 
        "purchaseRet",
        "stockJournalDebits", 
        "stockJournalCredits",
        "branchTransferDebits", 
        "branchTransferCredits",
        -- Price priority: lastPurchasePrice > openingPrice > lastTranPurchasePrice > purPrice
        CASE
            WHEN COALESCE("lastPurchasePrice", 0) > 0 THEN "lastPurchasePrice"
            WHEN COALESCE("openingPrice", 0) > 0 THEN "openingPrice"
            WHEN COALESCE("lastTranPurchasePrice", 0) > 0 THEN "lastTranPurchasePrice"                        
            ELSE "purPrice"
        END AS "lastPurchasePrice",
        "lastPurchaseDate", 
        "lastSaleDate",
        -- Calculate closing stock
        COALESCE(
            "op" + "purchase" - "purchaseRet" - "sale" + "saleRet" + 
            "stockJournalDebits" - "stockJournalCredits" + 
            "branchTransferDebits" - "branchTransferCredits", 0
        ) AS "clos",
        "grossProfit",
        -- Calculate temporary age (days since last purchase)
        DATE_PART('day', 
            COALESCE((TABLE "onDate"), CURRENT_DATE::TIMESTAMP) - 
            COALESCE("lastPurchaseDate"::TIMESTAMP, (CURRENT_DATE - 360)::TIMESTAMP)
        ) AS "tempAge"
    FROM cte4 c4
    FULL JOIN cte5 c5 ON c4."productId" = c5."productId"
    JOIN "ProductM" p ON p.id = c4."productId"
),

-- ========== ADJUST AGE FOR ZERO CLOSING STOCK ==========
-- If closing stock is zero, calculate age from last sale date instead
cte7 AS (
    SELECT 
        c6.*,
        CASE 
            WHEN clos = 0 THEN 
                DATE_PART('day', 
                    COALESCE("lastSaleDate", (TABLE "onDate"), CURRENT_DATE::TIMESTAMP) - 
                    "lastPurchaseDate"::TIMESTAMP
                )
            ELSE "tempAge" 
        END AS "age"
    FROM cte6 c6
),

-- ========== FINAL JOIN WITH PRODUCT INFO ==========
-- Join with product, category, and brand master tables for display names
cte8 AS (
    SELECT 
        p."id" AS "productId", 
        "productCode", 
        "catName", 
        "brandName", 
        "label",
        "brandName" || ' ' || "label" AS "product",
        "openingPrice", 
        COALESCE("op", 0)::NUMERIC(10,2) AS "op", 
        "opValue",
        -- Debit side: Purchases + Returns IN + Adjustments IN
        (COALESCE("purchase", 0) + COALESCE("saleRet", 0) + 
         COALESCE("stockJournalDebits", 0) + COALESCE("branchTransferDebits", 0))::NUMERIC(10,2) AS "dr",
        -- Credit side: Sales + Returns OUT + Adjustments OUT
        (COALESCE("sale", 0) + COALESCE("purchaseRet", 0) + 
         COALESCE("stockJournalCredits", 0) + COALESCE("branchTransferCredits", 0))::NUMERIC(10,2) AS "cr",
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
        "lastPurchaseDate", 
        "lastSaleDate", 
        "info", 
        "grossProfit", 
        "age"
    FROM cte7 c7
    RIGHT JOIN "cteProduct" p ON p."id" = c7."productId"
    JOIN "CategoryM" c ON c."id" = p."catId"
    JOIN "BrandM" b ON b."id" = p."brandId"
    WHERE NOT (
        -- Exclude products with no activity (all zeros)
        "clos" = 0 AND "op" = 0 AND "sale" = 0 AND "purchase" = 0 AND 
        "saleRet" = 0 AND "purchaseRet" = 0 AND "stockJournalDebits" = 0 AND "stockJournalCredits" = 0
    )
    AND GREATEST("age", 0) >= COALESCE((TABLE "days"), 0)  -- Filter by minimum age
    ORDER BY "catName", "brandName", "label"
)

-- ========== MAIN QUERY WITH GROSS PROFIT FILTER ==========
-- grossProfitFilter: 0=All, 1=Profit only (>=0), -1=Loss only (<0)
SELECT * 
FROM cte8 c8
WHERE (
    ((TABLE "grossProfitFilter") = 0)  -- Show all
    OR (((TABLE "grossProfitFilter") = 1) AND c8."grossProfit" >= 0)  -- Profitable items only
    OR (((TABLE "grossProfitFilter") = -1) AND c8."grossProfit" < 0)  -- Loss-making items only
);

    """

# Trace inventory report
"get_stock_summary":'''
        -- Parameter definitions
WITH "branchId" AS (VALUES(NULL::INT)), 
     "finYearId" AS (VALUES(2024)),
     "tagId" AS (VALUES(0)), 
     "onDate" AS (VALUES(CURRENT_DATE)), 
     "isAll" AS (VALUES(TRUE)), 
     "days" AS (VALUES(0)), 
     "type" AS (VALUES('cat')), 
     "value" AS (VALUES(0)),

-- Parameterized values
WITH "branchId" AS (VALUES(%(branchId)s::INT)), 
     "finYearId" AS (VALUES(%(finYearId)s::INT)), 
     "onDate" AS (VALUES(%(onDate)s::DATE)), 
     "isAll" AS (VALUES(%(isAll)s::BOOLEAN)), 
     "days" AS (VALUES(%(days)s::INT)), 
     "type" AS (VALUES(%(type)s::TEXT)), 
     "value" AS (VALUES(%(value)s::INT)),     

-- Get product IDs based on brand/category/tag
"cteProduct" AS (
    SELECT * 
    FROM get_productids_on_brand_category_tag((TABLE "type"), (TABLE "value"))
),

-- Base CTE: Combine all transaction types
cte0 AS (
    -- Sales and Purchase transactions
    SELECT h."id", 
           "productId", 
           "tranTypeId", 
           "qty", 
           ("price" - "discount") AS "price", 
           "discount", 
           "tranDate", 
           '' AS "dc"
    FROM "TranH" h
    JOIN "TranD" d ON h."id" = d."tranHeaderId"
    JOIN "SalePurchaseDetails" s ON d."id" = s."tranDetailsId"
    WHERE (COALESCE((TABLE "branchId"), "branchId") = "branchId")
      AND "finYearId" = (TABLE "finYearId")
      AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)
    
    UNION ALL
    
    -- Stock Journal transactions
    SELECT h."id", 
           "productId", 
           "tranTypeId", 
           "qty", 
           "price", 
           0 AS "discount", 
           "tranDate", 
           "dc"
    FROM "TranH" h
    JOIN "StockJournal" s ON h."id" = s."tranHeaderId"
    WHERE (COALESCE((TABLE "branchId"), "branchId") = "branchId")
      AND "finYearId" = (TABLE "finYearId")
      AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)
    
    UNION ALL
    
    -- Branch Transfer Credits
    SELECT h."id", 
           "productId", 
           "tranTypeId", 
           "qty", 
           "price", 
           0 AS "discount", 
           "tranDate", 
           'C' AS "dc"
    FROM "TranH" h
    JOIN "BranchTransfer" b ON h."id" = b."tranHeaderId"
    WHERE (COALESCE((TABLE "branchId"), "branchId") = "branchId")
      AND "finYearId" = (TABLE "finYearId")
      AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)
    
    UNION ALL
    
    -- Branch Transfer Debits
    SELECT h."id", 
           "productId", 
           "tranTypeId", 
           "qty", 
           "price", 
           0 AS "discount", 
           "tranDate", 
           'D' AS "dc"
    FROM "TranH" h
    JOIN "BranchTransfer" b ON h."id" = b."tranHeaderId"
    WHERE (COALESCE((TABLE "branchId"), "destBranchId") = "destBranchId")
      AND "finYearId" = (TABLE "finYearId")
      AND "tranDate" <= COALESCE((TABLE "onDate"), CURRENT_DATE)
),

-- Opening Balance
cte1 AS (
    SELECT "productId", 
           SUM("qty") AS "qty", 
           MAX("openingPrice") AS "openingPrice", 
           MAX("lastPurchaseDate") AS "lastPurchaseDate"
    FROM "ProductOpBal" p 
    WHERE (COALESCE((TABLE "branchId"), "branchId") = "branchId")
      AND "finYearId" = (TABLE "finYearId")
    GROUP BY "productId"
),

-- Add last transaction purchase price
cte00 AS (
    SELECT c0.*,
           (
               SELECT DISTINCT ON("productId") "price"
               FROM cte0
               WHERE ("tranTypeId" IN (5, 11)) 
                 AND ("tranDate" <= c0."tranDate") 
                 AND ("productId" = c0."productId") 
                 AND (c0."price" IS NOT NULL) 
                 AND (c0."price" <> 0)
               ORDER BY "productId", "tranDate" DESC, "id" DESC
           ) AS "lastTranPurchasePrice",
           "openingPrice"
    FROM cte0 c0
    LEFT JOIN cte1 p ON p."productId" = c0."productId"
),

-- Calculate gross profit
cte000 AS (
    SELECT cte00.*,
           CASE 
               WHEN "tranTypeId" = 4 -- Sale
                   THEN "qty" * ("price" - "discount" - COALESCE("lastTranPurchasePrice", "openingPrice")) 
               WHEN "tranTypeId" = 9 -- Sale Return
                   THEN -("qty" * ("price" - "discount" - COALESCE("lastTranPurchasePrice", "openingPrice")))
               ELSE 0
           END AS "grossProfit"
    FROM cte00
),

-- Pivot transactions into columns (sale, purchase, returns, etc.)
cte2 AS (
    SELECT "productId",
           "tranTypeId", 
           SUM(CASE WHEN "tranTypeId" = 4 THEN "qty" ELSE 0 END) AS "sale",
           SUM(CASE WHEN "tranTypeId" = 9 THEN "qty" ELSE 0 END) AS "saleRet",
           SUM(CASE WHEN "tranTypeId" = 5 THEN "qty" ELSE 0 END) AS "purchase",
           SUM(CASE WHEN "tranTypeId" = 10 THEN "qty" ELSE 0 END) AS "purchaseRet",
           SUM(CASE WHEN ("tranTypeId" = 11) AND ("dc" = 'D') THEN "qty" ELSE 0 END) AS "stockJournalDebits",
           SUM(CASE WHEN ("tranTypeId" = 11) AND ("dc" = 'C') THEN "qty" ELSE 0 END) AS "stockJournalCredits",
           SUM(CASE WHEN ("tranTypeId" = 12) AND ("dc" = 'D') THEN "qty" ELSE 0 END) AS "branchTransferDebits",
           SUM(CASE WHEN ("tranTypeId" = 12) AND ("dc" = 'C') THEN "qty" ELSE 0 END) AS "branchTransferCredits",
           MAX(CASE WHEN "tranTypeId" = 4 THEN "tranDate" END) AS "lastSaleDate",
           MAX(CASE WHEN "tranTypeId" IN (5, 11) THEN "tranDate" END) AS "lastPurchaseDate",
           SUM(CASE WHEN "tranTypeId" = 4 THEN "grossProfit" WHEN "tranTypeId" = 9 THEN -"grossProfit" ELSE 0 END) AS "grossProfit"
    FROM cte000
    GROUP BY "productId", "tranTypeId" 
    ORDER BY "productId", "tranTypeId"
),

-- Aggregate by product
cte3 AS (
    SELECT "productId",
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

-- Join with opening balance
cte4 AS (
    SELECT COALESCE(c1."productId", c3."productId") AS "productId",
           COALESCE(c1.qty, 0) AS "op",
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
           "openingPrice", 
           "lastSaleDate"
    FROM cte1 c1
    FULL JOIN cte3 c3 ON c1."productId" = c3."productId"
),

-- Get last purchase price
cte5 AS (
    SELECT DISTINCT ON("productId") 
           "productId", 
           "price" AS "lastPurchasePrice"
    FROM cte0
    WHERE "tranTypeId" = 5
    ORDER BY "productId", "tranDate" DESC
),

-- Calculate closing balance and apply ageing filter
cte6 AS (
    SELECT COALESCE(c4."productId", c5."productId") AS "productId",
           COALESCE("openingPrice", 0) AS "openingPrice", 
           "op", 
           COALESCE("op" * "openingPrice", 0)::NUMERIC(12, 2) AS "opValue", 
           "sale", 
           "purchase", 
           "saleRet",
           "purchaseRet",
           "stockJournalDebits", 
           "stockJournalCredits",
           "branchTransferDebits",
           "branchTransferCredits", 
           COALESCE("lastPurchasePrice", "openingPrice") AS "lastPurchasePrice",
           "lastPurchaseDate",
           "lastSaleDate",
           COALESCE("op" + "purchase" - "purchaseRet" - "sale" + "saleRet" + "stockJournalDebits" - "stockJournalCredits" + "branchTransferDebits" - "branchTransferCredits", 0) AS "clos",
           "grossProfit"
    FROM cte4 c4
    FULL JOIN cte5 c5 ON c4."productId" = c5."productId"
    WHERE DATE_PART('day', CURRENT_DATE::TIMESTAMP - COALESCE("lastPurchaseDate"::TIMESTAMP, (CURRENT_DATE - 360)::TIMESTAMP)) >= COALESCE((TABLE "days"), 0)
),

-- Final result with product details
cte7 AS (
    SELECT p."id" AS "productId", 
           "productCode", 
           "catName", 
           "brandName", 
           "label",
           "openingPrice", 
           COALESCE("op", 0)::NUMERIC(10, 2) AS "op",
           "opValue",
           (COALESCE("purchase", 0) + COALESCE("saleRet", 0) + COALESCE("stockJournalDebits", 0) + COALESCE("branchTransferDebits", 0))::NUMERIC(10, 2) AS "dr", 
           (COALESCE("sale", 0) + COALESCE("purchaseRet", 0) + COALESCE("stockJournalCredits", 0) + COALESCE("branchTransferCredits", 0))::NUMERIC(10, 2) AS "cr",
           COALESCE("sale", 0)::NUMERIC(10, 2) AS "sale", 
           COALESCE("purchase", 0)::NUMERIC(10, 2) AS "purchase", 
           COALESCE("saleRet", 0)::NUMERIC(10, 2) AS "saleRet", 
           COALESCE("purchaseRet", 0)::NUMERIC(10, 2) AS "purchaseRet", 
           COALESCE("stockJournalDebits", 0)::NUMERIC(10, 2) AS "stockJournalDebits", 
           COALESCE("stockJournalCredits", 0)::NUMERIC(10, 2) AS "stockJournalCredits",
           COALESCE("branchTransferDebits", 0)::NUMERIC(10, 2) AS "branchTransferDebits", 
           COALESCE("branchTransferCredits", 0)::NUMERIC(10, 2) AS "branchTransferCredits",
           COALESCE("clos", 0)::NUMERIC(10, 2) AS "clos", 
           "lastPurchasePrice", 
           ("clos" * "lastPurchasePrice")::NUMERIC(12, 2) AS "closValue",
           "lastPurchaseDate", 
           "lastSaleDate",
           (DATE_PART('day', COALESCE((TABLE "onDate"), CURRENT_DATE)::TIMESTAMP - "lastPurchaseDate"::TIMESTAMP)) AS "age", 
           "info", 
           "grossProfit"
    FROM cte6 c6
    RIGHT JOIN "cteProduct" p ON p."id" = c6."productId"
    JOIN "CategoryM" c ON c."id" = p."catId"
    JOIN "BrandM" b ON b."id" = p."brandId"
    WHERE ((NOT(("clos" = 0) AND ("op" = 0) AND ("sale" = 0) AND ("purchase" = 0) AND ("saleRet" = 0) AND ("purchaseRet" = 0) AND ("stockJournalDebits" = 0) AND ("stockJournalCredits" = 0))) 
           OR (TABLE "isAll"))
    ORDER BY "catName", "brandName", "label"
)

-- Main query
SELECT * FROM cte7;
-- WHERE "branchTransferDebits" <> 0 OR "branchTransferCredits" <> 0
    '''