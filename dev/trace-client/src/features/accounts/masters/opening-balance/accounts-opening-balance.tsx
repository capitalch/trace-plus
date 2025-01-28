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
import _ from "lodash"

export function AccountsOpeningBalance() {
    const [, setRefresh] = useState({})
    // const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.accountsOpeningBalance
    const {
        branchId
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()

    const meta: any = useRef<MetaType>({
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
            cellEdit={onCellEdit}
            cellSave={onCellSave}
            childMapping="children"
            className="mr-6"
            columns={getColumns()}
            // dataBound={onDataBound}
            // dataPath="accountsOpeningBalance"
            dataSource={meta.current.rows}
            editSettings={{
                allowEditing: true,
                mode: 'Cell',
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
            queryCellInfo={onQueryCellInfo}
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
                allowEditing: false,
                field: 'accName',
                headerText: 'Account Name',
                width: 250,
                textAlign: 'Left'
            },
            {
                allowEditing: true,
                customAttributes: {
                    class: 'grid-col-edit'
                },
                edit: {
                    params:
                    {
                        decimals: 2,
                        format: 'N2',
                        showSpinButton: false,
                        step: 0.01,
                        validateDecimalOnType: true
                    }
                },
                editType: 'numericedit', // 'textedit',
                field: 'debit',
                headerText: 'Debits',
                format: 'N2',
                type: 'number',
                textAlign: 'Right',
                // validationRules: { required: true, regex: /^[0-9]+$/ },
                width: 80,
            },
            {
                allowEditing: true,
                customAttributes: {
                    class: 'grid-col-edit'
                },
                edit: {
                    params:
                    {
                        decimals: 2,
                        format: 'N2',
                        showSpinButton: false,
                        step: 0.01,
                        validateDecimalOnType: true
                    }
                },
                editType: 'numericedit', // 'textedit',
                field: 'credit',
                headerText: 'Credits',
                format: 'N2',
                type: 'number',
                textAlign: 'Right',
                // validationRules: { required: true, regex: /^[0-9]+$/ },
                width: 80,
            },
            {
                allowEditing: false,
                field: 'accType',
                headerText: 'Type',
                width: 80,
                textAlign: 'Left',
                template: accTypeTemplate
            },
            {
                allowEditing: false,
                field: 'accLeaf',
                headerText: 'Level',
                width: 80,
                textAlign: 'Left',
                template: accGroupTemplate
            },
            {
                allowEditing: false,
                field: 'id',
                isPrimaryKey: true,
                visible: false,
                width: 0
            }
        ])
    }

    function accGroupTemplate(props: AccountsOpeningBalanceType): string {
        const logicObject: any = {
            'L': 'Ledger',
            'N': 'Group',
            'S': 'Subledger',
            'Y': 'Leaf',
        }
        return (logicObject[props.accLeaf])
    }

    function accTypeTemplate(props: AccountsOpeningBalanceType) {
        const logicObject: any = {
            A: 'Asset',
            L: 'Liability',
            E: 'Expence',
            I: 'Income'
        }
        return (logicObject?.[props.accType] || '')
    }

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
            meta.current.rows = res?.data?.[queryName]
            if (!_.isEmpty(meta.current.rows)) {
                sumDebitCredit()
            }
        } catch (e: any) {
            console.log(e)
        }
    }

    function onCellEdit(args: any) {
        if (!['S', 'Y'].includes(args.rowData.accLeaf)) {
            args.cancel = true
            return
        }
        setTimeout(() => {
            if (['debit', 'credit'].includes(args.columnName)) {
                if (['S', 'Y'].includes(args.rowData.accLeaf)) {
                    const inputElement = args.row.querySelector('input');
                    if (inputElement) {
                        inputElement.value = parseFloat(inputElement.value).toFixed(2);
                        inputElement.focus();
                        inputElement.select();  // Select all text
                    }
                }
            }
        }, 50);
    }

    function onCellSave(args: any) {
        if (['debit', 'credit'].includes(args.column.field)) {
            if (args.previousValue !== args.value) {
                args.cell.style.backgroundColor = 'lightgreen'; // Add custom class to change cell background color
                sumDebitCredit()
                // args.rowData['isValueChanged'] = true
            }
        }
    }

    function onQueryCellInfo(args: any) {
        if (['debit', 'credit'].includes(args.column.field)) {
            if (['S', 'Y'].includes(args.data.accLeaf)) {
                if (args.cell.style.backgroundColor !== 'lightgreen') {
                    args.cell.style.backgroundColor = 'lightyellow';
                }
            }
        }
    }

    function sumDebitCredit() {
        const nodes: any[] = meta.current.rows
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
        const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        if (gridRef) {
            // gridRef.current.dataSource =[]
            gridRef.current.dataSource = structuredClone(nodes)
            // gridRef.current.trigger('dataBound')
            // gridRef.current.refresh()
            // gridRef.current.refreshColumns()
        }
        // setRefresh({})
        // return nodes;
    }
}

type AccountsOpeningBalanceType = {
    accLeaf: 'L' | 'S' | 'Y' | 'N'
    accName: string
    accType: 'L' | 'A'
    children: AccountsOpeningBalanceType[] | []
    credit: number
    debit: number
    id: number
    opId: number
    parentId: number
}

type MetaType = {
    rows: AccountsOpeningBalanceType[]
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