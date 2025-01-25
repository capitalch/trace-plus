import clsx from "clsx"
import { Utils } from "../../../../utils/utils";
import { NewEditFinYear } from "./new-edit-fin-year";

export function NewFinYearButton({ className }: NewFinYearButtonType) {
    return (<button className={clsx("bg-primary-400 text-white w-20 h-10 rounded-md hover:bg-primary-600", className)}
        onClick={handleNewFinYear}>New</button>)

    function handleNewFinYear() {
        Utils.showHideModalDialogA({
            title: 'New financial year',
            isOpen: true,
            element: <NewEditFinYear
                id={undefined}
                startDate=''
                endDate=''
                isIdInsert={true}
            />
        });
    }
}

type NewFinYearButtonType = {
    className?: string
}