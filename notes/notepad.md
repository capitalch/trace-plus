## Different steps for Hierarchy accounts
- Step 1: Basic without recursion: Array_agg for children
- Step 2: With recursion array_agg
- Step 3: Basic without recursion json_agg
- Step 4: With recursion json_agg

I have following tables in an accounting system PostgreSql. I want to create trial balance:
1) AccM: As Accounts Master: id, accCode, accName, accType(L forliability, A for Asset, E for expences, I for Income), parentId
2) AccOpBal: For opening balances of accounts: id, accId, dc(D for Debits, C for Credits), amount
3) TranD: For transaction details: id, accId, dc (D for Debits, C for Credits), amount
Create a trial balance query to be consumed by Syncfusion TreeGrid. It should be hierarchal. The parentId column defines the hierarchy in AccM table

## Final approach for simplicity
set search_path to demounit1;
-- Basic without recursion: Array_agg for children
with cte as (
    select h."ID", h."Name", h."Title", e."ID" as "ChildID"
        from "Employees" h
            left join "Employees" e
                on h."ID" = e."ManagerID"
), cte1 as (
select "ID", "Name", "Title", array_agg("ChildID") as children from cte
    GROUP BY "ID","Name", "Title"
        ORDER BY "ID"
)
select JSON_AGG(c) from cte1 c

## Original
set search_path to demounit1;
-- Original
with recursive cte as (
        select * from cte1
            union all
        select a."id", a."accName", a."accType", a."parentId", a."accLeaf"
        , c."opening"
        , c."sign"
        , c."opening_dc"
        , c."debit", c."credit"
            from cte c
                join "AccM" a
                    on c."parentId" = a."id"
        )
        --, "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
        , "branchId" as (values (1::int)), "finYearId" as (values (2024)),
        cte1 as (
            select a."id", "accName", "accType", "parentId", "accLeaf"
                , 0.00 as "opening"
                , 1 as "sign"
                , '' as "opening_dc"
                , CASE WHEN t."dc" = 'D' THEN t."amount" else 0.00 END as "debit"
                , CASE WHEN t."dc" = 'C' THEN t."amount" else 0.00 END as "credit"
            from "AccM" a
                join "TranD" t
                    on t."accId" = a."id"
                join "TranH" h
                    on h."id" = t."tranHeaderId"
                        where "finYearId" = (table "finYearId") 
                            --and "branchId" = (table "branchId")
                            AND (SELECT COALESCE((TABLE "branchId"), h."branchId") = h."branchId")
                union all
            select a."id", "accName", "accType", "parentId", "accLeaf"
                , "amount" as "opening"
                , CASE WHEN "dc" = 'D' THEN 1 ELSE -1 END as "sign"
                , "dc" as "opening_dc"
                , 0 as "debit"
                , 0 as "credit"
            from "AccM" a
                join "AccOpBal" b
                    on a."id" = b."accId"
                        where "finYearId" = (table "finYearId") 
                            --and "branchId" = (table "branchId")
                            AND (SELECT COALESCE((TABLE "branchId"), b."branchId") = b."branchId")
                                order by "accType", "accName"
            ),
        cte2 as (
            select "id", "accName", "accType", "parentId", "accLeaf"
                , SUM("opening" * "sign") as "opening"
                , SUM("debit") as "debit"
                , SUM("credit") as "credit"
                from cte
                    group by "id", "accName", "accType", "parentId", "accLeaf"
                        --order by "id"
                        order by "accType", "accName"
            ) select 
                "id", "accName", "accType", "parentId", "accLeaf"
                , ABS("opening") as "opening"
                , CASE WHEN "opening" < 0 THEN 'C' ELSE 'D' END as "opening_dc"
                , "debit"
                , "credit"
                , (select ARRAY_AGG("id") from cte2 where "parentId" = a."id") as "children"
                , ABS("opening" + "debit" - "credit") as "closing"
                , CASE WHEN ("opening" + "debit" - "credit") < 0 THEN 'C' ELSE 'D' END as "closing_dc"
            from cte2 a
                order by "accType", "accName"

## WIP 1
SET search_path TO demounit1;

with RECURSIVE "hier" as (
    select "accId" , "parentId"
        from cte2
    UNION ALL
    select a."id", a."parentId"
        from "hier" h
            join "AccM" a
                on h."parentId" = a."id"
),
-- "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
"branchId" as (values (1::int)), "finYearId" as (values (2024)),
cte1 as (
    select d.id, "accId", 0.00 as "opening"
        , CASE WHEN d."dc" = 'D' THEN d."amount" else 0.00 END as "debit"
        , CASE WHEN d."dc" = 'C' THEN d."amount" else 0.00 END as "credit"
        , "parentId"
    from "TranH" h
        join "TranD" d
            on h.id = d."tranHeaderId"
        join "AccM" a
            on a.id = d."accId"
    where "finYearId" = (table "finYearId")
        and "branchId" = (table "branchId")
    union all
    select b.id, "accId"
        , CASE WHEN "dc" = 'D' THEN amount ELSE -amount END as "opening"
        , 0 as "debit"
        , 0 as "credit"
        , "parentId"
    from "AccOpBal" b
        join "AccM" a
            on a.id = b."accId"
        where "finYearId" = (table "finYearId")
            and "branchId" = (table "branchId"))
, cte2 as (
    select "accId", SUM(opening) as "opening", SUM(debit)   as debit, SUM(credit) as credit, "parentId"
        from cte1
    group by "accId", "parentId"
) select a.id, a."accName", a."accCode", opening, debit, credit from cte2 c
    join "AccM" a
        on a."id" = c."accId"
-- select "accId", "accName", "accCode", SUM("opening") as "opening", SUM("debit") as "debit",SUM("credit") as "credit"
--  from hier h
--      join "AccM" a
--          on a."id" = h."accId"
--  GROUP BY "accId", "accCode", "accName"
    order by "accId"
## Work in progress 2
set search_path to demounit1;
-- with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)),
with "branchId" as (values (1::int)), "finYearId" as (values (2024)),
cte1 as (
    select d.id, "accId", 0.00 as "opening"
            , 1 as "sign"
            , '' as "opening_dc"
            , CASE WHEN d."dc" = 'D' THEN d."amount" else 0.00 END as "debit"
            , CASE WHEN d."dc" = 'C' THEN d."amount" else 0.00 END as "credit"
            , "parentId"
        from "TranH" h
            join "TranD" d
                on h.id = d."tranHeaderId"
            join "AccM" a
                on a.id = d."accId"
        where "finYearId" = (table "finYearId")
            and "branchId" = (table "branchId")
    union all
    select b.id, "accId"
            , "amount" as "opening"
            , CASE WHEN "dc" = 'D' THEN 1 ELSE -1 END as "sign"
            , "dc" as "opening_dc"
            , 0 as "debit"
            , 0 as "credit"
            , "parentId"
        from "AccOpBal" b
            join "AccM" a
                on a.id = b."accId"
            where "finYearId" = (table "finYearId")
                and "branchId" = (table "branchId"))
, cte2 as (
    select "accId"
            , SUM("opening" * "sign") as "opening"
            , SUM("debit") as "debit"
            , SUM("credit") as "credit"
            , "parentId"
        from cte1
            group by "accId", "parentId"
), cte3 as (
    select a.id, a."accName", a."accCode", a."accType", a."accLeaf"
            , array_agg(c."accId") as children
            , SUM(c."opening") as "opening"
            , SUM(c."debit") as "debit"
            , SUM(c."credit") as "credit"
        from "AccM" a
            join cte2 c
                on a."id" = c."parentId"
        group by a.id, a."accName", a."accCode", a."accType", a."accLeaf"
)
    -- select * from cte3
select  c2."accId", "accName", "accCode", "accType", "accLeaf"
            , null as children
            , ABS("opening") as "opening"
            , CASE WHEN "opening" < 0 THEN 'C' ELSE 'D' END as "opening_dc"
            , "debit"
            , "credit"
            , ABS("opening" + "debit" - "credit") as "closing"
            , CASE WHEN ("opening" + "debit" - "credit") < 0 THEN 'C' ELSE 'D' END as "closing_dc"
    from cte2 c2
        join "AccM" a
            on c2."accId" = a."id"
    UNION ALL
        select id, "accName", "accCode", "accType", "accLeaf"
            , children
            , "opening"
            , CASE WHEN "opening" < 0 THEN 'C' ELSE 'D' END as "opening_dc"
            , "debit"
            , "credit"
            , ABS("opening" + "debit" - "credit") as "closing"
            , CASE WHEN ("opening" + "debit" - "credit") < 0 THEN 'C' ELSE 'D' END as "closing_dc"
        from cte3
        
## Working one: Organized with AI
SET search_path TO demounit1;
WITH RECURSIVE cte AS (
    SELECT "accId", "opening", "debit", "credit", "parentId"
    FROM "TestD"
    -- WHERE "accId" IN (5, 6)
    UNION ALL
    SELECT 
        a."id" AS "accId", 
        c.opening, 
        c.debit, 
        c.credit, 
        a."parentId"
    FROM cte c
    JOIN "TestM" a
        ON c."parentId" = a."id"
),
cte2 AS (
    SELECT 
        "accId", 
        "accName", 
        SUM(opening) AS opening, 
        SUM(debit) AS debit, 
        SUM(credit) AS credit, 
        a."parentId"
    FROM cte c
    JOIN "TestM" a
        ON a."id" = c."accId"
    GROUP BY 
        "accId", 
        "accName", 
        a."parentId"
)
SELECT 
    c."accId", 
    c."accName", 
    c.opening, 
    c.debit, 
    c.credit, 
    c."parentId", 
    array_agg(children."accId") AS children
FROM cte2 c
LEFT JOIN cte2 children
    ON children."parentId" = c."accId"
GROUP BY 
    c."accId", 
    c."accName", 
    c.opening, 
    c.debit, 
    c.credit, 
    c."parentId"
ORDER BY c."accId";
