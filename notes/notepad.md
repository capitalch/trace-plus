set search_path to demounit1;
with "tempMonth" as (values(EXTRACT(MONTH FROM CURRENT_DATE)::int )),
        "currentMonth" as (values(CASE WHEN (table "tempMonth") in(1,2,3) THEN (table "tempMonth") + 12 ELSE (table "tempMonth") END)),
        --"branchId" as (values(%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),"noOfRows" as (values (%(noOfRows)s::int)),
        "branchId" as (values(1)), "finYearId" as (values (2025)), "noOfRows" as (values (100)),

        "cteStock" as (
            select * from get_stock_on_date((table "branchId"), (table "finYearId"), CURRENT_DATE)
        ),
        cte1 as (
            select "productId", SUM("qty") "qty", (CURRENT_DATE - "tranDate"::date) as "daysOld"
            from "TranH" h
                join "TranD" d
                    on h."id" = d."tranHeaderId"
                join "SalePurchaseDetails" s
                    on d."id" = s."tranDetailsId"
            where "tranTypeId" = 4 
                and (((table "currentMonth") - EXTRACT(MONTH from "tranDate")::int) <= 4 ) 
                and "branchId" = (table "branchId")
            group by "productId", "tranDate"
                order by "daysOld"
        )
        , cte2 as (
            select cte1.*,
            CASE
                WHEN "daysOld" between 0 and 30 THEN 'days0_30'
                WHEN "daysOld" between 31 and 60 THEN 'days31_60'
                WHEN "daysOld" between 61 and 90 THEN 'days61_90'
                ELSE 'days90+'
            END as "daysLabel",
            CASE
                WHEN "daysOld" between 0 and 30 THEN 1.5/4
                WHEN "daysOld" between 31 and 60 THEN 1.25/4
                WHEN "daysOld" between 61 and 90 THEN 0.75/4
                ELSE 0.5/4
            END as "weight"
            from cte1
        )
        , cte3 as (
            select "productId", SUM("qty") as "qty", "daysLabel", "weight"
                from cte2
                GROUP BY "productId", "daysLabel", "weight"
                order by "daysLabel"
        )
        , cte4 as (
            select "productId", SUM("qty"*"weight") "qty", TRUNC(SUM("qty"*"weight"),0) "order"
                from cte3
                group by "productId"
                order by "productId"
        ) --select * from cte4 order by "productId"
        ,  cte5 as (
            select c4."productId"
            , p."productCode"
            ,"qty"
            , COALESCE("clos"::int,0) as "clos"
            , b."brandName"
            , c."catName"
            , p."label"
            , ("order" - COALESCE("clos",0)::int) as "finalOrder"
            , p."info"
            , "price"
                from cte4 c4
                    left join "cteStock" s
                        on c4."productId" = s."productId"
                    join "ProductM" p
                        on p."id" = c4."productId"
                    join "BrandM" b
                        on b."id" = p."brandId"
                    join "CategoryM" c
                        on c."id" = p."catId"
            order by "productId"
        )
        , cte6 as (
            select 
                "productId",
                "productCode",
                "brandName", 
                "catName", 
                "label",
                "catName" || ' ' ||  "brandName" || ' ' || "label" as "productDetails",
                "info", 
                "clos", 
                "finalOrder", 
                "price" * "finalOrder" as "orderValue", 
                CASE WHEN "clos" = 0 THEN true ELSE false END as "isUrgent"
                from cte5 where ("finalOrder" > 0) and "clos" >= 0
                    ORDER BY "brandName", "catName", "label" 
        ) select * from cte6 LIMIT (table "noOfRows")