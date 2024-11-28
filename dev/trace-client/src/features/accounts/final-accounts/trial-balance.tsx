import { useSelector } from "react-redux";
import { BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, UserDetailsType } from "../../login/login-slice";
import { Utils } from "../../../utils/utils";
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container";
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map";
import { CompSyncFusionTreeGridToolbar } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { GraphQLQueriesMap } from "../../../app/graphql/maps/graphql-queries-map";

export function TrialBalance() {
    const instance: string = DataInstancesMap.trialBalance
    // const loginInfo: LoginType = Utils.getCurrentLoginInfo()
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn) || {}
    const { dbName, decodedDbParamsObject, } = userDetails
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn) 
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn)
    return (
        <CompAccountsContainer>
            <div className='flex gap-8' style={{ width: 'calc(100vw - 260px)' }}>
                <div className='flex flex-col '>
                    <CompSyncFusionTreeGridToolbar className='mt-2'
                        title='Trial Balance'
                        isLastNoOfRows={false}
                        instance={instance}
                    />
                    <CompSyncfusionTreeGrid
                        // aggregates={getBusinessUserssAggregates()}
                        buCode={currentBusinessUnit.buCode}
                        childMapping="children"
                        className="mt-4"
                        dbName={dbName}
                        dbParams={decodedDbParamsObject}
                        graphQlQueryFromMap={GraphQLQueriesMap.trialBalance}
                        isLoadOnInit={true}
                        sqlArgs={{
                            branchId: currentBranch?.branchId || 0,
                            finYearId: currentFinYear?.finYearId || 1900,
                        }}
                        columns={getColumns()}
                        height="calc(100vh - 250px)"
                        instance={instance}
                        minWidth='600px'
                        rowHeight={40}
                        treeColumnIndex={0}
                    />
                </div>
            </div>
        </CompAccountsContainer>
    )

    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'accName',
                headerText: 'Acc Name',
                width: 250,
                textAlign: 'Left'
            },
            {
                field: 'opening',
                headerText: 'Opening',
                width: 90,
                textAlign: 'Right',
                format:'N2'
            },
            {
                field: 'debit',
                headerText: 'Debits',
                width: 90,
                textAlign: 'Right',
                format:'N2'
            },
            {
                field: 'credit',
                headerText: 'Credits',
                width: 90,
                textAlign: 'Right',
                format:'N2'
            },
            {
                field: 'closing',
                headerText: 'Closing',
                width: 90,
                textAlign: 'Right',
                format:'N2'
            },
            {
                field:'accType',
                headerText:'Type',
                width:40,
                textAlign:'Center'
            }

        ])
    }
}