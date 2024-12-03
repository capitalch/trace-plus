import { shallowEqual, useSelector } from "react-redux";
import { Decimal } from 'decimal.js'
import { BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, UserDetailsType } from "../../login/login-slice";
import { Utils } from "../../../utils/utils";
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container";
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map";
import { CompSyncFusionTreeGridToolbar } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { GraphQLQueriesMap } from "../../../app/graphql/maps/graphql-queries-map";
import { GlobalContext, GlobalContextType } from "../../../app/global-context";
import { useContext, useEffect } from "react";
import { ReduxCompSwitch } from "../../../controls/components/redux-components/redux-comp-switch";
import { reduxCompSwitchSelectorFn } from "../../../controls/components/redux-components/redux-comp-slice";
import { RootStateType } from "../../../app/store/store";

export function TrialBalance() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance: string = DataInstancesMap.trialBalance
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const { dbName, decodedDbParamsObject, } = userDetails

    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    const isAllBranches: boolean = useSelector((state: RootStateType) => reduxCompSwitchSelectorFn(state, instance), shallowEqual) || false
    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    useEffect(() => {
        const loadData = context.CompSyncFusionTreeGrid[instance]?.loadData
        if (loadData) {
            loadData()
        }
    }, [currentBusinessUnit, currentFinYear, currentBranch, isAllBranches])

    return (
        <CompAccountsContainer>
            <div className='flex gap-8' style={{ width: 'calc(100vw - 260px)' }}>
                <div className='flex flex-col '>
                    <CompSyncFusionTreeGridToolbar className='mt-2'
                        CustomControl={() => <ReduxCompSwitch instance={instance} className="mr-2" leftLabel="This branch" rightLabel="All branches" />}
                        title='Trial Balance'
                        isLastNoOfRows={false}
                        instance={instance}
                        width="calc(100vw - 250px)" // This stops unnecessary flickers
                    />
                    <CompSyncfusionTreeGrid
                        aggregates={getTrialBalanceAggregates()}
                        buCode={currentBusinessUnit.buCode}
                        childMapping="children"
                        className=""
                        dataBound={onDataBound}
                        dbName={dbName}
                        dbParams={decodedDbParamsObject}
                        graphQlQueryFromMap={GraphQLQueriesMap.trialBalance}
                        isLoadOnInit={false}
                        sqlArgs={{
                            branchId: isAllBranches ? null : currentBranch?.branchId || 0,
                            finYearId: currentFinYear?.finYearId || 1900,
                        }}
                        columns={getColumns()}
                        height="calc(100vh - 250px)"
                        instance={instance}
                        minWidth='950px'
                        treeColumnIndex={0}
                    />
                </div>
            </div>
        </CompAccountsContainer>
    )

    function onDataBound(e: any) {
        // const ref: any = context.CompSyncFusionTreeGrid[instance]?.gridRef
        // if(ref)
        //     {
        //         ref.current.refresh()
        //     }
    }

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

    function getTrialBalanceAggregates(): SyncFusionTreeGridAggregateColumnType[] {
        return ([
            {
                columnName: 'accName',
                field: 'accName',
                format: 'N2',
                type: 'Count',
                footerTemplate: (props: any) => <span className="mr-3 h-20 font-semibold">{`Count: ${props.Count}`}</span>,
            },
            {
                columnName: 'opening',
                customAggregate: (data: any) => customOpeningClosingAggregate(data, 'opening', 'opening_dc'),
                field: 'opening',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 py-2 font-semibold">{props.Custom}</span>,
                type: 'Custom',
            },
            {
                columnName: 'debit',
                customAggregate: (data: any) => customDebitCreditAggregate(data, 'debit'),
                field: 'debit',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{props.Custom}</span>,
                type: 'Custom',
            },
            {
                columnName: 'credit',
                customAggregate: (data: any) => customDebitCreditAggregate(data, 'credit'),
                field: 'credit',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{props.Custom}</span>,
                type: 'Custom',
            },
            {
                columnName: 'closing',
                customAggregate: (data: any) => customOpeningClosingAggregate(data, 'closing', 'closing_dc'),
                field: 'closing',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{props.Custom}</span>,
                type: 'Custom',
            }
        ])
    }

    function customDebitCreditAggregate(data: any, colType: string) {
        const res: Decimal = data?.result
            .filter((item: any) => !item?.parentId) // Filter only top-level rows
            .reduce((acc: Decimal, current: any) => {
                return acc.plus(new Decimal(current[colType] || 0)); // Use Decimal for addition
            }, new Decimal(0)); // Initialize accumulator as Decimal
        const formatter = Utils.getDecimalFormatter()
        return formatter.format(res.abs().toNumber()); // Get the absolute value and convert back to a number
    }

    function customOpeningClosingAggregate(data: any, colType: string, dcColName: string) {
        const res: Decimal = data?.result
            .filter((item: any) => !item?.parentId) // Filter only top-level rows
            .reduce((acc: Decimal, current: any) => {
                const multiplier = current[dcColName] === 'C' ? -1 : 1; // Determine the multiplier based on condition
                return acc.plus(new Decimal(multiplier).times(new Decimal(current[colType] || 0))); // Multiply and add with Decimal
            }, new Decimal(0)); // Initialize accumulator as Decimal
        const formatter = Utils.getDecimalFormatter()
        return formatter.format(res.abs().toNumber()); // Get the absolute value and convert back to a number
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


// .reduce((acc: number, current: any) => {
//     const sign = (dcColName || '') === 'C' ? -1: 1
//     return (acc + (
//         (
//             sign
//         ) * current[colType]
//     ), 0)
// })
// .reduce((sum: Decimal, item: any) => sum.plus(item[colType] || 0), new Decimal(0))
// .toNumber(); // Convert back to a native number if needed