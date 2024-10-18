import { Utils } from "../../../../utils/utils"
import { SuperAdminNewEditAdminUser } from "./super-admin-new-edit-admin-user"

export function SuperAdminNewAdminUserButton({dataInstance}:{dataInstance: string}){
    return(<button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600" onClick={handleNewAdminUser}>New</button>)

    function handleNewAdminUser(){
        Utils.showHideModalDialogA({
            title: "New admin user",
            isOpen: true,
            element: <SuperAdminNewEditAdminUser dataInstance={dataInstance} />,
        })
    }
}