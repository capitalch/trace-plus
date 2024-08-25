import { Utils } from "../../../../utils/utils"
import { SuperAdminEditNewClientExtDatabase } from "./super-admin-edit-new-client-ext-database"
import { SuperAdminEditNewClient } from "./super-admin-edit-new-client"

export function SuperAdminClientNewClientButtons({dataInstance}:{dataInstance: string}) {

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
            element: <SuperAdminEditNewClient dataInstance={dataInstance} />,
        })
    }

    function handleNewClientWithExtDb() {
        Utils.showHideModalDialogA({
            title: "New client with external database",
            isOpen: true,
            element: <SuperAdminEditNewClientExtDatabase dataInstance={dataInstance} />,
        })
    }
}