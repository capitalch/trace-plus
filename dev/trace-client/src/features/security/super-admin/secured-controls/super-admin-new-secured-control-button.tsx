import { Utils } from "../../../../utils/utils"
import { SuperAdminNewEditSecuredControl } from "./super-admin-new-edit-secured-control"

export function SuperAdminNewSecuredControlButton({ dataInstance }: { dataInstance: string }) {
    return (
        <div className="flex gap-2">
            <button className="h-10 w-20 min-w-24 rounded-md bg-primary-400 text-white hover:bg-primary-600" onClick={handleImport}>import</button>
            <button className="h-10 w-20 min-w-24 rounded-md bg-primary-400 text-white hover:bg-primary-600" onClick={handleNewSecuredControl}>New</button>
        </div>)

    function handleImport() {
        //Sends secured-controls.json file to server for import into database
    }

    function handleNewSecuredControl() {
        Utils.showHideModalDialogA({
            title: "New secured control",
            isOpen: true,
            element: <SuperAdminNewEditSecuredControl dataInstance={dataInstance} />,
        })
    }
}