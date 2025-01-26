// import { useDispatch } from "react-redux"
// import { AppDispatchType } from "../../../../app/store/store"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
// import jsonData from '../../../../test-data/test-data1.json'
import { useEffect, useRef, useState } from "react"
// import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums"
import { Utils } from "../../../../utils/utils"

export function AccountsOpeningBalance() {
    const [, setRefresh] = useState({})
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

    const meta: any = useRef({
        rows: []
    })

    useEffect(() => {
        loadData()
    }, [])

    // const customTemplate = (props:any) => {
    //     return (
    //         <input
    //             type="text"
    //             defaultValue={props.value}
    //             // onChange={(e) => props.setValue(e.target.value)}
    //             className="e-input"
    //         />
    //     );
    // };

    return (<CompAccountsContainer>
        {/* <button onClick={sumDebitCredit} className="bg-slate-100 px-2 w-32">Test</button> */}
        <CompSyncFusionTreeGridToolbar className="mt-2"
            title='Accounts opening balances'
            isLastNoOfRows={false}
            instance={instance}
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            aggregates={getAggregates()}
            buCode={buCode}
            onCellEdit={onCellEdit}
            childMapping="children"
            className="mr-6"
            columns={getColumns()}
            // dataBound={onDataBound}
            // dataPath="accountsOpeningBalance"
            dataSource={meta.current.rows}
            editSettings={{
                allowEditing: true,
                mode: 'Cell',
                showConfirmDialog: false
            }}
            // dbName={dbName}
            // dbParams={decodedDbParamsObject}
            height="calc(100vh - 240px)"
            instance={instance}
            isLoadOnInit={false}
            loadData={loadData}
            // graphQlQueryFromMap={GraphQLQueriesMap.accountsOpeningBalance}
            minWidth='950px'
            // sqlArgs={{
            //     branchId: branchId || 0,
            //     finYearId: finYearId || 1900,
            // }}
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
                allowEditing: true,
                // customAttributes: {
                //     class: 'grid-col-edit'
                // },
                // editType:'textedit',
                field: 'debit',
                headerText: 'Debits',
                format: 'N2',
                type: 'number',
                textAlign: 'Right',
                width: 80,
                // editTemplate: {customTemplate}
            },
            {
                field: 'credit',
                headerText: 'Credits',
                format: 'N2',
                type: 'number',
                textAlign: 'Right',
                width: 80
            },
            {
                field: 'accType',
                headerText: 'Type',
                width: 80,
                textAlign: 'Left',
                // template: accTypeTemplate
            },
            {
                field: 'accLeaf',
                headerText: 'Level',
                width: 80,
                textAlign: 'Left',
                // template: accGroupTemplate
            },
            {
                field:'id',
                isPrimaryKey: true,
                visible: false,
                width: 0
            }
        ])
    }

    // function editTemplate(props: any) {
    //     return (
    //         <input
    //             type="text"
    //             defaultValue={props.value}
    //             onChange={(e) => props.setValue(e.target.value)}
    //             className="e-input bg-zinc-300"
    //         />
    //     );
    // }

    async function loadData() {
        const queryName: string = GraphQLQueriesMap.accountsOpeningBalance.name
        const q: any = GraphQLQueriesMap.accountsOpeningBalance(
            dbName || '',
            {
                buCode: buCode,
                dbParams: decodedDbParamsObject,
                sqlArgs: {
                    branchId: branchId,
                    finYearId: finYearId
                },
            }
        )
        try {
            const res: any = await Utils.queryGraphQL(q, queryName)
            const nodes: any[] | undefined = res?.data?.[queryName]
            if(nodes){
                sumDebitCredit(nodes)
            }
            meta.current.rows = nodes // res?.data?.[queryName]
            setRefresh({})
        } catch (e: any) {
            console.log(e)
        }
    }

    function onCellEdit(args: any){
        console.log(args)
        // args.cell.select()
    }

    function sumDebitCredit(nodes: any[]) {
        // const nodes: any[] = meta.current.rows
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
        // console.log(nodes)
        // setRefresh({})
        // return nodes;
    }
}

// type AccountsOpeningBalanceType = {
//     accLeaf: 'L' | 'S' | 'Y' | 'N'
//     accName: string
//     accType: 'L' | 'A'
//     children: AccountsOpeningBalanceType[] | []
//     credit: number
//     debit: number
//     id: number
//     opId: number
//     parentId: number
// }