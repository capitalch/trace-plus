-- new sales report
set search_path to capitalchowringhee;
with "branchId" as (values (1)), "finYearId" as (values (2024)), "tagId" as (values(0)), "startDate" as (values('2024-04-01' ::date)), "endDate" as (values('2024-04-30' ::date)), "days" as (values(0)),
        --with "branchId" as (values (%(branchId)s::int)), "finYearId" as (values (%(finYearId)s::int)), "tagId" as (values(%(tagId)s::int)), "startDate" as (values(%(startDate)s ::date)), "endDate" as (values(%(endDate)s:: date)), "days" as (values (COALESCE(%(days)s,0))),

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
    filtered_products as (
        select p.id as "productId"
            from "ProductM" p
                join cte c
                    on c.id = p."catId"
    ),
    cte0 as ( --base cte: from tranD where 4,9
        select h."id",
        d."accId",
        d."id",
        h."remarks" as "commonRemarks", 
        CONCAT_WS(', ', d.remarks, s."jData"->'remarks') as "lineRemarks",
        "tranDate", 
        s."productId", 
        "tranTypeId", 
        "qty", 
        ("price" - "discount") "price", 
        "cgst", 
        "sgst",
        "igst",
        s."amount", 
        "gstRate", 
        s."id" as "salePurchaseDetailsId", 
        "autoRefNo", 
        h."timestamp", 
        concat_ws(' ', "contactName", "mobileNumber", "address1", "address2") as "contact",
        '' as "dc", 
        s."jData"->>'serialNumbers' as "serialNumbers"
            from "TranH" h
                join "TranD" d
                    on h."id" = d."tranHeaderId"
                --join "AccM" a
                    --on a."id" = d."accId"
                join "SalePurchaseDetails" s
                    on d."id" = s."tranDetailsId"
                join filtered_products p
                    on p."productId" = s."productId"
                left join "Contacts" c
                    on c."id" = h."contactsId"
                where COALESCE((table "branchId"),"branchId") = "branchId"
                    and "finYearId" = (table "finYearId")
                    and "tranDate" between (table "startDate") and (table "endDate")
                    and "tranTypeId" in (4, 9)
        ),
    cte1 as (
        select
            s."productId",
            s."price",
            h."tranDate",
            ROW_NUMBER() OVER (PARTITION by s."productId" ORDER BY h."tranDate" DESC, h."id" DESC) as rn
            from "TranH" h
                join "TranD" d 
                    on h.id = d."tranHeaderId"
                join "SalePurchaseDetails" s
                    on d.id = s."tranDetailsId"
            where "tranTypeId" in (5,11) -- purchase / stock journal
                and h."tranDate" <= (table "endDate")
                
    ),
    cte_last_purchase_price_and_date as (
        select p."productId", c1."price"as "lastPurchasePrice", c1."tranDate" as "lastPurchaseDate"
        from filtered_products p
            left join cte1 c1
                on p."productId" = c1."productId"
                AND c1.rn = 1)
    select * from cte_last_purchase_price_and_date