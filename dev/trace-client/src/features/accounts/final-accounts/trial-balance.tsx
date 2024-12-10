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
import { ReduxCompSwitch } from "../../../controls/redux-components/redux-comp-switch";
import { reduxCompSwitchSelectorFn } from "../../../controls/redux-components/redux-comp-slice";
import { RootStateType } from "../../../app/store/store";
import { ReduxComponentsInstances } from "../../../controls/redux-components/redux-components-instances";

export function TrialBalance() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance: string = DataInstancesMap.trialBalance
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const { dbName, decodedDbParamsObject, } = userDetails

    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    const isAllBranches: boolean = useSelector((state: RootStateType) => reduxCompSwitchSelectorFn(state, ReduxComponentsInstances.reduxCompSwitchTrialBalance), shallowEqual) || false
    const decFormatter = Utils.getDecimalFormatter()
    const intFormatter = Utils.getIntegerFormatter()

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
                        CustomControl={() => <ReduxCompSwitch instance={ReduxComponentsInstances.reduxCompSwitchTrialBalance} className="" leftLabel="All branches" rightLabel="" />}
                        title='Trial Balance'
                        isAllBranches={isAllBranches}
                        isLastNoOfRows={false}
                        // isTitleVisible={false}
                        instance={instance}
                        width="calc(100vw - 250px)" // This stops unnecessary flickers
                    />
                    <CompSyncfusionTreeGrid
                        aggregates={getTrialBalanceAggregates()}
                        buCode={currentBusinessUnit.buCode}
                        childMapping="children"
                        className=""
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

    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'accName',
                headerText: 'Account Name',
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
                format: 'N2',
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
                footerTemplate: (props: any) => <span className="mr-3 h-20 font-semibold">{`Count: ${intFormatter.format(props.Count)}`}</span>,
            },
            {
                columnName: 'opening',
                customAggregate: (data: any) => customOpeningClosingAggregate(data, 'opening', 'opening_dc'),
                field: 'opening',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 py-2 font-semibold">{decFormatter.format(props.Custom)}</span>,
                type: 'Custom',
            },
            {
                columnName: 'debit',
                customAggregate: (data: any) => customDebitCreditAggregate(data, 'debit'),
                field: 'debit',
                // format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{decFormatter.format(props.Custom)}</span>,
                type: 'Custom',
            },
            {
                columnName: 'credit',
                customAggregate: (data: any) => customDebitCreditAggregate(data, 'credit'),
                field: 'credit',
                // format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{decFormatter.format(props.Custom)}</span>,
                type: 'Custom',
            },
            {
                columnName: 'closing',
                customAggregate: (data: any) => customOpeningClosingAggregate(data, 'closing', 'closing_dc'),
                field: 'closing',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{decFormatter.format(props.Custom)}</span>,
                type: 'Custom',
            }
        ])
    }

    function customDebitCreditAggregate(data: any, colType: string) {
        const res: Decimal = (data?.result || data) // when you pdf or excel export then figures are available in data and not in data.result
            .filter((item: any) => !item?.parentId) // Filter only top-level rows
            .reduce((acc: Decimal, current: any) => {
                return acc.plus(new Decimal(current[colType] || 0)); // Use Decimal for addition
            }, new Decimal(0)); // Initialize accumulator as Decimal
        return (res.abs().toNumber()); // Get the absolute value and convert back to a number
    }

    function customOpeningClosingAggregate(data: any, colType: string, dcColName: string) {
        const res: Decimal = (data?.result || data) // when you pdf or excel export then figures are available in data and not in data.result
            .filter((item: any) => !item?.parentId) // Filter only top-level rows
            .reduce((acc: Decimal, current: any) => {
                const multiplier = current[dcColName] === 'C' ? -1 : 1; // Determine the multiplier based on condition
                return acc.plus(new Decimal(multiplier).times(new Decimal(current[colType] || 0))); // Multiply and add with Decimal
            }, new Decimal(0)); // Initialize accumulator as Decimal
        return (res.abs().toNumber()); // Get the absolute value and convert back to a number
    }

    function openingColumnTemplate(props: any) {
        const clName: string = `font-bold text-md ${props.opening_dc === 'D' ? 'text-blue-500' : 'text-red-500'}`
        const ret = <div>
            <span>{decFormatter.format(props.opening)}</span>
            <span className={clName}>{props.opening_dc === 'D' ? ' Dr' : ' Cr'}</span>
        </div>
        return (ret)
    }

    function closingColumnTemplate(props: any) {
        const clName: string = `font-bold text-md ${props.closing_dc === 'D' ? 'text-blue-500' : 'text-red-500'}`
        const ret = <div>
            <span>{decFormatter.format(props.closing)}</span>
            <span className={clName}>{props.closing_dc === 'D' ? ' Dr' : ' Cr'}</span>
        </div>
        return (ret)
    }
}