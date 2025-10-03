import { Utils } from "../../../../utils/utils"
import { SuperAdminNewEditRole } from "./super-admin-new-edit-role"

export function SuperAdminNewRoleButton({dataInstance}:{dataInstance: string}){
    return(<button className="w-20 min-w-24 h-10 text-white rounded-md hover:bg-primary-600 bg-primary-400" onClick={handleNewRole}>New</button>)

    function handleNewRole(){
        Utils.showHideModalDialogA({
            title: "New super admin role",
            isOpen: true,
            element: <SuperAdminNewEditRole dataInstance={dataInstance} />,
        })
    }
}