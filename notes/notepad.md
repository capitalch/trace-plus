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

select a.id, "accClass", "accLeaf", "accName", 
            CASE WHEN "accLeaf" = 'L' THEN 'Ledger' ELSE 'Group' END || ': ' || "accClass" || ': ' || "accName"
                as "fullName"
            from
                "AccM" a
                    join "AccClassM" c
                        on c.id = a."classId"
            where
                "accLeaf" in('L','N')
            order by "accLeaf", "accClass", "accName"

updateBlock_editAccount
do $$
        DECLARE children INT[];
        DECLARE oldParentId INT;
        DECLARE parentClassId INT;
        DECLARE parentAccType CHAR(1);
        DECLARE oldAccType CHAR(1);
        DECLARE parentAccLeaf CHAR(1);
        DECLARE oldAccLeaf CHAR(1);
        begin
            update "AccM" 
                set "accCode" = %(accCode)s
                , "accName" = %(accName)s
                    where "id" = %(id)s;
            
            select "parentId", "accType", "accLeaf" into oldParentId, oldAccType, oldAccLeaf
                from "AccM"
                    where "id" = %(id)s;
            if oldParentId != %(parentId)s then
                with RECURSIVE cte as (
                    select a."id",  null as "children"
                        from "AccM" a where a."id"= %(id)s
                    UNION ALL
                        select a."id", null as "children"
                            from "AccM" a 
                                inner join cte c
                                    on c."id" = a."parentId")
                    select array_agg(id) into "children" from cte;
                    
                    select "classId", "accType" into parentClassId, parentAccType 
                        from "AccM" 
                            where "id" = %(parentId)s;                    
                    
                    update "AccM" set "classId" = parentClassId, "accType" = parentAccType where id = any(children);
                    update "AccM" set "parentId" = %(parentId)s where id = %(id)s;

                    select "accLeaf" into parentAccLeaf
                        from "AccM"
                            where id = %(parentId)s;
                    
                    if parentAccLeaf = 'L' then
                        update "AccM"
                            set "accLeaf" = 'S'
                                where "id" = %(id)s;
                    elseif parentAccLeaf = 'N' then
                        if oldAccLeaf = 'S' then
                            update "AccM"
                                set "accLeaf" = 'Y'
                                    where "id" = %(id)s;
                        end if;
                    end if;
            end if;
        end $$;

## AI based
WITH updated_acc AS (
    -- 1. Update the account's code and name
    UPDATE "AccM"
    SET "accCode" = %(accCode)s,
        "accName" = %(accName)s
    WHERE "id" = %(id)s
    RETURNING "parentId", "accType", "accLeaf"
),
parent_info AS (
    -- 2. Fetch parent account's classId and accType
    SELECT "classId", "accType", "accLeaf"
    FROM "AccM"
    WHERE "id" = %(parentId)s
),
children_cte AS (
    -- 3. Recursively find all child accounts if the parent has changed
    SELECT a."id"
    FROM "AccM" a
    WHERE a."id" = %(id)s

    UNION ALL

    SELECT a."id"
    FROM "AccM" a
    INNER JOIN children_cte c ON a."parentId" = c."id"
),
update_children AS (
    -- 4. Update child accounts' classId and accType if parent changed
    UPDATE "AccM"
    SET "classId" = (SELECT "classId" FROM parent_info),
        "accType" = (SELECT "accType" FROM parent_info)
    WHERE "id" IN (SELECT "id" FROM children_cte)
),
update_parent AS (
    -- 5. Update parentId for the current account
    UPDATE "AccM"
    SET "parentId" = %(parentId)s
    WHERE "id" = %(id)s
),
update_leaf_status AS (
    -- 6. Update accLeaf based on the parent's accLeaf status
    UPDATE "AccM"
    SET "accLeaf" = CASE
        WHEN (SELECT "accLeaf" FROM parent_info) = 'L' THEN 'S'
        WHEN (SELECT "accLeaf" FROM parent_info) = 'N' AND
             (SELECT "accLeaf" FROM updated_acc) = 'S' THEN 'Y'
        ELSE "accLeaf"
    END
    WHERE "id" = %(id)s
)
-- Final SELECT to ensure all updates execute
SELECT 1;
