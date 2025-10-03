import { useSelector } from "react-redux"
import { bankReconSelectedBankFn, SelectedBankType } from "../../accounts-slice"
import { DataInstancesMap } from "../../../../app/maps/data-instances-map"
import { RootStateType } from "../../../../app/store"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook"
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map"
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator"
import { NumericFormat } from "react-number-format"
import { FocusEvent, useEffect, useState } from "react"
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns"
import { IconSubmit } from "../../../../controls/icons/icon-submit"
import { Utils } from "../../../../utils/utils"
import { AllTables} from "../../../../app/maps/database-tables-map"

export function BankReconOpBalance() {
    const selectedBank: SelectedBankType = useSelector(bankReconSelectedBankFn)
    const instance: string = DataInstancesMap.bankReconOpBalance
    const { context
        , buCode
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()
    const bankOpBalance: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.data)
    const opBal: bankOpBalanceType = bankOpBalance?.[0]
    const [selectedDcValue, setSelectedDcValue]: any = useState<string | null>(null);
    const [amount, setAmount]: any = useState<number | null>(0)
    const { loading } = useQueryHelper({
        instance: instance,
        dbName: dbName,
        isExecQueryOnLoad: true,
        getQueryArgs: () => ({
            buCode: buCode,
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getBankOpBalance,
            sqlArgs: {
                accId: selectedBank.accId,
                finYearId: finYearId
            }
        })
    })

    useEffect(() => {
        setAmount(opBal?.amount || 0)
        setSelectedDcValue(opBal?.dc)
    }, [opBal?.amount, opBal?.dc])

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<div className="flex flex-col">
        <label className="font-medium text-sm">{selectedBank.accName}</label>
        <div className="flex items-center mt-1">
            <NumericFormat className="mr-6 w-40 h-8 text-right border-gray-300 border-spacing-1 rounded-md" allowNegative={false}
                decimalScale={2}
                fixedDecimalScale={true}
                onFocus={handleOnFocus}
                thousandsGroupStyle="thousand"
                thousandSeparator=','
                value={amount || 0}
                onValueChange={(values) => {
                    setAmount(values.value)
                }}
            />
            <DropDownListComponent
                dataSource={[{ value: 'D', text: 'Debit' }, { value: 'C', text: 'Credit' }]}
                fields={{ text: 'text', value: 'value' }}
                onChange={(event: any) => {
                    setSelectedDcValue(event.target.value)
                }}
                popupHeight='100px'
                value={selectedDcValue}
                width={100}
            />
        </div>
        <button onClick={handleOnSubmit} type="button"
            className="inline-flex items-center justify-center mt-8 px-5 py-2 w-full font-medium text-center text-white bg-teal-500 rounded-lg hover:bg-teal-800 focus:outline-hidden focus:ring-4 focus:ring-teal-300 disabled:bg-teal-200 dark:bg-teal-600 dark:focus:ring-teal-800 dark:hover:bg-teal-700">
            <IconSubmit className="mr-2 w-6 h-6 text-white" /> Submit</button>
    </div>)

    function handleOnFocus(event: FocusEvent<HTMLInputElement>): void {
        event.target.select()
    }

    async function handleOnSubmit() {
        try {
            const xData: Record<string, any> = {
                accId: selectedBank?.accId,
                amount: amount,
                dc: selectedDcValue,
                finYearId: finYearId,
                id: opBal?.id,
            }
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: AllTables.BankOpBal.name,
                xData: xData
            })
            const loadData: any = context.CompSyncFusionGrid[DataInstancesMap.bankRecon].loadData
            await loadData()
            Utils.showHideModalDialogA({ isOpen: false })
        } catch (e: any) {
            console.log(e)
        }
    }
}

type bankOpBalanceType = {
    id: number
    amount: number
    dc: 'D' | 'C'
}