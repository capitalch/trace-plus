import { useContext } from "react";
import { GlobalContextType } from "../../../../app/global-context";
import { Utils } from "../../../../utils/utils"
import { AdminNewEditBusinessUser } from "./admin-new-edit-business-user"
import { GlobalContext } from "../../../../App";

export function AdminNewBusinessUserButton({ dataInstance }: { dataInstance: string }) {
    const context: GlobalContextType = useContext(GlobalContext);
    return (<button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600" onClick={handleNewBusinessUser}>New</button>)

    function handleNewBusinessUser() {
        const loadData: () => void = () => context.CompSyncFusionGrid[dataInstance].loadData()
        Utils.showHideModalDialogA({
            title: "New business user",
            isOpen: true,
            element: <AdminNewEditBusinessUser loadData={loadData}  />,
        })
    }
}