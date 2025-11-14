import { Decimal } from 'decimal.js'
import { CompAccountsContainer } from "../../../controls/redux-components/comp-accounts-container";
import { DataInstancesMap } from "../../../app/maps/data-instances-map";
import { CompSyncFusionTreeGridToolbar } from "../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../app/maps/graphql-queries-map";
import { useEffect } from "react";
import { CompSwitch } from "../../../controls/redux-components/comp-switch";
import { CompInstances } from "../../../controls/redux-components/comp-instances";
import { useUtilsInfo } from "../../../utils/utils-info-hook";
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { AppDispatchType, RootStateType } from '../../../app/store';
import { selectCompSwitchStateFn, setCompAccountsContainerMainTitle } from '../../../controls/redux-components/comp-slice';
import { Utils } from '../../../utils/utils';
import { useNavigate } from 'react-router-dom';

export function TrialBalance() {
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()
    const instance: string = DataInstancesMap.trialBalance
    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, CompInstances.compSwitchTrialBalance), shallowEqual) || false
    const treeGridData = useSelector((state: RootStateType) => state.queryHelper[instance]?.data?.[0]?.jsonResult)
    // if(treeGridData){
    //     console.log(JSON.stringify(treeGridData))
    // }
    const {
        branchId
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        , decFormatter
        , finYearId
        , intFormatter
    } = useUtilsInfo()

    useEffect(() => {
        const loadData = context.CompSyncFusionTreeGrid[instance]?.loadData
        if (loadData) {
            loadData()
        }
    }, [buCode, finYearId, branchId, isAllBranches])

    // Restore scroll position after data loads
    useEffect(() => {
        if (treeGridData) {
            // Delay added to ensure grid is fully rendered and expanded nodes are restored
            // before attempting to restore scroll position (total delay: 100ms + 500ms internal)
            setTimeout(() => {
                Utils.treeGridUtils.restoreScrollPos(context, instance)
            }, 100)
        }
    }, [treeGridData, context, instance])

    // Set main title for Trial Balance
    useEffect(() => {
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: "Trial Balance" }));
    }, [dispatch]);

    return (
        <CompAccountsContainer>
            <CompSyncFusionTreeGridToolbar className='mt-2'
                CustomControl={() => <CompSwitch instance={CompInstances.compSwitchTrialBalance} className="" leftLabel="All branches" rightLabel="" />}
                title=''
                isAllBranches={isAllBranches}
                isLastNoOfRows={false}
                instance={instance}
                minWidth="400px"
            />
            <CompSyncfusionTreeGrid
                addUniqueKeyToJson={true}
                aggregates={getTrialBalanceAggregates()}
                buCode={buCode}
                childMapping="children"
                className="mr-6"
                columns={getColumns()}
                dbName={dbName}
                dbParams={decodedDbParamsObject}
                graphQlQueryFromMap={GraphQLQueriesMap.trialBalance}
                graphQlQueryName={GraphQLQueriesMapNames.trialBalance}
                height="calc(100vh - 227px)"
                instance={instance}
                minWidth='400px'
                sqlArgs={{
                    branchId: isAllBranches ? null : branchId || 0,
                    finYearId: finYearId || 1900,
                }}
                onZoomIn={handleOnZoomIn}
                treeColumnIndex={0}
                zoomInColumnWidth={30}
            />
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
                footerTemplate: (props: any) => <span className="mr-3 py-2 font-semibold">{Utils.toDecimalFormat(props.Custom || 0)}</span>,
                type: 'Custom',
            },
            {
                columnName: 'debit',
                customAggregate: (data: any) => customDebitCreditAggregate(data, 'debit'),
                field: 'debit',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{Utils.toDecimalFormat(props.Custom)}</span>,
                type: 'Custom',
            },
            {
                columnName: 'credit',
                customAggregate: (data: any) => customDebitCreditAggregate(data, 'credit'),
                field: 'credit',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{Utils.toDecimalFormat(props.Custom || 0)}</span>,
                type: 'Custom',
            },
            {
                columnName: 'closing',
                customAggregate: (data: any) => customOpeningClosingAggregate(data, 'closing', 'closing_dc'),
                field: 'closing',
                format: 'N2',
                footerTemplate: (props: any) => <span className="mr-3 font-semibold">{Utils.toDecimalFormat(props.Custom)}</span>,
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

    function handleOnZoomIn(rowData: any) {
        if (!rowData?.id) {
            return
        }
        navigate('/general-ledger', {
            state: {
                accountId:rowData.id,
                returnPath:'/trial-balance',
                reportName: 'Trial Balance'
            }
        })
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