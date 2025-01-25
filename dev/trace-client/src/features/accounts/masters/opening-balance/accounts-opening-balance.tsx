// import { useDispatch } from "react-redux"
// import { AppDispatchType } from "../../../../app/store/store"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import jsonData from '../../../../test-data/test-data1.json'

export function AccountsOpeningBalance() {
    // const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.accountsOpeningBalance
    const {
        branchId
        , buCode
        // , context
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()

    return (<CompAccountsContainer>
        <button onClick={sumDebitCredit} className="bg-slate-100 px-2 w-32">Test</button>
        <CompSyncFusionTreeGridToolbar className="mt-2"
            title='Accounts opening balances'
            isLastNoOfRows={false}
            instance={instance}
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            aggregates={getAggregates()}
            buCode={buCode}
            childMapping="children"
            className="mr-6"
            // dataBound={onDataBound}
            dataPath="accountsOpeningBalance"
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            isLoadOnInit={true}
            graphQlQueryFromMap={GraphQLQueriesMap.accountsOpeningBalance}
            columns={getColumns()}
            height="calc(100vh - 240px)"
            instance={instance}
            minWidth='950px'
            sqlArgs={{
                branchId: branchId || 0,
                finYearId: finYearId || 1900,
            }}
            treeColumnIndex={0}
        />
    </CompAccountsContainer>)

    function getAggregates(): SyncFusionTreeGridAggregateColumnType[] {
        return ([
            {
                columnName: 'accName',
                field: 'accName',
                type: 'Count',
                footerTemplate: (props: any) => `Count: ${props['accName - count']}`,
            }
        ])
    }

    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'accName',
                headerText: 'Account Name',
                width: 250,
                textAlign: 'Left'
            },
            {
                field: 'accType',
                headerText: 'Type',
                width: 80,
                textAlign: 'Left',
                // template: accTypeTemplate
            },
            {
                field: 'accClass',
                headerText: 'Class',
                width: 80,
                textAlign: 'Left'
            },
            {
                field: 'accLeaf',
                headerText: 'Level',
                width: 80,
                textAlign: 'Left',
                // template: accGroupTemplate
            },
        ])
    }

    function sumDebitCredit() {
        const nodes: any[] = jsonData
        function calculateTotals(node: any) {
            if (!node.children || node.children.length === 0) {
                return { debit: node.debit, credit: node.credit };
            }
            let totalDebit = node.debit;
            let totalCredit = node.credit;

            node.children.forEach((child: any) => {
                const childTotals = calculateTotals(child);
                totalDebit += childTotals.debit;
                totalCredit += childTotals.credit;
            });

            node.debit = totalDebit;
            node.credit = totalCredit;

            return { debit: totalDebit, credit: totalCredit };
        }

        nodes.forEach((node: any) => calculateTotals(node));
        console.log(nodes)
        return nodes;
    }
}