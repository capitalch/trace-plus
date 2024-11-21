class SqlAccounts:
    get_settings_fin_years_branches = """
        with cte1 as (
		select id as "branchId", "branchName", "branchCode"
			from "BranchM"
				order by "branchName", "branchCode")
        , cte2 as (
            select id as "finYearId", "startDate", "endDate"
                from "FinYearM"
                    order by id)
        , cte3 as (
            select id as "settingsId", "key", "textValue", "jData", "intValue"
                from "Settings"
                    order by id)
        select json_build_object(
            'allBranches', (select json_agg(row_to_json(a)) from cte1 a)
            , 'allFinYears', (select json_agg(row_to_json(b)) from cte2 b)
            , 'allSettings', (select json_agg(row_to_json(c)) from cte3 c)
	)"""