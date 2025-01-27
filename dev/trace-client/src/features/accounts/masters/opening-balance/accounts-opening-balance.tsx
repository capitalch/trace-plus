// import { useDispatch } from "react-redux"
// import { AppDispatchType } from "../../../../app/store/store"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { useEffect, useRef } from "react"
// import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums"
import { Utils } from "../../../../utils/utils"
import _ from "lodash"
import { Messages } from "../../../../utils/messages"
// import Decimal from "decimal.js"

export function AccountsOpeningBalance() {
    // const [, setRefresh] = useState({})
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
        rows: [],
        flatData: {}
    })

    useEffect(() => {
        loadData()
        context.CompSyncFusionTreeGrid[instance].isCollapsed = false
    }, [])

    return (<CompAccountsContainer>
        {/* <button onClick={sumDebitCredit} className="bg-slate-100 px-2 w-32">Test</button> */}
        <CompSyncFusionTreeGridToolbar className="mt-2"
            title='Accounts opening balances'
            isLastNoOfRows={false}
            instance={instance}
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            actionComplete={onActionComplete}
            aggregates={getAggregates()}
            buCode={buCode}
            cellEdit={onCellEdit}
            // cellSave={onCellSave}
            childMapping="children"
            className="mr-6"
            columns={getColumns()}
            dataSource={meta.current.rows}

            editSettings={{
                allowEditing: true,
                mode: 'Cell',
            }}
            height="calc(100vh - 240px)"
            instance={instance}

            isLoadOnInit={false}
            loadData={loadData}
            minWidth='950px'
            queryCellInfo={onQueryCellInfo}
            treeColumnIndex={0}
        />
    </CompAccountsContainer>)

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

    function calculateCredits() {
        // const ret: Decimal = meta.current.transactionsCopy.reduce((sum: Decimal, current) => (sum.plus(current.credit || 0)), new Decimal(0))
        // const r: number = ret.toNumber()
        // return (r)
    }

    function calculateDebits() {
        // const ret: Decimal = meta.current.transactionsCopy.reduce((sum: Decimal, current) => (sum.plus(current.debit || 0)), new Decimal(0))
        // const r: number = ret.toNumber()
        // return (r)
    }

    function getAggregates(): SyncFusionTreeGridAggregateColumnType[] {
        return ([
            {
                columnName: 'accName',
                field: 'accName',
                type: 'Count',
                footerTemplate: (props: any) => `Count: ${props['accName - count']}`,
            },
            // {
            //     columnName: 'debit',
            //     field: 'debit',
            //     format: 'N2',
            //     type: 'Custom',
            //     customAggregate: calculateDebits,
            //     // footerTemplate: (props: any) => <span>{`${decFormatter.format(props?.['debit - custom'] || 0)}`}</span>
            // },
            // {
            //     columnName: 'credit',
            //     field: 'credit',
            //     format: 'N2',
            //     type: 'Custom',
            //     customAggregate: calculateCredits,
            //     // footerTemplate: (props: any) => <span>{`${decFormatter.format(props?.['credit - custom'] || 0)}`}</span>
            // },
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
                        validateDecimalOnType: true
                    }
                },
                editType: 'numericedit',
                field: 'debit',
                headerText: 'Debits',
                format: 'N2',
                type: 'number',
                textAlign: 'Right',
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
                        validateDecimalOnType: true
                    }
                },
                editType: 'numericedit', // 'textedit',
                field: 'credit',
                headerText: 'Credits',
                format: 'N2',
                type: 'number',
                textAlign: 'Right',
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

    function flattenData(items: AccountsOpeningBalanceType[]) {
        items.forEach((item: AccountsOpeningBalanceType) => {
            meta.current.flatData[item.id] = item
            if (item.children && item.children.length > 0) {
                flattenData(item.children)
            }
        })
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
                flattenData(meta.current.rows)
            }
        } catch (e: any) {
            console.log(e)
        }
    }

    function onActionComplete(args: any) {

        if (args.type === 'save') {
            const currentData = args.data[args.column.field]
            if (args.previousData !== currentData) {
                meta.current.flatData[args.data.id].isValueChanged = true
                updateParentRecursive(args.data.id, currentData, args.previousData, args.column.field)
                const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                if (gridRef) {
                    gridRef.current.endEdit()
                    gridRef.current.refresh()
                }
            }
        }
    }

    function onCellEdit(args: any) {
        // const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        if (!['S', 'Y'].includes(args.rowData.accLeaf)) {
            args.cancel = true
            return
        }
        if (!['debit', 'credit'].includes(args.columnName)) {
            args.cancel = true
            return
        }
        if ((args.columnName === 'debit') && (args.rowData.credit !== 0)) {  
            args.cancel = true
            // gridRef.current.endEdit()              
            Utils.showCustomMessage(Messages.messDebitCreditNotTogether)
            return
        }
        if ((args.columnName === 'credit') && (args.rowData.debit !== 0)) {
            args.cancel = true
            // gridRef.current.endEdit()
            Utils.showCustomMessage(Messages.messDebitCreditNotTogether)
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
        }, 100);
    }

    function onQueryCellInfo(args: any) {
        if (['debit', 'credit'].includes(args.column.field)) {
            if (['S', 'Y'].includes(args.data.accLeaf)) {
                if (args.data.isValueChanged) {
                    args.cell.style.backgroundColor = 'lightgreen';
                } else {
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

        const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        if (gridRef) {
            gridRef.current.dataSource = nodes
            gridRef.current.endEdit()
            gridRef.current.refresh()
        }
    }

    function updateParentRecursive(id: string, value: number, prevValue: number, field: string) {
        const fd: any = meta.current.flatData
        const parentId = fd[id].parentId
        if (parentId) {
            fd[parentId][field] += (value - prevValue)
            updateParentRecursive(parentId, value, prevValue, field)
        }
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
    rows: AccountsOpeningBalanceType[],
    flatData: { [key: string]: AccountsOpeningBalanceType }
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

// function onCellSave(args: any) {
// if (['debit', 'credit'].includes(args.column.field)) {
//     if (args.previousValue !== args.value) {
//         args.cell.style.backgroundColor = 'lightgreen'; // Add custom class to change cell background color
//     }
// }
// }