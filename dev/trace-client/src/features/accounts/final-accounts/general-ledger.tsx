import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
// import { Utils } from "../../../utils/utils"
// import { BranchType, BusinessUnitType, FinYearType, UserDetailsType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn } from "../../login/login-slice"
import { shallowEqual, useSelector } from "react-redux"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { LedgerSubledger } from "../../../controls/redux-components/ledger-subledger"
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map"
import { CompSwitch } from "../../../controls/redux-components/comp-switch"
import { CompSyncFusionGrid } from "../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid"
import { selectCompSwitchStateFn, selectLedgerSubledgerFieldFn } from "../../../controls/redux-components/comp-slice"
import { RootStateType } from "../../../app/store/store"
import { useUtilsInfo } from "../../../utils/utils-info-hook"
import { useQueryHelper } from "../../../app/graphql/query-helper-hook"
import { WidgetLoadingIndicator } from "../../../controls/widgets/widget-loading-indicator"
import { useEffect } from "react"
import { CompInstances } from "../../../controls/redux-components/comp-instances"

export function GeneralLedger() {
    const instance: string = DataInstancesMap.generalLedger
    const selectedAccId: any = useSelector((state: RootStateType) => selectLedgerSubledgerFieldFn(state, instance, 'finalAccId'), shallowEqual)
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance), shallowEqual)
    // const selectedData: any[] = useSelector((state: RootStateType) => state.queryHelper[instance]?.data, shallowEqual)


    const {
        branchId
        , buCode
        // , context
        , dbName
        , decodedDbParamsObject
        // , decFormatter
        , finYearId
        // , intFormatter
    } = useUtilsInfo()

    const { loading, loadData } = useQueryHelper({
        instance: instance,
        isExecQueryOnLoad: false,
        dbName: dbName,
        getQueryArgs: () => ({
            buCode: buCode,
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getAccountLedger,
            sqlArgs: {
                finYearId: finYearId,
                branchId: isAllBranches ? undefined : branchId,
                accId: selectedAccId
            }
        })
    })

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<CompAccountsContainer >
        <div className="flex items-center">
            <label className="text-lg font-medium text-primary-400">General ledger</label>
            <CompSwitch leftLabel="All branches" instance={instance} className="ml-auto" />
            <LedgerSubledger
                className="mt-4 w-64 ml-auto mr-6"
                heading="All accounts"
                instance={instance}
                isAllBranches={isAllBranches}
                showAccountBalance={true}
                sqlId={SqlIdsMap.getLedgerLeafAccounts} />
        </div>
        {/* <CompSyncFusionGrid
        
        /> */}
    </CompAccountsContainer>)
}