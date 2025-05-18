set search_path to capitalchowringhee; -- Stock trans report modified WIP
WITH "branchId" AS (VALUES (NULL::INT)), "finYearId" AS (VALUES (2024)), "productCode" as (VALUES (null::text)), "catId" AS (VALUES (NULL::INT)), "brandId"   AS (VALUES (NULL::INT)), "tagId" AS (VALUES (NULL::INT)), "onDate"    AS (VALUES (CURRENT_DATE)), "days" AS (VALUES (0)),
--with "branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "productCode" as (VALUES (%(productCode)s::text)), "tagId" as (values(%(tagId)s::int)), "brandId" as (values(%(brandId)s::int)), "catId" as (values(%(catId)s::int)), "onDate" as (values(%(onDate)s ::date)), "days" as (values(%(days)s::int)),
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
                , "productCode"
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
                , "productCode"
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
                , "productCode"
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
                , "productCode"
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
                , "productCode"
                , "debits"
                , "credits"
                , ("debits" - "credits") as "balance"
                , "price"
                , CONCAT_WS(', ',"accountNames", "remarks") as "remarks"
                , "timestamp"
                , "grossProfit"
                from cte222 c2
                     join cte1 c1 on c2."tranHeaderId" = c1."tranHeaderId"
            )
            , cte4 as ( -- op balance with remarks 'Opening balance', for products having transactions
                select DISTINCT ON (c3."productId")
                c3."productId"
                , c3."productCode"
                , (table "startDate") as "tranDate"
                , CASE WHEN COALESCE(c0.qty,0) >= 0 then COALESCE(c0.qty,0) ELSE 0 END as "debits"
                , CASE WHEN COALESCE(c0.qty,0) < 0 then "qty" ELSE 0 END as "credits"
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
                , "productCode"
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
                , SUM("grossProfit") as "grossProfit"
                , 'Summary' as "remarks"
                , '9999-12-31 00:00:00.00+00'::timestamp as timestamp
                from cte5 c5
                GROUP BY "productId"
             )
             --, cte7 as ( -- union the results with summary

             --)
            select * from cte6 order by "productId", "tranDate"