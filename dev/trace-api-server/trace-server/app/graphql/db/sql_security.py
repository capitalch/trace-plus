class SqlSerurity:
    does_user_email_exist = '''
        with "email" as (values(%(email)s))
            --with "email" as (values('capitalch@gmail.com'))
        select exists(select 1
            from "UserM"
                where "userEmail" = (table "email"))
    '''
    
    get_user_details = '''
            with "uidOrEmail" as (values(%(uidOrEmail)s))
            --with "uidOrEmail" as (values('cap@gmail.com'))
            , cte1 as ( -- user details
                select u.id as "userId", "uid", "userEmail", "hash", "userName"
                    , "branchIds", "lastUsedBuId", "lastUsedBranchId", u."clientId", "mobileNo", u."isActive" as "isUserActive", u."roleId"
					, c."clientCode", c."clientName", c."isActive" as "isClientActive", c."isExternalDb", c."dbName", c."dbParams"
                , CASE when ("roleId" is null) THEN 'A' ELSE 'B' END as "userType"	
                from "UserM" u
					join "ClientM" c
						on c."id" = u."clientId"
                where (("uid" = (table "uidOrEmail") or ("userEmail" = (table "uidOrEmail")))))
            , cte2 as ( -- get bu's associated with user
                select b.id as "buId", "buCode", "buName"
                    from "BuM" b
                        join "UserBuX" x
                            on b.id = x."buId"
                        join "UserM" u
                            on u."id" = x."userId"
                where b."isActive" and (("uid" = (table "uidOrEmail") or ("userEmail" = (table "uidOrEmail")))))
            , cte3 as ( -- role
                    select r.id as "roleId", r."roleName", r."clientId" 
                    from cte1 u
                        left join "RoleM" r
                            on r.id = u."roleId"
            )
            select json_build_object(
                'userDetails',(select row_to_json(a) from cte1 a)
                , 'businessUnits', (select json_agg(row_to_json(b)) from cte2 b)
                , 'role', (select row_to_json(c) from cte3 c)
            ) as "jsonResult"
        '''
allSqls = {
    "sql1": """with cte1 as (
            select * from "TranD" where "id" <> %(id)s
        ), cte2 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte3 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte4 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte5 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte6 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte7 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte8 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte9 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte10 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte11 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte12 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte13 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte14 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte15 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte16 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte17 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte18 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte19 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte20 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte21 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte22 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte23 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte24 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte25 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte26 as (
            select * from "TranD" where "id" <> %(id)s
        ) , cte27 as (
            select * from "TranD" where "id" <> %(id)s
        ) 
        
        
        select * from cte1 union
        select * from cte2 union
        select * from cte3 union
        select * from cte4 union
        select * from cte5 union
        select * from cte6 union
        select * from cte7 union
        select * from cte8 union
        select * from cte9 union
        select * from cte10 union
        select * from cte11 union
        select * from cte12 union
        select * from cte13 union
        select * from cte14 union
        select * from cte15 union
        select * from cte16 union
        select * from cte17 union
        select * from cte18 union
        select * from cte19 union
        select * from cte20 union
        select * from cte21 union
        select * from cte22 union
        select * from cte23 union
        select * from cte24 union
        select * from cte25 union
        select * from cte26 union
        select * from cte27     
        
        """
}
