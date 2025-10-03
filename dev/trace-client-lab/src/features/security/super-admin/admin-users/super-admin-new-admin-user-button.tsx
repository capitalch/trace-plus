import { Utils } from "../../../../utils/utils"
import { SuperAdminNewEditAdminUser } from "./super-admin-new-edit-admin-user"

export function SuperAdminNewAdminUserButton({dataInstance}:{dataInstance: string}){
    return(<button className="w-20 min-w-24 h-10 text-white rounded-md hover:bg-primary-600 bg-primary-400" onClick={handleNewAdminUser}>New</button>)

    function handleNewAdminUser(){
        Utils.showHideModalDialogA({
            title: "New admin user",
            isOpen: true,
            element: <SuperAdminNewEditAdminUser dataInstance={dataInstance} />,
        })
    }
}