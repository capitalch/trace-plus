import { shallowEqual, useSelector } from "react-redux";
import { BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, UserDetailsType } from "../../login/login-slice";
import { Utils } from "../../../utils/utils";
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container";
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map";
import { CompSyncFusionTreeGridToolbar } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { GraphQLQueriesMap } from "../../../app/graphql/maps/graphql-queries-map";
import { GlobalContext, GlobalContextType } from "../../../app/global-context";
import { useContext, useEffect } from "react";

export function TrialBalance() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance: string = DataInstancesMap.trialBalance
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const { dbName, decodedDbParamsObject, } = userDetails

    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    useEffect(() => {
        const loadData = context.CompSyncFusionTreeGrid[instance]?.loadData
        if (loadData) {
            loadData()
        }
    }, [currentBusinessUnit, currentFinYear, currentBranch])

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
                        className=""
                        dbName={dbName}
                        dbParams={decodedDbParamsObject}
                        graphQlQueryFromMap={GraphQLQueriesMap.trialBalance}
                        isLoadOnInit={false}
                        sqlArgs={{
                            branchId: currentBranch?.branchId || 0,
                            finYearId: currentFinYear?.finYearId || 1900,
                        }}
                        columns={getColumns()}
                        height="calc(100vh - 230px)"
                        instance={instance}
                        minWidth='600px'
                        rowHeight={35}
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
                format: 'N2',
                template: openingColumnTemplate
            },
            {
                field: 'debit',
                headerText: 'Debits',
                width: 90,
                textAlign: 'Right',
                format: 'N2'
            },
            {
                field: 'credit',
                headerText: 'Credits',
                width: 90,
                textAlign: 'Right',
                format: 'N2'
            },
            {
                field: 'closing',
                headerText: 'Closing',
                width: 90,
                textAlign: 'Right',
                template: closingColumnTemplate
            },
            {
                field: 'accType',
                headerText: 'Type',
                width: 40,
                textAlign: 'Center'
            }

        ])
    }

    function openingColumnTemplate(props: any) {
        const clName: string = `font-bold text-md ${props.opening_dc === 'D' ? 'text-blue-500' : 'text-red-500'}`
        const ret = <div>
            <span>{formatter.format(props.opening)}</span>
            <span className={clName}>{props.opening_dc === 'D' ? ' Dr' : ' Cr'}</span>
        </div>
        return (ret)
    }

    function closingColumnTemplate(props: any) {
        const clName: string = `font-bold text-md ${props.closing_dc === 'D' ? 'text-blue-500' : 'text-red-500'}`
        const ret = <div>
            <span>{formatter.format(props.closing)}</span>
            <span className={clName}>{props.closing_dc === 'D' ? ' Dr' : ' Cr'}</span>
        </div>
        return (ret)
    }

}