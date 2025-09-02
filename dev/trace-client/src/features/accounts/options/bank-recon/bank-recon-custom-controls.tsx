import { useSelector } from "react-redux"
import { IconArrange } from "../../../../controls/icons/icon-arrange"
import { IconOpen } from "../../../../controls/icons/icon-open"
import { IconSelect } from "../../../../controls/icons/icon-select"
import { IconSubmit } from "../../../../controls/icons/icon-submit"
import { Utils } from "../../../../utils/utils"
import { bankReconSelectedBankFn, SelectedBankType } from "../../accounts-slice"
import { SelectBankModal } from "./select-bank-modal"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { GraphQLQueriesMap, GraphQLUpdateArgsType } from "../../../../app/maps/graphql-queries-map"
import { Messages } from "../../../../utils/messages"
import { IconCancel } from "../../../../controls/icons/icon-cancel"
import _ from "lodash"
import { BankReconType } from "./bank-recon"
import Decimal from "decimal.js"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { BankReconOpBalance } from "./bank-recon-op-balance"
import { AllTables } from "../../../../app/maps/database-tables-map"

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
        <div className="flex flex-wrap mr-4 gap-4">
            <TooltipComponent content='Select a bank from list of banks' className="text-sm" cssClass="custom-tooltip">
                <button type="button" onClick={handleSelectBank}
                    className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-800 focus:outline-hidden focus:ring-4 focus:ring-blue-300 disabled:bg-blue-200 dark:bg-blue-600 dark:focus:ring-blue-800 dark:hover:bg-blue-700">
                    <IconSelect className="mr-2 w-6 h-6 text-white" />
                    Select Bank
                </button>
            </TooltipComponent>
            <TooltipComponent content='Set opening balance of the bank' className="text-sm" cssClass="custom-tooltip">
                <button type="button" onClick={handleOpBalance} disabled={isDisabled} className="inline-flex items-center px-5 py-2 font-medium text-center text-md text-white rounded-lg hover:bg-primary-800 focus:outline-hidden focus:ring-4 focus:ring-primary-300 disabled:bg-primary-200 dark:bg-primary-600 dark:focus:ring-primary-800 dark:hover:bg-primary-700 bg-primary-500">
                    <IconOpen className="mr-2 w-6 h-6 text-white" />
                    Opening bal</button>
            </TooltipComponent>
            <TooltipComponent content='Rearrange without saving' className="text-sm" cssClass="custom-tooltip">
                <button type="button" onClick={handleReArrange} disabled={isDisabled} className="inline-flex items-center px-5 py-2 font-medium text-center text-white rounded-lg hover:bg-secondary-800 focus:outline-hidden focus:ring-4 focus:ring-secondary-300 disabled:bg-secondary-200 dark:bg-secondary-600 dark:focus:ring-secondary-800 dark:hover:bg-secondary-700 bg-secondary-500">
                    <IconArrange className="mr-2 w-6 h-6 text-white" /> Rearrange
                </button>
            </TooltipComponent>
            <TooltipComponent content='Undo edit' className="text-sm" cssClass="custom-tooltip">
                <button onClick={handleOnCancel} type="button" disabled={isDisabled} className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-red-500 rounded-lg hover:bg-red-800 focus:outline-hidden focus:ring-4 focus:ring-red-300 disabled:bg-red-200 dark:bg-red-600 dark:focus:ring-red-800 dark:hover:bg-red-700">
                    <IconCancel className="mr-2 w-6 h-6 text-white" /> Cancel</button>
            </TooltipComponent>
            <TooltipComponent content='Save data to server' className="text-sm" cssClass="custom-tooltip">
                <button onClick={handleOnSubmit} type="button" disabled={isDisabled} className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-teal-500 rounded-lg hover:bg-teal-800 focus:outline-hidden focus:ring-4 focus:ring-teal-300 disabled:bg-teal-200 dark:bg-teal-600 dark:focus:ring-teal-800 dark:hover:bg-teal-700">
                    <IconSubmit className="mr-2 w-6 h-6 text-white" /> Submit</button>
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
                clearDate: item.clearDate || null,
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
        gridRef.current.refresh()
        gridRef.current.closeEdit()
        meta.current.rows.filter((row: any) => (
            (row.origClearDate !== row.clearDate)
            || (row.origClearRemarks !== row.clearRemarks)
        )).forEach((item: any) => {
            item.clearDate = item.origClearDate
            item.clearRemarks = item.origClearRemarks
        })
        handleReArrange()
    }

    function handleOpBalance() {
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
        gridRef.current.refresh()
    }

    async function handleOnSubmit() {
        try {
            const gridRef = context.CompSyncFusionGrid[instance].gridRef
            gridRef.current.endEdit()
            const xData: any[] = getChangedData()
            const op: any = xData.find((x: any) => !x.tranDetailsId)
            if (op) {
                Utils.showAlertMessage('Invalid', Messages.messOpBalClearDateChangeNotAllowed)
                return
            }
            const traceDataObject: GraphQLUpdateArgsType = {
                tableName: AllTables.ExtBankReconTranD.name,
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