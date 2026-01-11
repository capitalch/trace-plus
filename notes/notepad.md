# trace-plus inventory report
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
                    SUM( "grossProfit") AS "grossProfit",
                    MAX("lastTranPurchasePrice") AS "lastTranPurchasePrice"
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
                    MAX("lastPurchaseDate") AS "lastPurchaseDate",
                    MAX("lastTranPurchasePrice") AS "lastTranPurchasePrice"
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
                    "lastTranPurchasePrice",
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
                    CASE
                        WHEN COALESCE("lastPurchasePrice", 0) > 0 THEN "lastPurchasePrice"
                        WHEN COALESCE("openingPrice", 0) > 0 THEN "openingPrice"
                        WHEN COALESCE("lastTranPurchasePrice", 0) > 0 THEN "lastTranPurchasePrice"                        
                        ELSE "purPrice"
                    END AS "lastPurchasePrice",
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

# Trace inventory report
"get_stock_summary":'''
        --with "branchId" as (values(null::int)), "finYearId" as (values (2024)),"tagId" as (values(0)), "onDate" as (values(CURRENT_DATE)), "isAll" as (values(true)), "days" as (values(0)), "type" as (values('cat')), "value" as (values(0)),
            with "branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "onDate" as (values(%(onDate)s ::date)), "isAll" as (values(%(isAll)s::boolean)), "days" as (values(%(days)s::int)), "type" as (values (%(type)s::text)), "value" as (values (%(value)s::int)),     
            "cteProduct" as (select * from get_productids_on_brand_category_tag((table "type") , (table "value") )),
            cte0 as( --base cte used many times in next
                select h."id", "productId", "tranTypeId", "qty", ("price" - "discount") "price", "discount", "tranDate", '' as "dc"
                    from "TranH" h
                        join "TranD" d
                            on h."id" = d."tranHeaderId"
                        join "SalePurchaseDetails" s
                            on d."id" = s."tranDetailsId"
                    where 
                        --"branchId" = (table "branchId") 
                        (COALESCE((TABLE "branchId"), "branchId") = "branchId")
                        and "finYearId" =(table "finYearId")
                        and "tranDate" <= coalesce((table "onDate"), CURRENT_DATE)
                            union all --necessary otherwise rows with same values are removed
                select h."id", "productId", "tranTypeId", "qty", "price", 0 as "discount", "tranDate", "dc"
                    from "TranH" h
                        join "StockJournal" s
                            on h."id" = s."tranHeaderId"
                    where 
                        --"branchId" = (table "branchId") 
                        (COALESCE((TABLE "branchId"), "branchId") = "branchId")
                        and "finYearId" =(table "finYearId")
                        and "tranDate" <= coalesce((table "onDate"), CURRENT_DATE)
                            union all -- for branchTransfer credits
                select h."id", "productId", "tranTypeId", "qty", "price", 0 as "discount", "tranDate", 'C' as "dc"
                    from "TranH" h
                        join "BranchTransfer" b
                            on h."id" = b."tranHeaderId"
                    where 
                        --"branchId" = (table "branchId") 
                        (COALESCE((TABLE "branchId"), "branchId") = "branchId")
                        and "finYearId" =(table "finYearId")
                        and "tranDate" <= coalesce((table "onDate"), CURRENT_DATE)
                            union all -- for branchTransfer debits
                select h."id", "productId", "tranTypeId", "qty", "price", 0 as "discount", "tranDate", 'D' as "dc"
                    from "TranH" h
                        join "BranchTransfer" b
                            on h."id" = b."tranHeaderId"
                    where 
                        --"branchId" = (table "branchId") 
                        (COALESCE((TABLE "branchId"), "destBranchId") = "destBranchId")
                        and "finYearId" =(table "finYearId")
                        and "tranDate" <= coalesce((table "onDate"), CURRENT_DATE)
                )
                , cte1 as ( -- opening balance
                    select "productId", SUM("qty") as "qty", MAX("openingPrice") as "openingPrice", MAX("lastPurchaseDate") as "lastPurchaseDate"
                        from "ProductOpBal" p 
                    where 
                        --"branchId" = (table "branchId") 
                        (COALESCE((TABLE "branchId"), "branchId") = "branchId")
                        and "finYearId" =(table "finYearId")
                    GROUP BY "productId"
                ),
                cte00 as ( -- add lastTranPurchasePrice
                select c0.*,
                    (
                        select DISTINCT ON("productId") "price"
                            from cte0
                                where ("tranTypeId" in(5,11)) and ("tranDate" <= c0."tranDate") and ("productId" = c0."productId") and (c0."price" is not null) and (c0."price" <> 0)
                                    order by "productId", "tranDate" DESC, "id" DESC
                    ) as "lastTranPurchasePrice",
                    "openingPrice"
                        from cte0 c0
                            left join cte1 p
                                on p."productId" = c0."productId"
                )
                , cte000 as ( --add gross profit
                    select cte00.*,
                    CASE 
                        WHEN "tranTypeId" = 4 --sale
                            THEN "qty" * ("price" - "discount" - COALESCE("lastTranPurchasePrice", "openingPrice")) 
                        WHEN "tranTypeId" = 9 --sale return
                            THEN -("qty" * ("price" - "discount" - COALESCE("lastTranPurchasePrice", "openingPrice")))
                        ELSE
                            0
                    END
                    as "grossProfit"
                        from cte00
                ), cte2 as ( -- create columns for sale, saleRet, purch... Actually creates columns from rows
                    select "productId","tranTypeId", 
                        SUM(CASE WHEN "tranTypeId" = 4 THEN "qty" ELSE 0 END) as "sale"
                        , SUM(CASE WHEN "tranTypeId" = 9 THEN "qty" ELSE 0 END) as "saleRet"
                        , SUM(CASE WHEN "tranTypeId" = 5 THEN "qty" ELSE 0 END) as "purchase"
                        , SUM(CASE WHEN "tranTypeId" = 10 THEN "qty" ELSE 0 END) as "purchaseRet"
                        , SUM(CASE WHEN ("tranTypeId" = 11) and ("dc" = 'D') THEN "qty" ELSE 0 END) as "stockJournalDebits"
                        , SUM(CASE WHEN ("tranTypeId" = 11) and ("dc" = 'C') THEN "qty" ELSE 0 END) as "stockJournalCredits"
                        , SUM(CASE WHEN ("tranTypeId" = 12) and ("dc" = 'D') THEN "qty" ELSE 0 END) as "branchTransferDebits"
                        , SUM(CASE WHEN ("tranTypeId" = 12) and ("dc" = 'C') THEN "qty" ELSE 0 END) as "branchTransferCredits"
                        , MAX(CASE WHEN "tranTypeId" = 4 THEN "tranDate" END) as "lastSaleDate"
                        , MAX(CASE WHEN "tranTypeId" in(5,11) THEN "tranDate" END) as "lastPurchaseDate" --Purchase or stock journal
                        , SUM(CASE WHEN "tranTypeId" = 4 THEN "grossProfit" WHEN "tranTypeId" = 9 THEN -"grossProfit" ELSE 0 END) as "grossProfit"
                        from cte000
                    group by "productId", "tranTypeId" order by "productId", "tranTypeId"
                )
                , cte3 as ( -- sum columns group by productId
                    select "productId"
                    , coalesce(SUM("sale"),0) as "sale"
                    , coalesce(SUM("purchase"),0) as "purchase"
                    , coalesce(SUM("saleRet"),0) as "saleRet"
                    , coalesce(SUM("purchaseRet"),0) as "purchaseRet"
                    , coalesce(SUM("stockJournalDebits"),0) as "stockJournalDebits"
                    , coalesce(SUM("stockJournalCredits"),0) as "stockJournalCredits"
                    , coalesce(SUM("branchTransferDebits"),0) as "branchTransferDebits"
                    , coalesce(SUM("branchTransferCredits"),0) as "branchTransferCredits"
                    , coalesce(SUM("grossProfit"),0) as "grossProfit"
                    , MAX("lastSaleDate") as "lastSaleDate"
                    , MAX("lastPurchaseDate") as "lastPurchaseDate"
                    from cte2
                        group by "productId"
                )
                , cte4 as ( -- join opening balance (cte1) with latest result set
                    select coalesce(c1."productId",c3."productId")  as "productId"
                    , coalesce(c1.qty,0) as "op"
                    , coalesce("sale",0) as "sale"
                    , coalesce("purchase",0) as "purchase"
                    , coalesce("saleRet", 0) as "saleRet"
                    , coalesce("purchaseRet", 0) as "purchaseRet"
                    , coalesce("stockJournalDebits", 0) as "stockJournalDebits"
                    , coalesce("stockJournalCredits", 0) as "stockJournalCredits"
                    , coalesce("branchTransferDebits", 0) as "branchTransferDebits"
                    , coalesce("branchTransferCredits", 0) as "branchTransferCredits"
                    , coalesce(c3."lastPurchaseDate", c1."lastPurchaseDate") as "lastPurchaseDate"
                    , coalesce("grossProfit",0) as "grossProfit"
                    , "openingPrice", "lastSaleDate"
                        from cte1 c1
                            full join cte3 c3
                                on c1."productId" = c3."productId"
                )
                , cte5 as ( -- get last purchase price for transacted products
                    select DISTINCT ON("productId") "productId", "price" as "lastPurchasePrice"
                        from cte0
                            where "tranTypeId" = 5
                                order by "productId", "tranDate" DESC
                )
                , cte6 as (  -- combine last purchase price with latest result set and add clos column and filter on lastPurchaseDate(ageing)
                    select coalesce(c4."productId", c5."productId") as "productId"
                        , coalesce("openingPrice",0) as "openingPrice", "op", coalesce("op"* "openingPrice",0)::numeric(12,2) "opValue", "sale", "purchase", "saleRet","purchaseRet","stockJournalDebits", "stockJournalCredits","branchTransferDebits","branchTransferCredits", coalesce("lastPurchasePrice", "openingPrice") as "lastPurchasePrice","lastPurchaseDate","lastSaleDate"
                        , coalesce("op" + "purchase" - "purchaseRet" - "sale" + "saleRet" + "stockJournalDebits" - "stockJournalCredits" + "branchTransferDebits" - "branchTransferCredits",0) as "clos"
                        , "grossProfit"
                        from cte4 c4
                            full join cte5 c5
                                on c4."productId" = c5."productId"
                        where date_part('day', CURRENT_DATE::timestamp - coalesce("lastPurchaseDate"::timestamp, (CURRENT_DATE-360)::timestamp) ) >= coalesce((table "days"),0)
                )
                , cte7 as ( -- combine latest result set with ProductM, CategoryM and BrandM tables to attach catName, brandName, label
                    select p."id" as "productId", "productCode", "catName", "brandName", "label","openingPrice", coalesce("op",0)::numeric(10,2) as "op","opValue"
                    , (coalesce("purchase",0) + coalesce("saleRet",0) + coalesce("stockJournalDebits",0) + coalesce("branchTransferDebits",0))::numeric(10,2) as "dr", (coalesce("sale",0) + coalesce("purchaseRet",0) + coalesce("stockJournalCredits",0) + coalesce("branchTransferCredits",0)):: numeric(10,2) as "cr",
                    coalesce("sale",0)::numeric(10,2) as "sale", coalesce("purchase",0)::numeric(10,2) as "purchase", coalesce("saleRet",0)::numeric(10,2) as "saleRet", coalesce("purchaseRet",0)::numeric(10,2) as "purchaseRet", coalesce("stockJournalDebits",0)::numeric(10,2) as "stockJournalDebits", coalesce("stockJournalCredits",0)::numeric(10,2) as "stockJournalCredits"
                    , coalesce("branchTransferDebits",0)::numeric(10,2) as "branchTransferDebits", coalesce("branchTransferCredits",0)::numeric(10,2) as "branchTransferCredits"
                    , coalesce("clos",0)::numeric(10,2) as "clos", "lastPurchasePrice", ("clos" * "lastPurchasePrice")::numeric(12,2) as "closValue"
                            , "lastPurchaseDate", "lastSaleDate" 
                    ,(date_part('day',coalesce((table "onDate"), CURRENT_DATE)::timestamp - "lastPurchaseDate"::timestamp)) as "age", "info", "grossProfit"
                        from cte6 c6
                            right join "cteProduct" p
                                on p."id" = c6."productId"
                            join "CategoryM" c
                                on c."id" = p."catId"
                            join "BrandM" b
                                on b."id" = p."brandId"
                        where ((NOT(("clos" = 0) and ("op" = 0) and ("sale" = 0) and ("purchase" = 0) and ("saleRet" = 0) and ("purchaseRet" = 0) and ("stockJournalDebits" = 0) and("stockJournalCredits" = 0))) 
                            OR (table "isAll"))
                    order by "catName", "brandName", "label"
                    ) select * from cte7 --where "branchTransferDebits" <> 0 or "branchTransferCredits" <> 0
    '''