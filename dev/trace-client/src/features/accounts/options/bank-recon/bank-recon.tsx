import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { AppDispatchType, RootStateType } from "../../../../app/store/store"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { Utils } from "../../../../utils/utils"
import { currentFinYearSelectorFn, FinYearType } from "../../../login/login-slice"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { bankReconSelectedBankFn, selectBank, SelectedBankType } from "../../accounts-slice"
import { Messages } from "../../../../utils/messages"
import { BankReconCustomControls } from "./bank-recon-custom-controls"
import { useEffect, useRef, useState } from "react"
import { compAppLoaderVisibilityFn } from "../../../../controls/redux-components/comp-slice"
import { CompAppLoader } from "../../../../controls/redux-components/comp-app-loader"

import Decimal from "decimal.js"
import _ from "lodash"
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map"
import { format } from "date-fns"

export function BankRecon() {
    const [, setRefresh] = useState({})
    const instance = DataInstancesMap.bankRecon
    const dispatch: AppDispatchType = useDispatch()
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn) || Utils.getRunningFinYear()
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, instance))
    const selectedBank: SelectedBankType = useSelector(bankReconSelectedBankFn, shallowEqual)
    const currentDateFormat = Utils.getCurrentDateFormat().replace("DD", "dd").replace("YYYY", "yyyy")
    const isoFormat = 'yyyy-MM-dd'

    const { buCode
        , context
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()

    const meta: any = useRef({
        rows: []
    })

    useEffect(() => {
        if (selectedBank.accId) {
            loadData()
        }
    }, [selectedBank])

    useEffect(() => {
        return (() => {
            dispatch(selectBank({ accId: undefined, accName: '' })) //cleanup
        })
    }, [])

    const datePickerParams = {
        params: {
            format: currentDateFormat, // Set the date format
        },
    };

    return (<CompAccountsContainer MiddleCustomControl={() => getHeader()}>
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            CustomControl={() => <BankReconCustomControls instance={instance} meta={meta} />}
            minWidth="1000px"
            title='Bank reconcillation'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            isLastNoOfRows={false}
            instance={instance}
        />

        <CompSyncFusionGrid
            actionComplete={onActionComplete}
            aggregates={getAggregates()}
            className="mr-6 mt-4"
            columns={getColumns()}
            dataSource={meta?.current?.rows || []}
            deleteColumnWidth={40}
            editSettings={{
                allowEditing: true,
                mode: 'Normal',
                // showConfirmDialog: false
            }}
            hasIndexColumn={false}
            height="calc(100vh - 240px)"
            instance={instance}

            isLoadOnInit={false}
            loadData={loadData}
            minWidth="1400px"
            onCellEdit={onCellEdit}
            onDelete={handleOnDelete}
            queryCellInfo={onQueryCellInfo}
        />
        {isVisibleAppLoader && <CompAppLoader />}
    </CompAccountsContainer>)

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'autoRefNo',
                field: 'autoRefNo',
                format: 'N0',
                type: 'Count',
                footerTemplate: (props: any) => <span>Count:{` ${props?.['autoRefNo - count'] || 0}`}</span>
            },
            {
                columnName: 'debit',
                field: 'debit',
                format: 'N2',
                type: 'Sum',
            },
            {
                columnName: 'credit',
                field: 'credit',
                format: 'N2',
                type: 'Sum',
            },
        ])
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                allowEditing: false,
                field: 'tranDate',
                headerText: 'Tr date',
                width: 90,
                textAlign: 'Left',
                type: 'date',
                format: currentDateFormat,
            },
            {
                allowEditing: false,
                field: 'autoRefNo',
                headerText: 'Ref no',
                width: 160,
                textAlign: 'Left',
                type: 'string'
            },
            {
                allowEditing: false,
                field: 'instrNo',
                headerText: 'Instr no',
                width: 100,
                textAlign: 'Left',
                type: 'string'
            },
            {
                allowEditing: true,
                // customAttributes: {
                //     class: 'grid-col-edit'
                // },
                edit: datePickerParams,
                editType: 'datepickeredit',
                field: 'clearDate',
                format: currentDateFormat,
                headerText: 'Clear date',
                textAlign: 'Left',
                type: 'date',
                width: 160,
            },
            {
                allowEditing: false,
                field: 'debit',
                headerText: 'Debits',
                width: 150,
                textAlign: 'Right',
                type: 'number',
                format: 'N2'
            },
            {
                allowEditing: false,
                field: 'credit',
                headerText: 'Credits',
                width: 150,
                textAlign: 'Right',
                type: 'number',
                format: 'N2'
            },
            {
                allowEditing: false,
                field: 'balance',
                headerText: 'Balance',
                width: 150,
                textAlign: 'Right'
            },
            {
                allowEditing: true,
                // customAttributes: {
                //     class: 'grid-col-edit'
                // },
                field: 'clearRemarks',
                headerText: 'Clear remarks',
                type: 'string',
                width: 150,
                editType: 'textedit'
            },
            {
                allowEditing: false,
                field: 'accNames',
                headerText: 'Accounts',
                width: 200,
                textAlign: 'Left',
                type: 'string'
            },
            {
                allowEditing: false,
                field: 'info',
                headerText: 'Info',
                type: 'string',
                width: 300
            },
            {
                allowEditing: false,
                field: 'tranDetailsId',
                type: 'number',
                isPrimaryKey: true,
                visible: false,
                width: 0
            }
        ])
    }

    function getHeader() {
        let ret: any = undefined
        if (selectedBank.accName) {
            ret = <label className="font-bold text-blue-500 text-lg">{selectedBank.accName}</label>
        } else {
            ret = <label className="font-bold text-red-500 text-xl">{Messages.messSelectBank}</label>
        }
        return (ret)
    }

    async function handleOnDelete(id: string) {
        Utils.showDeleteConfirmDialog(async () => {
            console.log(id)
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.TranH,
                    deletedIds: [id]
                })
                loadData()
            } catch (e: any) {
                console.log(e)
            }
        })
    }

    function onCellEdit(args: any) { // clearDate set as tranDate
        if (!args?.value) {
            args.rowData['clearDate'] = args?.rowData?.['tranDate']
        }
    }

    async function loadData() {
        const gridRef = context.CompSyncFusionGrid[instance].gridRef
        if (gridRef) {
            gridRef.current.endEdit()
            gridRef.current.refresh() // required. Otherwise grid is not updated when edit is performed
        }
        const accId: number = Utils.getReduxState().accounts.bankRecon.selectedBank.accId || 0
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject || {},
            instance: instance,
            sqlArgs: {
                accId: accId,
                finYearId: finYearId,
                startDate: currentFinYear.startDate,
                endDate: currentFinYear.endDate
            },
            sqlId: SqlIdsMap.getBankRecon
        })
        const jsonResult = res?.[0]?.jsonResult
        const opBal: OpBalanceType = jsonResult?.opBalance || {}
        const formattedOpBalance: any = {
            tranDate: currentFinYear.startDate,
            clearDate: currentFinYear.startDate,
            debit: opBal.debit,
            credit: opBal.credit,
            origClearDate: currentFinYear.startDate,
            origClearRemarks: undefined
        }
        let bal: Decimal = new Decimal(0)
        if (jsonResult?.bankRecon) {
            jsonResult.bankRecon.unshift({ ...formattedOpBalance })
            jsonResult.bankRecon.forEach((item: BankReconType, index: number) => {
                item.info = ''.concat(item.remarks ?? '', ' ', item.lineRefNo ?? '', ' ', item.lineRemarks ?? '')
                item.index = index + 1
                const tempBal = bal.plus(item.debit || new Decimal(0)).minus(item.credit || new Decimal(0)).toNumber()
                item.balance = `${Utils.toDecimalFormat(Math.abs(tempBal))} ${tempBal < 0 ? 'Cr' : 'Dr'}`
                bal = new Decimal(tempBal)
            })

        } else {
            jsonResult.bankRecon = [formattedOpBalance]
        }
        (jsonResult.bankRecon as any[]) = _.orderBy(jsonResult.bankRecon, ['index'], ['desc'])
        meta.current.rows = jsonResult.bankRecon.map((x: any) => ({ ...x }))
        setRefresh({})
    }

    function onActionComplete(args: any) {
        if (args.requestType === 'save') {
            // const item1 = meta.current.rows.find((x: any) => x.id === args.data.id)
            // const metaClearDate = format(item1.clearDate, isoFormat)
            const currentClearDate = format(args.data['clearDate'], isoFormat)
            const previousClearDate = format(args.previousData['clearDate'], isoFormat)
            const currentClearRemarks = args.data['clearRemarks']
            const previousClearRemarks = args.previousData['clearRemarks']
            if ((previousClearDate !== currentClearDate) || (previousClearRemarks !== currentClearRemarks)) {
                const item = meta.current.rows.find((x: any) => x.id === args.data.id)
                if (item) {
                    if ((previousClearDate !== currentClearDate) || item.isValueChanged) {
                        args.row.cells[4].style.backgroundColor = 'lightgreen';
                    }
                    if (previousClearRemarks !== currentClearRemarks || item.isValueChanged) {
                        args.row.cells[8].style.backgroundColor = 'lightgreen';
                    }
                    item.clearDate = currentClearDate // This line is important
                    item.clearRemarks = currentClearRemarks
                    item.isValueChanged = true
                }
            }
        }
    }

    function onQueryCellInfo(args: any) {
        if (['clearDate', 'clearRemarks'].includes(args.column.field)) {
            args.cell.style.backgroundColor = 'lightyellow';
        }
    }
}

export type BankReconType = {
    accNames?: string
    balance?: any
    bankReconId?: number
    autoRefNo: string
    clearDate?: string
    clearRemarks?: string
    credit: number
    debit: number
    headerId: number
    index?: number
    info?: string
    instrNo?: string
    lineRefNo?: string
    lineRemarks?: string
    origClearDate?: string
    origClearRemarks?: string
    remarks?: string
    tranDate: string
    tranDetailsId: number
    userRefNo?: string
}

type OpBalanceType = {
    credit: number
    dc: 'D' | 'C'
    debit: number
}
