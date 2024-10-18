import { Utils } from "../../../../utils/utils"
import { AdminNewEditBusinessUnit } from "./admin-new-edit-business-unit"

export function AdminNewBusinessUnitButton({ dataInstance }: { dataInstance: string }) {
    return (<button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600" 
        onClick={handleNewRole}>New</button>)

    function handleNewRole() {
        Utils.showHideModalDialogA({
            title: "New Business Unit",
            isOpen: true,
            element: <AdminNewEditBusinessUnit dataInstance={dataInstance} />,
        })
    }
}