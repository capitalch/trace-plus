import { Utils } from "../../../../utils/utils"
import { SuperAdminNewEditClientExtDatabase } from "./super-admin-new-edit-client-ext-database"
import { SuperAdminNewEditClient } from "./super-admin-new-edit-client"

export function SuperAdminNewClientButtons({dataInstance}:{dataInstance: string}) {

    return (
        <div className="flex flex-wrap gap-2">
            <button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600" onClick={handleNewClient}>New client</button>
            <button className="bg-primary-400 text-white w-20 h-10 rounded-md min-w-64 hover:bg-primary-600" onClick={handleNewClientWithExtDb}>New client with external database</button>
        </div>
    )

    function handleNewClient() {
        Utils.showHideModalDialogA({
            title: "New client",
            isOpen: true,
            element: <SuperAdminNewEditClient dataInstance={dataInstance} />,
        })
    }

    function handleNewClientWithExtDb() {
        Utils.showHideModalDialogA({
            title: "New client with external database",
            isOpen: true,
            element: <SuperAdminNewEditClientExtDatabase dataInstance={dataInstance} />,
        })
    }
}