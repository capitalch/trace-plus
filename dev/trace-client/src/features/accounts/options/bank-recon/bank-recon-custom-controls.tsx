import { useSelector } from "react-redux"
import { IconArrange } from "../../../../controls/icons/icon-arrange"
import { IconOpen } from "../../../../controls/icons/icon-open"
import { IconSelect } from "../../../../controls/icons/icon-select"
import { IconSubmit } from "../../../../controls/icons/icon-submit"
import { Utils } from "../../../../utils/utils"
import { bankReconSelectedBankFn, SelectedBankType } from "../../accounts-slice"
import { SelectBankModal } from "./select-bank-modal"

export function BankReconCustomControls({ instance }: BankReconCustomControlType) {
    const selectedBank: SelectedBankType = useSelector(bankReconSelectedBankFn)
    const isDisabled: boolean = selectedBank.accId ? false : true
    console.log(instance)
    return (
        <div className="flex gap-4 mr-4 flex-wrap">
            <button type="button" onClick={handleSelectBank}
                className="px-5 py-2 text-md font-medium text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-200">
                <IconSelect className="text-white w-6 h-6 mr-2" />
                Select Bank
            </button>
            <button type="button" disabled={isDisabled} className="px-5 py-2 text-md font-medium text-white inline-flex items-center bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:bg-primary-200">
                <IconOpen className="text-white w-6 h-6 mr-2" />
                Opening</button>
            <button type="button" disabled={isDisabled} className="px-5 py-2 text-md font-medium text-white inline-flex items-center bg-secondary-500 hover:bg-secondary-800 focus:ring-4 focus:outline-none focus:ring-secondary-300 rounded-lg text-center dark:bg-secondary-600 dark:hover:bg-secondary-700 dark:focus:ring-secondary-800 disabled:bg-secondary-200">
                <IconArrange className="text-white w-6 h-6 mr-2" /> Rearrange
            </button>
            <button type="button" disabled={isDisabled} className="px-5 py-2 text-md font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200">
                <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit</button>
        </div>
    )

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
}