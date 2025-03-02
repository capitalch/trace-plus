import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { useEffect, useRef, useState } from "react"
import { Utils } from "../../../../utils/utils"
import _ from "lodash"
import { Messages } from "../../../../utils/messages"
import Decimal from "decimal.js"
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map"
import { AccountsOpeningBalanceSaveButton } from "./accounts-opening-balance-save-button"
import { NumericEditTemplate } from "../../../../controls/components/numeric-edit-template"
import { NumberFormatValues } from "react-number-format"

export function AccountsOpeningBalance() {
    const [, setRefresh] = useState({})

    const instance: string = DataInstancesMap.accountsOpeningBalance
    const {
        branchId
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()

    const meta = useRef<MetaType>({
        rows: [],
        flatData: {}
    })

    const editMeta = useRef<EditMetaType>({
    })

    useEffect(() => {
        loadData()
    }, [finYearId, buCode])

    return (<CompAccountsContainer>
        {/* <button onClick={HandleSetScroll}>Set scroll</button> */}
        <CompSyncFusionTreeGridToolbar className="mt-2" CustomControl={() => <AccountsOpeningBalanceSaveButton onSave={handleOnSubmit} />}
            title='Accounts opening balances'
            isLastNoOfRows={false}
            instance={instance}
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            actionBegin={onActionBegin}
            actionComplete={onActionComplete}
            aggregates={getAggregates()}
            buCode={buCode}
            cellEdit={onCellEdit}
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

    // function HandleSetScroll() {
    //     const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
    //     const treeGridElement = gridRef?.current?.grid?.getContent();
    //     if (treeGridElement) {
    //         const scrollableContainer = treeGridElement.querySelector('.e-content');
    //         scrollableContainer.scrollTop = 300
    //         treeGridUtils.saveScrollPos(context, instance)
    //     }
    // }

    function calculateCredits() {
        const ret: Decimal = meta.current.rows.reduce((sum: Decimal, current: AccountsOpeningBalanceType) =>
            (sum.plus(current.credit || 0)), new Decimal(0))
        const r: number = ret.toNumber()
        return (r)
    }

    function calculateDebits() {
        const ret: Decimal = meta.current.rows.reduce((sum: Decimal, current: AccountsOpeningBalanceType) =>
            (sum.plus(current.debit || 0)), new Decimal(0))
        const r: number = ret.toNumber()
        return (r)
    }

    function flattenData(items: AccountsOpeningBalanceType[]) {
        items.forEach((item: AccountsOpeningBalanceType) => {
            meta.current.flatData[item.id] = item
            if (item.children && item.children.length > 0) {
                flattenData(item.children)
            }
        })
    }

    function getAggregates(): SyncFusionTreeGridAggregateColumnType[] {
        return ([
            {
                columnName: 'accName',
                field: 'accName',
                type: 'Count',
                footerTemplate: (props: any) => `Count: ${props['accName - count']}`,
            },
            {
                columnName: 'debit',
                field: 'debit',
                format: 'N2',
                type: 'Custom',
                customAggregate: calculateDebits,
                footerTemplate: (props: any) => <span className="mr-2">{`${Utils.toDecimalFormat(props?.['debit - custom'] || 0)}`}</span>
            },
            {
                columnName: 'credit',
                field: 'credit',
                format: 'N2',
                type: 'Custom',
                customAggregate: calculateCredits,
                footerTemplate: (props: any) => <span className="mr-2">{`${Utils.toDecimalFormat(props?.['credit - custom'] || 0)}`}</span>
            },
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
                // edit: {
                //     params:
                //     {
                //         decimals: 2,
                //         format: 'N2',
                //         showSpinButton: false,
                //         validateDecimalOnType: true
                //     }
                // },
                // editType: 'numericedit',
                editTemplate: (args: any) => (NumericEditTemplate(args, onDebitValueChanged)),
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
                // edit: {
                //     params:
                //     {
                //         decimals: 2,
                //         format: 'N2',
                //         showSpinButton: false,
                //         validateDecimalOnType: true
                //     }
                // },
                // editType: 'numericedit', // 'textedit',
                editTemplate: (args: any) => (NumericEditTemplate(args, onCreditValueChanged)),
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

    async function handleOnSubmit() {
        const changedData: AccountsOpeningBalanceType[]
            = Object.values(meta.current.flatData as Record<string, AccountsOpeningBalanceType>).filter((item: AccountsOpeningBalanceType) => item.isValueChanged)
        if (_.isEmpty(changedData)) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo)
            return
        }
        const formattedData: any = changedData.map((item: AccountsOpeningBalanceType) => {
            return ({
                id: item.opId ? item.opId : undefined,
                finYearId: finYearId,
                branchId: branchId,
                accId: item.id,
                amount: item.debit ? item.debit : item.credit,
                dc: item.credit ? 'C' : 'D'
            })
        })

        const credits: number = calculateCredits()
        const debits: number = calculateDebits()
        if (debits !== credits) {
            Utils.showConfirmDialog('Warning'
                , Messages.messDebitsNotEqualsCredits
                , await saveData)
        } else {
            await saveData()
        }

        async function saveData() {
            try {
                await Utils.doGenericUpdate({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.AccOpBal,
                    xData: formattedData
                })
                Utils.showSaveMessage()
                // Utils.treeGridUtils.saveScrollPos(context, instance)
                await loadData()
            } catch (e: any) {
                console.log(e)
            }
        }
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
            Utils.addUniqueKeysToJson(meta.current.rows) // adds unique pkey to each record
            // Utils.treeGridUtils.saveScrollPos(context,instance)
            if (!_.isEmpty(meta.current.rows)) {
                sumDebitCredit()
                flattenData(meta.current.rows)
                setRefresh({})
                Utils.treeGridUtils.restoreScrollPos(context, instance)
            }
        } catch (e: any) {
            console.log(e)
        }
    }

    function onActionBegin(args: any) {
        if ((args.type === 'save') && (args.column.field === 'debit')) {
            if (editMeta.current?.[args.rowData.id] !== undefined) {
                args.rowData[args.column.field] = editMeta.current?.[args.rowData.id]?.editedDebitValue
            }
        }
        if ((args.type === 'save') && (args.column.field === 'credit')) {
            if (editMeta.current?.[args.rowData.id] !== undefined) {
                args.rowData[args.column.field] = editMeta.current?.[args.rowData.id]?.editedCreditValue
            }
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
                    // gridRef.current.refresh()
                }
            }
        }
    }

    function onCellEdit(args: any) {
        if (!['S', 'Y'].includes(args.rowData.accLeaf)) {
            args.cancel = true
            return
        }
        if (!['debit', 'credit'].includes(args.columnName)) {
            args.cancel = true
            return
        }
        if ((args.columnName === 'debit') && (+args.rowData.credit !== 0)) {
            args.cancel = true
            return
        }
        if ((args.columnName === 'credit') && (+args.rowData.debit !== 0)) {
            args.cancel = true
            return
        }
    }

    function onCreditValueChanged(args: any, values: NumberFormatValues) {
        if (!editMeta.current[args.id]) {
            editMeta.current[args.id] = {}
        }
        editMeta.current[args.id].editedCreditValue = values.floatValue
    }

    function onDebitValueChanged(args: any, values: NumberFormatValues) {
        if (!editMeta.current[args.id]) {
            editMeta.current[args.id] = {}
        }
        editMeta.current[args.id].editedDebitValue = values.floatValue
    }

    function onQueryCellInfo(args: any) {
        if (['debit', 'credit'].includes(args.column.field)) {
            if (['S', 'Y'].includes(args.data.accLeaf)) {
                if (args.data.taskData.isValueChanged) {
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
        // treeGridUtils.saveScrollPos(context, instance)
        if (gridRef) {
            gridRef.current.dataSource = nodes // resets scrollpos
            gridRef.current.endEdit()
            gridRef.current.refresh() // resets scrollpos
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
    isValueChanged?: boolean
    opId: number
    parentId: number
}

type MetaType = {
    rows: AccountsOpeningBalanceType[]
    flatData: { [key: string]: AccountsOpeningBalanceType }
}

type EditMetaType = {
    [key: string]: {
        editedCreditValue?: string | number
        editedDebitValue?: string | number
    }
}