import { Utils } from "../../../../utils/utils"
import { SuperAdminEditNewSecuredControl } from "./super-admin-edit-new-secured-control"

export function SuperAdminSecuredControlsNewControlButton({dataInstance}:{dataInstance: string}){
    return(<button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600" onClick={handleNewRole}>New</button>)

    function handleNewRole(){
        Utils.showHideModalDialogA({
            title: "New secured control",
            isOpen: true,
            element: <SuperAdminEditNewSecuredControl dataInstance={dataInstance} />,
        })
    }
}