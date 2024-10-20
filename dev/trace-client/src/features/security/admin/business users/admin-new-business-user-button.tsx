import { Utils } from "../../../../utils/utils"
import { AdminNewEditBusinessUser } from "./admin-new-edit-business-user"

export function AdminNewBusinessUserButton({ dataInstance }: { dataInstance: string }) {
    return (<button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600" onClick={handleNewAdminUser}>New</button>)

    function handleNewAdminUser() {
        Utils.showHideModalDialogA({
            title: "New business user",
            isOpen: true,
            element: <AdminNewEditBusinessUser dataInstance={dataInstance} />,
        })
    }
}