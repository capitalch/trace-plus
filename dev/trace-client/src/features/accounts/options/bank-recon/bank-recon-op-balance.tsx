import { useDispatch, useSelector } from "react-redux"
import { bankReconSelectedBankFn, SelectedBankType } from "../../accounts-slice"
// import { MaskedTextBoxComponent, NumericTextBoxComponent } from "@syncfusion/ej2-react-inputs"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { AppDispatchType, RootStateType } from "../../../../app/store/store"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { useQueryHelper } from "../../../../app/graphql/query-helper-hook"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator"
// import { InputNumber } from "primereact/inputnumber"
// import { InputMask } from "primereact/inputmask"
import { NumericFormat } from "react-number-format"
import { FocusEvent, useState } from "react"
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns"
import { IconSubmit } from "../../../../controls/icons/icon-submit"
import { GraphQLQueriesMap, GraphQLUpdateArgsType } from "../../../../app/graphql/maps/graphql-queries-map"
import { Utils } from "../../../../utils/utils"

export function BankReconOpBalance() {
    // const dispatch: AppDispatchType = useDispatch()
    const selectedBank: SelectedBankType = useSelector(bankReconSelectedBankFn)
    const instance: string = DataInstancesMap.bankReconOpBalance
    const { buCode
        , dbName
        , decodedDbParamsObject
        , finYearId
        , genericUpdateQueryName
    } = useUtilsInfo()
    const bankOpBalance: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.data)
    const opBal: bankOpBalanceType = bankOpBalance?.[0]
    const [selectedDcValue, setSelectedDcValue]: any = useState<string | null>(opBal?.dc);
    const [amount, setAmount]: any = useState<number | null>(opBal?.amount)
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

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    return (<div className="flex flex-col">
        <label className="text-sm font-medium">{selectedBank.accName}</label>
        <div className="flex items-center mt-1">
            <NumericFormat className="text-right w-40 border-spacing-1 border-gray-300 h-8  mr-6 rounded-md" allowNegative={false}
                decimalScale={2}
                fixedDecimalScale={true}
                onFocus={handleOnFocus}
                thousandsGroupStyle="thousand"
                thousandSeparator=','
                value={amount || 0}
                onChange={(event: any) => {
                    setAmount(event.target.value)
                }}
            />
            <DropDownListComponent
                // className="ml-6"
                dataSource={[{ value: 'D', text: 'Debit' }, { value: 'C', text: 'Credit' }]}
                fields={{ text: 'text', value: 'value' }}
                onChange={(event: any) => {
                    setSelectedDcValue(event.itemData.value)
                }}

                popupHeight='100px'
                value={selectedDcValue}
                width={100}
            />
        </div>
        <button onClick={handleOnSubmit} type="button"
            className="mt-8 w-full px-5 py-2 font-medium text-white inline-flex justify-center items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200">
            <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit</button>
    </div>)

    function handleOnFocus(event: FocusEvent<HTMLInputElement>): void {
        event.target.select()
    }

    async function handleOnSubmit() {
        try {
            const traceDataObject: GraphQLUpdateArgsType = {
                tableName: 'ExtBankReconTranD',
                dbParams: decodedDbParamsObject,
                xData: {
                    accId: selectedBank?.accId,
                    amount: amount,
                    dc: selectedDcValue,
                    finYearId: finYearId,
                    id: opBal?.id,
                },
                buCode: buCode
            }
            const q: any = GraphQLQueriesMap.genericUpdate(
                dbName || '',
                traceDataObject
            )
            await Utils.mutateGraphQL(q, genericUpdateQueryName)
            // dispatch op balance
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