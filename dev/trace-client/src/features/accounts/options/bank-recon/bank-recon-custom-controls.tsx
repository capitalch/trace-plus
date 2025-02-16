import { useSelector } from "react-redux"
import { IconArrange } from "../../../../controls/icons/icon-arrange"
import { IconOpen } from "../../../../controls/icons/icon-open"
import { IconSelect } from "../../../../controls/icons/icon-select"
import { IconSubmit } from "../../../../controls/icons/icon-submit"
import { Utils } from "../../../../utils/utils"
import { bankReconSelectedBankFn, SelectedBankType } from "../../accounts-slice"
import { SelectBankModal } from "./select-bank-modal"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { GraphQLQueriesMap, GraphQLUpdateArgsType } from "../../../../app/graphql/maps/graphql-queries-map"
import { Messages } from "../../../../utils/messages"
import { IconCancel } from "../../../../controls/icons/icon-cancel"
import _ from "lodash"
import { BankReconType } from "./bank-recon"
import Decimal from "decimal.js"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { BankReconOpBalance } from "./bank-recon-op-balance"
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map"

export function BankReconCustomControls({ instance, meta }: BankReconCustomControlType) {
    const selectedBank: SelectedBankType = useSelector(bankReconSelectedBankFn)
    const isDisabled: boolean = selectedBank.accId ? false : true
    const {
        buCode
        , context
        , dbName
        , decodedDbParamsObject
        , genericUpdateQueryName
    } = useUtilsInfo()
    
    return (
        <div className="flex gap-4 mr-4 flex-wrap">
            <TooltipComponent content='Select a bank from list of banks' className="text-sm" cssClass="custom-tooltip">
                <button type="button" onClick={handleSelectBank}
                    className="px-5 py-2 font-medium text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-200">
                    <IconSelect className="text-white w-6 h-6 mr-2" />
                    Select Bank
                </button>
            </TooltipComponent>
            <TooltipComponent content='Set opening balance of the bank' className="text-sm" cssClass="custom-tooltip">
                <button type="button" onClick={handleOpBalance} disabled={isDisabled} className="px-5 py-2 text-md font-medium text-white inline-flex items-center bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-hidden focus:ring-primary-300 rounded-lg text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:bg-primary-200">
                    <IconOpen className="text-white w-6 h-6 mr-2" />
                    Opening bal</button>
            </TooltipComponent>
            <TooltipComponent content='Rearrange without saving' className="text-sm" cssClass="custom-tooltip">
                <button type="button" onClick={handleReArrange} disabled={isDisabled} className="px-5 py-2 font-medium text-white inline-flex items-center bg-secondary-500 hover:bg-secondary-800 focus:ring-4 focus:outline-hidden focus:ring-secondary-300 rounded-lg text-center dark:bg-secondary-600 dark:hover:bg-secondary-700 dark:focus:ring-secondary-800 disabled:bg-secondary-200">
                    <IconArrange className="text-white w-6 h-6 mr-2" /> Rearrange
                </button>
            </TooltipComponent>
            <TooltipComponent content='Undo edit' className="text-sm" cssClass="custom-tooltip">
                <button onClick={handleOnCancel} type="button" disabled={isDisabled} className="px-5 py-2 font-medium text-white inline-flex items-center bg-red-500 hover:bg-red-800 focus:ring-4 focus:outline-hidden focus:ring-red-300 rounded-lg text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 disabled:bg-red-200">
                    <IconCancel className="text-white w-6 h-6 mr-2" /> Cancel</button>
            </TooltipComponent>
            <TooltipComponent content='Save data to server' className="text-sm" cssClass="custom-tooltip">
                <button onClick={handleOnSubmit} type="button" disabled={isDisabled} className="px-5 py-2 font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-hidden focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200">
                    <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit</button>
            </TooltipComponent>
        </div>
    )

    function updateBalance(rows: BankReconType[]) {
        let bal: Decimal = new Decimal(0)
        rows.forEach((item: BankReconType) => {
            const tempBal = bal.plus(item.debit || new Decimal(0)).minus(item.credit || new Decimal(0)).toNumber()
            item.balance = `${Utils.toDecimalFormat(Math.abs(tempBal))} ${tempBal < 0 ? 'Cr' : 'Dr'}`
            bal = new Decimal(tempBal)
        })
    }

    function getChangedData() {
        const changedrows: any[] = (meta.current.rows as any[]).filter((row: any) => (
            (row.origClearDate !== row.clearDate)
            || (row.origClearRemarks !== row.clearRemarks)
        ))
        const changedData: any[] = changedrows.map((item: any) => {
            const it: any = {
                clearDate: item.clearDate,
                clearRemarks: item.clearRemarks,
                tranDetailsId: item.tranDetailsId,
                id: item.bankReconId
            }
            if (!it.id) {
                it.id = undefined
            }
            return (it)
        })
        return (changedData)
    }

    function handleOnCancel() {
        const gridRef = context.CompSyncFusionGrid[instance].gridRef
        gridRef.current.closeEdit()
        gridRef.current.refresh()
    }

    function handleOpBalance(){
        Utils.showHideModalDialogA({
            className: 'ml-2',
            title: `Opening balance`,
            isOpen: true,
            element: <BankReconOpBalance />,
        })
    }

    function handleReArrange() {
        const gridRef = context.CompSyncFusionGrid[instance].gridRef
        gridRef.current.endEdit()
        
        const rows: BankReconType[] = _.orderBy(meta.current.rows, ['clearDate', 'tranDate', 'index']) // , ['desc', 'desc', 'desc']
        updateBalance(rows)
        
        rows.reverse()
        meta.current.rows = rows.map((x: any) => ({ ...x }))
        gridRef.current.dataSource = []
        gridRef.current.dataSource = meta.current.rows
    }

    async function handleOnSubmit() {
        try {
            const gridRef = context.CompSyncFusionGrid[instance].gridRef
            gridRef.current.endEdit()
            gridRef.current.refresh()
            const xData: any[] = getChangedData()
            const op: any = xData.find((x: any) => !x.tranDetailsId)
            if (op) {
                Utils.showAlertMessage('Invalid', Messages.messOpBalClearDateChangeNotAllowed)
                return
            }
            const traceDataObject: GraphQLUpdateArgsType = {
                tableName: DatabaseTablesMap.ExtBankReconTranD,
                dbParams: decodedDbParamsObject,
                xData: [...xData],
                buCode: buCode
            }
            const q: any = GraphQLQueriesMap.genericUpdate(
                dbName || '',
                traceDataObject
            )
            if (traceDataObject.xData.length > 0) {
                await Utils.mutateGraphQL(q, genericUpdateQueryName)
                const loadData: any = context.CompSyncFusionGrid[instance].loadData
                await loadData()
            } else {
                Utils.showAlertMessage('Warning!!!', Messages.messNothingToDo)
            }
        } catch (e: any) {
            console.log(e)
        }
    }

    function handleSelectBank() {
        Utils.showHideModalDialogA({
            className: 'ml-2',
            title: "Select a bank",
            isOpen: true,
            element: <SelectBankModal />,
        })
    }
}

type BankReconCustomControlType = {
    instance: string
    meta: any
}