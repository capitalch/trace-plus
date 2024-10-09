import { Utils } from "../../../../utils/utils"
import { SuperAdminEditNewRole } from "./super-admin-edit-new-role"

export function SuperAdminRolesNewRoleButton({dataInstance}:{dataInstance: string}){
    return(<button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600" onClick={handleNewRole}>New</button>)

    function handleNewRole(){
        Utils.showHideModalDialogA({
            title: "New super admin role",
            isOpen: true,
            element: <SuperAdminEditNewRole dataInstance={dataInstance} />,
        })
    }
}