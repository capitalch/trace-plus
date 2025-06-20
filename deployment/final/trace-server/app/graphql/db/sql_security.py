class SqlSecurity:
    delete_business_unit = """
            WITH updated AS (
                UPDATE "UserM"
                SET "lastUsedBuId" = NULL
                WHERE "lastUsedBuId" = %(id)s
            )
            DELETE FROM "BuM"
            WHERE id = %(id)s
    """
    does_database_exist = """
        with "dbName" as (values(%(dbName)s::text))
        --with "dbName" as (values('client-capital'))
            select exists(select 1 from pg_catalog.pg_database where datname = (table "dbName")) as "doesExist"
    """
    
    does_schema_exist_in_db = """
    with "buCode" as (values(%(buCode)s::text))
        --with "buCode" as (values('temp'))
        SELECT exists(
                    select 1 
                        FROM "information_schema"."schemata" 
                            WHERE schema_name = (table "buCode")) as "doesExist"
    """
    
    does_user_email_exist = """
        with "email" as (values(%(email)s)), "clientId" as (values(%(clientId)s::int))
            --with "email" as (values('capitalch@gmail.com')), "clientId" as (values(51))
        select exists(select 1
            from "UserM"
                where "clientId" = (table "clientId") and "userEmail" = (table "email"))
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

    get_admin_dashboard = """
        with "clientId" as (values(%(clientId)s))
		--with "clientId" as (values(51))
		, cte1 as (
		 	select COUNT(*) count
				from "BuM"
			 		where "clientId" = (table "clientId") and "isActive")
		, cte2 as (
			select COUNT(*) count
				from "RoleM"
					where "clientId" = (table "clientId"))
		, cte3 as (
			select COUNT(*) count
				from "UserM"
					where "clientId" = (table "clientId") and "isActive" and ("roleId" is not null))
        select json_build_object(
                    'businessUnitsCount', (select count from cte1)
                    , 'rolesCount', (select count from cte2)
                    , 'businessUsersCount', (select count from cte3)
                ) as "jsonResult"
    """

    get_admin_role_on_roleName_clientId = """
        with "roleName" as (values(%(roleName)s)), "clientId" as (values(%(clientId)s::int))
            --with "roleName" as (values('manager')), "clientId" as (values(51))
                select "roleName" from "RoleM"
                    where lower("roleName") = (table "roleName")
                        and "clientId" = (table "clientId")
    """
    
    get_admin_roles_securedControls_link = """
     with "clientId" as (values(%(clientId)s::int))
        --with "clientId" as (values(51))
 		, cte1 as (
            select r.id as "roleId", "roleName" as "name", r."descr"
                , json_agg(
                    json_build_object
                        (
                            'id', x.id,
                            'name', s."controlName",
                            'descr', s."descr",
							'roleId', r.id,
							'securedControlId', s.id
                        )
                ) FILTER (WHERE s."controlName" IS NOT NULL) AS "securedControls"
            from "RoleM" r
                left join "RoleSecuredControlX" x
                    on r.id = x."roleId"
                left join "SecuredControlM" s
                    on s.id = x."securedControlId"
                where r."clientId" = (table "clientId")
            GROUP by r.id,"roleName"
            order by "roleName"
        )
        
        select json_agg(
            json_build_object(
                'name',"name",
				'descr',"descr",
				'roleId',"roleId",
                'securedControls',COALESCE("securedControls", null::json)
            )
        ) as "jsonResult" from cte1
    """

    get_all_admin_roles_onClientId = """
        with "noOfRows" as (values(%(noOfRows)s::int)), "clientId" as (values(%(clientId)s::int))
        --with "noOfRows" as (values(null::int)), "clientId" as (values(51))
            select * from "RoleM"
                where "clientId" = (table "clientId")
            order by "id" DESC
                limit (table "noOfRows")
    """

    get_all_admin_users = """
        with "noOfRows" as (values(%(noOfRows)s::int))
        --with "noOfRows" as (values(null::int))
            select c.id as "clientId" 
				, "clientName"
                , "clientCode"
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

    get_all_business_users_on_clientId = """
        with "noOfRows" as (values(%(noOfRows)s::int)), "clientId" as (values(%(clientId)s::int))
        --with "noOfRows" as (values(null::int)), "clientId" as (values(51))
            select c.id as "clientId" 
				, r."id" as "roleId"
				, "roleName"
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
				join "RoleM" r
					on r."id" = u."roleId"
				where "roleId" is not null
					and u."clientId" = (table "clientId")
                order by u."id" DESC
                    limit (table "noOfRows")
    """

    get_all_business_units_on_clientId = """
        with "clientId" as (values(%(clientId)s))
		--with "clientId" as (values(51))
		select *
			from "BuM"
				where "clientId" = (table "clientId")
            order by "id" DESC
    """

    get_all_clients = """
        with "noOfRows" as (values(%(noOfRows)s::int))
        --with "noOfRows" as (values(null::int))
            select * from "ClientM"
                order by "id" DESC
                    limit (table "noOfRows")
    """

    get_all_client_names_no_args = """
        select "id", "clientName", "clientCode" from "ClientM"
                order by "clientName"
    """

    get_all_roles = """
        with "noOfRows" as (values(%(noOfRows)s::int))
        --with "noOfRows" as (values(null::int))
            select * from "RoleM"
                where "clientId" is null
            order by "id" DESC
                limit (table "noOfRows")
    """

    get_all_role_names_on_clientId_with_builtin_roles = """
        with "clientId" as (values(%(clientId)s::int))
        --with "clientId" as (values(51))
            select "id"
			, "roleName"
			from "RoleM"
				where ("clientId" = (table "clientId")) or ("clientId" is null)
                order by "roleName"
    """

    get_all_secured_controls = """
        with "noOfRows" as (values(%(noOfRows)s::int))
            --with "noOfRows" as (values(null::int))
                select * from "SecuredControlM"
                    order by "id" DESC
                        limit (table "noOfRows")
    """

    get_bu_on_buCode_and_clientId = """
        with "clientId" as (values(%(clientId)s)), "buCode" as (values(%(buCode)s))
		--with "clientId" as (values(51)), "buCode" as (values('test'))
            select "buName"
                from "BuM"
                    where "clientId" = (table "clientId") 
                        and "buCode" = (table "buCode")
    """

    get_bu_users_link = """
        with "clientId" as (values(%(clientId)s::int))
        --with "clientId" as (values(51))
        , cte1 as (
            select bu.id as "buId", "buCode" as "code", "buName" as "name"
                ,json_agg(
                    json_build_object
                        (
                            'id', x.id,
                            'code', u."uid",
                            'name', u."userName",
							'buId', bu.id,
							'userId', u.id
                        )
                ) FILTER (WHERE u."uid" IS NOT NULL AND u."userName" IS NOT NULL) AS users
            from "BuM" bu
                left join "UserBuX" x
                    on bu.id = x."buId"
                left join "UserM" u
                    on u.id = x."userId"
                where bu."clientId" = (table "clientId")
            GROUP by bu.id
            order by "buCode", "buName"
        )
        
        select json_agg(
            json_build_object(
                'code',"code",
                'name',"name",
				'buId',"buId",
                'users',COALESCE(users, null::json)
            )
        ) as "jsonResult" from cte1
    """

    get_builtin_roles = """
        select *
            from "RoleM"
                where "clientId" is null
    """

    get_client_details_on_id = """
       with "id" as (values(%(id)s::int))
        --with "id" as (values(51))
            select "clientCode", "isActive", "isExternalDb", "dbName", "dbParams"
                from "ClientM"
                    where "id" = (table "id")
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

    get_roles_securedControls_link = """
        with cte1 as (
            select r.id as "roleId", "roleName" as "name", r."descr"
                , json_agg(
                    json_build_object
                        (
                            'id', x.id,
                            'name', s."controlName",
                            'descr', s."descr",
							'roleId', r.id,
							'securedControlId', s.id
                        )
                ) FILTER (WHERE s."controlName" IS NOT NULL) AS "securedControls"
            from "RoleM" r
                left join "RoleSecuredControlX" x
                    on r.id = x."roleId"
                left join "SecuredControlM" s
                    on s.id = x."securedControlId"
                where r."clientId" is null
            GROUP by r.id,"roleName"
            order by "roleName"
        )
        
        select json_agg(
            json_build_object(
                'name',"name",
				'descr',"descr",
				'roleId',"roleId",
                'securedControls',COALESCE("securedControls", null::json)
            )
        ) as "jsonResult" from cte1
    """
    
    get_securedControls_not_linked_with_roleId="""
        with "roleId" as (values(%(roleId)s::int))
            --with "roleId" as (values(26))
            SELECT s.id, "controlType"||' : '|| "controlName" as "controlName"
                FROM "SecuredControlM" s
                WHERE s.id NOT IN (
                    SELECT x."securedControlId"
                    FROM "RoleSecuredControlX" x
                    WHERE x."roleId" = (table "roleId")
                )
            ORDER BY "controlType", "controlName"
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

    get_userId_client_name_on_clientId_email = """
        with "email" as (values(%(email)s)), "clientId" as (values(%(clientId)s::int))
            --with "email" as (values('capitalch@gmail.com')), "clientId" as (values(51))
        select "clientName", u.id
			from "ClientM" c
				join "UserM" u
					on c.id = u."clientId"
             where "clientId" = (table "clientId") and "userEmail" = (table "email")
    
    """

    get_userId_on_clientId_and_email = """
        with "clientId" as (values(%(clientId)s::int)), "userEmail" as (values(%(userEmail)s)), "id" as (values(%(id)s))
			--with "clientId" as (values(8)), "userEmail" as (values('capitalch@gmail.com')), "id" as (values(null::int))
            select id from "UserM"
				where "clientId" = (table "clientId")
					and "userEmail" = (table "userEmail")
					and "id" <> COALESCE((table "id")::int,0)
    """

    get_userId_on_clientId_and_uid = """
        with "clientId" as (values(%(clientId)s::int)), "uid" as (values(%(uid)s)), "id" as (values(%(id)s))
            --with "clientId" as (values(51)), "uid" as (values('capital')), "id" as (values(56::int))
            select id from "UserM"
                where "clientId" = (table "clientId")
                    and "uid" = (table "uid")
                    and "id" <> (table "id")
    """

    get_user_details = """
        with "uidOrEmail" as (values(%(uidOrEmail)s)), "clientId" as (values(%(clientId)s::int))
            --with "uidOrEmail" as (values('capitalch@gmail.com')), "clientId" as (values(51))
            , cte1 as ( -- user details
                select u.id, "uid", "userEmail", "hash", "userName", u."roleId" as "roleId"
                    , "branchIds", "lastUsedBuId", "lastUsedBranchId", "lastUsedFinYearId", u."clientId", "mobileNo", u."isActive" as "isUserActive"
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
                where b."isActive" 
					and (("uid" = (table "uidOrEmail") 
							or ("userEmail" = (table "uidOrEmail"))))
				order by "buName")
            , cte3 as ( -- role
                    select r.id as "roleId", r."roleName", r."clientId" 
                    from cte1 u
                        left join "RoleM" r
                            on r.id = u."roleId"
            )
			, cte4 as ( -- Select all business units assoiated with clientId
					select b.id as "buId", "buCode", "buName"
						from "BuM" b
							where "clientId" = (table "clientId")
                        order by "buName"
			)
			, cte5 as ( -- all secured controls
					select id, "controlName", "controlNo", "controlType", "descr"
						from "SecuredControlM"
                            order by "controlType", "controlName"
			)
			, cte6 as ( -- user Secured controls
				select s.id, "controlName", "controlNo", "controlType", s."descr"
					from "UserM" u
						join "RoleM" r
							on r.id = u."roleId"
						join "RoleSecuredControlX" x
							on r.id = x."roleId"
						join "SecuredControlM" s
							on s.id = x."securedControlId"
                where (
						(("uid" = (table "uidOrEmail")) or ("userEmail" = (table "uidOrEmail")))
							and u."clientId" = (table "clientId"))
                    order by "controlType", "controlName"
			)
            select json_build_object(
                'userDetails',(select row_to_json(a) from cte1 a)
                , 'userBusinessUnits', (select json_agg(row_to_json(b)) from cte2 b)
				, 'allBusinessUnits', (select json_agg(row_to_json(d))from cte4 d)
                , 'role', (select row_to_json(c) from cte3 c)
				, 'allSecuredControls', (select json_agg(row_to_json(e)) from cte5 e)
				, 'userSecuredControls', (select json_agg(row_to_json(f)) from cte6 f)
            ) as "jsonResult"
    """

    get_user_hash = """
        with "id" as (values(%(id)s::int))
			--with "id" as (values(56))
	            select "hash" from "UserM"
					where "id" = (table "id")
    """

    get_users_not_linked_with_buId_exclude_admin = """
        with "buId" as (values(%(buId)s::int))
            --with "buId" as (values(43))
            SELECT u.id, "userName"||' : '||"userEmail"||' : '||uid as "user"
            FROM "UserM" u
            LEFT JOIN "UserBuX" x
                ON u.id = x."userId" AND x."buId" = (table "buId")
            JOIN "BuM" b
                on b.id = (table "buId") AND u."clientId" = b."clientId"
            WHERE (x."userId" IS NULL ) and (u."roleId" is not null)
            ORDER BY "userName", "userEmail", uid;
    """
    
    import_secured_controls = """
        INSERT INTO "SecuredControlM" ("controlNo", "controlName", "controlType", "descr")
        VALUES (%(controlNo)s, %(controlName)s, %(controlType)s, %(descr)s)
        ON CONFLICT ("controlName")
        DO UPDATE SET
            "controlNo" = EXCLUDED."controlNo",
            "controlType" = EXCLUDED."controlType",
            "descr" = EXCLUDED."descr";
    """

    insert_securedControls_from_builtin_role = """
        with "adminRoleId" as (values(%(adminRoleId)s::int)), "superAdminRoleId" as (values(%(superAdminRoleId)s::int))
            --with "adminRoleId" as (values(32)), "superAdminRoleId" as (values(26))
            , cte1 as (
                select "securedControlId"
                    from "RoleSecuredControlX"
                        where "roleId" = (table "superAdminRoleId"))
            , cte2 as (
                select "securedControlId"
                    from "RoleSecuredControlX"
                        where "roleId" = (table "adminRoleId"))
            , cte3 as (
                select (table "adminRoleId") as "roleId"
                    , "securedControlId" from cte1
                        where "securedControlId" not in(
                            select "securedControlId"
                                from cte2))
            insert into "RoleSecuredControlX"("roleId", "securedControlId")
                select "roleId", "securedControlId"
                    from cte3
    """

    test_connection = """
        select 'ok' as "connection"
    """

    update_user_hash = """
        with "id" as (values(%(id)s::int)), "hash" as (values(%(hash)s))
			--with "id" as (values(56)), "hash" as (values('$2b$12$vcAUj2OC1XkPcT/hE7pFn.bBa84EVJWpraFV8ojEGthBoXBn4JzFa'))
	            update "UserM"
					set "hash" = (table "hash")
						where "id" = (table "id")
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
