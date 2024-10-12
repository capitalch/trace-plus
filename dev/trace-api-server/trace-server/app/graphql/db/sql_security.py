class SqlSecurity:

    does_user_email_exist = """
        with "email" as (values(%(email)s))
            --with "email" as (values('capitalch@gmail.com'))
        select exists(select 1
            from "UserM"
                where "userEmail" = (table "email"))
    """

    does_user_with_id_and_uid_exist = """
        with "uid" as (values(%(uid)s)), "id" as (values(%(id)s::int))
            --with "uid" as (values('MsqVEc0W')), "id" as (values(56))
            select exists(select 1 from "UserM"
	            where ("id" =(table "id")) and uid=(table "uid"))
    """

    drop_public_schema = """
        DROP SCHEMA IF EXISTS public RESTRICT
    """

    get_all_admin_users = """
        with "noOfRows" as (values(%(noOfRows)s::int))
        --with "noOfRows" as (values(null::int))
            select c.id as "clientId" 
				, "clientName"
				, u."id"
				, "uid"
				, "userName"
				, "mobileNo"
				, "userEmail"
				, u."descr"
				, u."isActive"
				, u."timestamp"
			from "UserM" u
				join "ClientM" c
					on c.id = u."clientId"
				where "roleId" is null
                order by u."id" DESC
                    limit (table "noOfRows")
    """

    get_all_clients = """
        with "noOfRows" as (values(%(noOfRows)s::int))
        --with "noOfRows" as (values(null::int))
            select * from "ClientM"
                order by "id" DESC
                    limit (table "noOfRows")
    """

    get_all_client_names_no_args = """
        select "id", "clientName" from "ClientM"
                order by "clientName"
    """

    get_all_roles = """
        with "noOfRows" as (values(%(noOfRows)s::int))
        --with "noOfRows" as (values(null::int))
            select * from "RoleM"
                order by "id" DESC
                    limit (table "noOfRows")
    """

    get_all_secured_controls = """
        with "noOfRows" as (values(%(noOfRows)s::int))
            --with "noOfRows" as (values(null::int))
                select * from "SecuredControlM"
                    order by "id" DESC
                        limit (table "noOfRows")
    """

    get_clients_on_criteria = """
        with "criteria" as (values(%(criteria)s::text))
        --with "criteria" as (values('cap'::text))
            select "id" 
				, "clientName"
			from "ClientM" c
				where LOWER("clientName") like LOWER((table "criteria") || '%%')
            order by "clientName"
    """

    get_client_on_clientCode = """
            select 1 as "clientCode" from "ClientM"
                where lower("clientCode") = %(clientCode)s
        """

    get_client_on_clientName = """
            select 1 as "clientName" from "ClientM"
                where lower("clientName") = %(clientName)s
        """

    get_db_name_in_catalog = """
        SELECT datname FROM pg_catalog.pg_database where datname = %(datname)s
    """

    get_super_admin_dashboard = """
        with "dbName" as (values(%(dbName)s))
         --with "dbName" as (values('traceAuth'))
        , cte1 as(
            SELECT count(*) as count, state FROM pg_stat_activity 
                where datname = (table "dbName") and state in('active', 'idle')
                    group by state)
		, cte2 as (
			SELECT count(*) as count, "isActive"
				from "ClientM"
					group by "isActive")
		, cte3 as (
			SELECT count(*) as count 
				FROM pg_database 
					where datname not in('template0', 'template1'))
		, cte4 as (
			SELECT count(*) as count
				from "SecuredControlM")
		, cte5 as ( -- Admin user when roleId is null, normal user when roleId is not null
			SELECT count(*) as count, "roleId"
				from "UserM" group by "roleId")
		, cte6 as ( -- Super admin role if clientId is null, client role otherwise
			SELECT count(*) as count, "clientId"
				from "RoleM" group by "clientId")
  
            select json_build_object(
                'connections',(select json_agg(row_to_json(a)) from cte1 a)
				, 'clients', (select json_agg(row_to_json(b)) from cte2 b)
				, 'dbCount', (select count from cte3)
				, 'securedControlsCount', (select count from cte4)
				, 'users', (select json_agg(row_to_json(c)) from cte5 c)
				, 'roles', (select json_agg(row_to_json(d)) from cte6 d)
            ) as "jsonResult"
    """

    get_super_admin_control_on_control_name = """
        with "controlName" as (values(%(controlName)s))
        --with "controlName" as (values('vouchers-journal'))
            select 1 as "controlName" from "SecuredControlM"
                where lower("controlName") = (table "controlName")
    """

    get_super_admin_role_on_role_name = """
        with "roleName" as (values(%(roleName)s))
        --with "roleName" as (values('manager'))
            select 1 as "roleName" from "RoleM"
                where lower("roleName") = (table "roleName")
    """

    get_userId_on_clientId_and_email = """
        with "clientId" as (values(%(clientId)s::int)), "userEmail" as (values(%(userEmail)s)), "id" as (values(%(id)s))
			--with "clientId" as (values(8)), "userEmail" as (values('capitalch@gmail.com')), "id" as (values(null::int))
            select id from "UserM"
				where "clientId" = (table "clientId")
					and "userEmail" = (table "userEmail")
					and "id" <> COALESCE((table "id")::int,0)
    """

    get_user_details = """
        with "uidOrEmail" as (values(%(uidOrEmail)s)), "clientId" as (values(%(clientId)s::int))
            --with "uidOrEmail" as (values('capitalch@gmail.com')), "clientId" as (values(51))
            , cte1 as ( -- user details
                select u.id, "uid", "userEmail", "hash", "userName"
                    , "branchIds", "lastUsedBuId", "lastUsedBranchId", u."clientId", "mobileNo", u."isActive" as "isUserActive", u."roleId"
					, c."clientCode", c."clientName", c."isActive" as "isClientActive", c."isExternalDb", c."dbName", c."dbParams"
                , CASE when ("roleId" is null) THEN 'A' ELSE 'B' END as "userType"	
                from "UserM" u
					join "ClientM" c
						on c."id" = u."clientId"
                where (
					(("uid" = (table "uidOrEmail")) or ("userEmail" = (table "uidOrEmail")))
						and c."id" = (table "clientId")
				))
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
    """

    test_connection = """
        select 'ok' as "connection"
    """

    update_user_uid = """
        with "uid" as (values(%(uid)s)), "id" as (values(%(id)s::int))
            --with "uid" as (values('MsqVEc0W')), "id" as (values(56))
            update "UserM"
                set "uid" = (table "uid")
                    where "id" = (table "id")
    """
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
