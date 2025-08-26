import clsx from "clsx"
import { IconSubmit } from "../../../../controls/icons/icon-submit"

export function AccountsOpeningBalanceSaveButton({ className, onSave }: AccountsOpeningBalanceSaveButtonType) {
    return (<button className={clsx("h-8 w-20 mb-1 mr-4 px-2 text-sm text-white inline-flex justify-center items-center bg-teal-500 hover:bg-teal-600 focus:outline-hidden focus:ring-teal-300 rounded-md text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200", className)}
        onClick={onSave}>
        <IconSubmit className="text-white w-5 h-5 mr-2" />
        Save</button>)
}

type AccountsOpeningBalanceSaveButtonType = {
    className?: string
    onSave: () => void
}