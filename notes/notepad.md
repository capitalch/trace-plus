set search_path to demounit1; -- AI version 1st iteration chatgpt
-- ======================================
-- Inventory Stock Summary with Ageing
-- Parameters passed via CTEs:
-- "branchId", "finYearId", "catId", "brandId", "tagId", "onDate", "days"
-- ======================================

WITH 
-- ========== INPUT PARAMETERS ==========
"branchId" AS (VALUES (NULL::INT)),
"finYearId" AS (VALUES (2024)),
"catId"     AS (VALUES (NULL::INT)),
"brandId"   AS (VALUES (NULL::INT)),
"tagId"     AS (VALUES (NULL::INT)),
"onDate"    AS (VALUES (CURRENT_DATE)),
"days"      AS (VALUES (0)),
--with "branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "tagId" as (values(%(tagId)s::int)), "brandId" as (values(%(brandId)s::int)), "catId" as (values(%(catId)s::int)), "onDate" as (values(%(onDate)s ::date)), "days" as (values(%(days)s::int)),     
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

-- ========== ADD LAST TRAN PURCHASE PRICE ========== Remove price from stock journal and include from purPrice or -- dealerPrice
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
        "openingPrice"
    FROM cte0 c0
    LEFT JOIN cte1 p ON p."productId" = c0."productId"
),

-- ========== CALCULATE GROSS PROFIT ==========
cte000 AS (
    SELECT 
        cte00.*,
        CASE 
            WHEN "tranTypeId" = 4 THEN "qty" * ("price" - "discount" - COALESCE("lastTranPurchasePrice", "openingPrice"))
            WHEN "tranTypeId" = 9 THEN -"qty" * ("price" - "discount" - COALESCE("lastTranPurchasePrice", "openingPrice"))
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
        COALESCE("lastPurchasePrice", "openingPrice") AS "lastPurchasePrice",
        "lastPurchaseDate", "lastSaleDate",
        COALESCE(
            "op" + "purchase" - "purchaseRet" - "sale" + "saleRet" + 
            "stockJournalDebits" - "stockJournalCredits" + 
            "branchTransferDebits" - "branchTransferCredits", 0
        ) AS "clos",
        "grossProfit"
    FROM cte4 c4
    FULL JOIN cte5 c5 ON c4."productId" = c5."productId"
    WHERE date_part('day', CURRENT_DATE::timestamp - COALESCE("lastPurchaseDate"::timestamp, (CURRENT_DATE - 360)::timestamp)) >= COALESCE((TABLE "days"), 0)
),

-- ========== FINAL JOIN WITH PRODUCT INFO ==========
cte7 AS (
    SELECT 
        p."id" AS "productId", "productCode", "catName", "brandName", "label",
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
        DATE_PART('day', COALESCE((TABLE "onDate"), CURRENT_DATE::timestamp) - "lastPurchaseDate"::timestamp) AS "age",
        "info", "grossProfit"
    FROM cte6 c6
    RIGHT JOIN "cteProduct" p ON p."id" = c6."productId"
    JOIN "CategoryM" c ON c."id" = p."catId"
    JOIN "BrandM" b ON b."id" = p."brandId"
    WHERE NOT (
        "clos" = 0 AND "op" = 0 AND "sale" = 0 AND "purchase" = 0 AND 
        "saleRet" = 0 AND "purchaseRet" = 0 AND "stockJournalDebits" = 0 AND "stockJournalCredits" = 0
    )
    ORDER BY "catName", "brandName", "label"
)

-- ========== FINAL OUTPUT ==========
SELECT * FROM cte7;

## Sales report
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