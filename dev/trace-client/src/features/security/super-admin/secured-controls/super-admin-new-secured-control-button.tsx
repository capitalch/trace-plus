import { Utils } from "../../../../utils/utils"
import { SuperAdminNewEditSecuredControl } from "./super-admin-new-edit-secured-control"

export function SuperAdminNewSecuredControlButton({dataInstance}:{dataInstance: string}){
    return(<button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600" onClick={handleNewRole}>New</button>)

    function handleNewRole(){
        Utils.showHideModalDialogA({
            title: "New secured control",
            isOpen: true,
            element: <SuperAdminNewEditSecuredControl dataInstance={dataInstance} />,
        })
    }
}