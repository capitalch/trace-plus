import { useSelector } from "react-redux";
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map";
import { GraphQLQueryArgsType } from "../../../app/graphql/maps/graphql-queries-map";
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map";
import { useQueryHelper } from "../../../app/graphql/query-helper-hook";
import { RootStateType } from "../../../app/store/store";
import { Utils } from "../../../utils/utils";
import { BusinessUnitType, currentBusinessUnitSelectorFn, UserDetailsType } from "../../login/login-slice";

export function useTrialBalance() {
    const instance = DataInstancesMap.trialBalance
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    // const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn) || {}
    const { dbName, decodedDbParamsObject, isExternalDb } = userDetails
    const args: GraphQLQueryArgsType = {
        buCode: currentBusinessUnit.buCode,
        dbParams: isExternalDb ? decodedDbParamsObject : undefined,
        sqlId: SqlIdsMap.getTrialBalance,
        sqlArgs: {
            branchId: 1,
            finYearId: 2024
        }
    }

    const { loadData, loading, } = useQueryHelper({
        dbName: dbName,
        getQueryArgs: () => args,
        instance: instance,
    })

    const selectedData: any = useSelector((state: RootStateType) => {
        return (state.queryHelper[instance]?.data)
    })

    return ({ loadData, loading, selectedData })
}