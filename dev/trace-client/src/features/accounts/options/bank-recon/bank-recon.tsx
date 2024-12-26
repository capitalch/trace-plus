import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { AppDispatchType, RootStateType } from "../../../../app/store/store"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { Utils } from "../../../../utils/utils"
import { currentFinYearSelectorFn, FinYearType } from "../../../login/login-slice"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { bankReconSelectedBankFn, SelectedBankType } from "../../accounts-slice"
import { Messages } from "../../../../utils/messages"
import { BankReconCustomControls } from "./bank-recon-custom-controls"
import { useEffect } from "react"
import { compAppLoaderVisibilityFn } from "../../../../controls/redux-components/comp-slice"
import { CompAppLoader } from "../../../../controls/redux-components/comp-app-loader"
import { setQueryHelperData } from "../../../../app/graphql/query-helper-slice"
import dayjs from "dayjs"
import Decimal from "decimal.js"
import _ from "lodash"

export function BankRecon() {
    const instance: string = DataInstancesMap.bankRecon
    const dispatch: AppDispatchType = useDispatch()
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn) || Utils.getRunningFinYear()
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, instance))
    const selectedData: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.data, shallowEqual)
    const selectedBank: SelectedBankType = useSelector(bankReconSelectedBankFn, shallowEqual)
    const currentDateFormat = Utils.getCurrentDateFormat().replace("DD", "dd").replace("YYYY", "yyyy")

    const { buCode
        // , context
        , dbName
        , decodedDbParamsObject
        // , decFormatter
        , finYearId
        // , intFormatter
    } = useUtilsInfo()

    useEffect(() => {
        if (selectedBank.accId) {
            loadData()
        }
    }, [selectedBank])

    return (<CompAccountsContainer MiddleCustomControl={() => getHeader()}>
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            CustomControl={() => <BankReconCustomControls instance={instance} />}
            minWidth="1000px"
            title='Bank reconcillation'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            isLastNoOfRows={false}
            instance={instance}
        />

        <CompSyncFusionGrid
            // aggregates={getAggregates()}
            className="mr-6 mt-4"
            columns={getColumns()}
            dataSource={selectedData || []}
            hasIndexColumn={false}
            height="calc(100vh - 210px)"
            instance={instance}
            isLoadOnInit={false}
            minWidth="600px"
            loadData={loadData}
        // onRowDataBound={onRowDataBound}
        />
        {isVisibleAppLoader && <CompAppLoader />}
    </CompAccountsContainer>)

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'tranDate',
                headerText: 'Tr date',
                width: 70,
                textAlign: 'Left',
                type: 'string',
                // format: currentDateFormat,
                template: (props: any) => dayjs(props.tranDate).format(Utils.getCurrentDateFormat())
            },
            {
                field: 'autoRefNo',
                headerText: 'Ref no',
                width: 120,
                textAlign: 'Left',
                type: 'string'
            },
            {
                field: 'instrNo',
                headerText: 'Instr no',
                width: 100,
                textAlign: 'Left',
                type: 'string'
            },
            {
                field: 'clearDate',
                headerText: 'Clear date',
                width: 100,
                textAlign: 'Left',
                type: 'string',
                // format: currentDateFormat,
                template: (props: any) => props?.clearDate ? dayjs(props.clearDate).format(Utils.getCurrentDateFormat()) : ''
            },
            {
                field: 'debit',
                headerText: 'Debits',
                width: 100,
                textAlign: 'Right',
                type: 'number',
                format: 'N2'
            },
            {
                field: 'credit',
                headerText: 'Credits',
                width: 100,
                textAlign: 'Right',
                type: 'number',
                format: 'N2'
            },
            {
                field: 'balance',
                headerText: 'Balance',
                width: 120,
                textAlign: 'Right'
            },
            {
                field: 'accNames',
                headerText: 'Accounts',
                width: 180,
                textAlign: 'Left',
                type: 'string'
            },
            {
                field: 'info',
                headerText: 'Info',
                type: 'string',
            },
            // {
            //     field: 'remarks',
            //     headerText: 'Remarks',
            //     width: 150,
            //     textAlign: 'Left',
            //     type: 'string'
            // },
            // {
            //     field: 'lineRefNo',
            //     headerText: 'Line ref',
            //     width: 100,
            //     textAlign: 'Left',
            //     type: 'string'
            // },
            // {
            //     field: 'lineRemarks',
            //     headerText: 'Line remarks',
            //     width: 100,
            //     textAlign: 'Left',
            //     type: 'string'
            // },
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

    async function loadData() {
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
            credit: opBal.credit
        }
        let bal: Decimal = new Decimal(0)
        if (jsonResult?.bankRecon) {
            jsonResult.bankRecon.unshift({ ...formattedOpBalance })
            jsonResult.bankRecon.forEach((item: BankReconType, index: number) => {
                item.info = ''.concat(item.remarks ?? '', ' ', item.lineRefNo ?? '', ' ', item.lineRemarks ?? '')
                item.index = index + 1
                const tempBal = bal.plus(item.debit).minus(item.credit).toNumber()
                item.balance = `${Utils.toDecimalFormat(Math.abs(tempBal))} ${tempBal < 0 ? 'Cr' : 'Dr'}`
                bal = new Decimal(tempBal)
            })

        } else {
            jsonResult.bankRecon = [formattedOpBalance]
        }
        jsonResult.bankRecon = _.orderBy(jsonResult.bankRecon, ['index'], ['desc'])
        dispatch(setQueryHelperData({
            instance: instance,
            data: jsonResult.bankRecon as BankReconType[]
        }))
    }
}

type BankReconType = {
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