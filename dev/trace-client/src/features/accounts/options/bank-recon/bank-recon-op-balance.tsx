import { useSelector } from "react-redux"
import { bankReconSelectedBankFn, SelectedBankType } from "../../accounts-slice"
import { NumericTextBoxComponent } from "@syncfusion/ej2-react-inputs"

export function BankReconOpBalance() {
    const selectedBank: SelectedBankType = useSelector(bankReconSelectedBankFn)

    return (<div className="flex flex-col">
        <label className="text-lg font-medium">{selectedBank.accName}</label>
        <div className="flex justify-between">
            <NumericTextBoxComponent
                decimals={2}
                min={0}
                showSpinButton={false}
                showClearButton={true}
                format="n2"
                placeholder="Opening balance"
                width='250px'
                
            />
        </div>

    </div>)
}

// type BankReconOpBalanceType = {
//     accId: number
//     accName: string
// }