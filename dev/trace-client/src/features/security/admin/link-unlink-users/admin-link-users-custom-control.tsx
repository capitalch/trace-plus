import { useContext } from "react";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
// import { GlobalContext } from "../../../../App";
import { Utils } from "../../../../utils/utils";
import { AdminNewEditBusinessUnit } from "../business-units/admin-new-edit-business-unit";
import { AdminNewEditBusinessUser } from "../business users/admin-new-edit-business-user";

export function AdminLinkUsersCustomControl({
    dataInstance
}: AdminLinkUsersCustomControlType) {
    const context: GlobalContextType = useContext(GlobalContext)

    return (
        <div className="flex items-center">
            <button onClick={handleNewBu} className="mx-2 px-2 py-0.5 text-white rounded-md hover:bg-primary-500 bg-primary-400">New business unit</button>
            <button onClick={handleNewBusinessUser} className="mx-2 px-2 py-0.5 text-white rounded-md hover:bg-secondary-500 bg-secondary-400"> New business user</button>
        </div>)

    function handleNewBu() {
        const loadData: () => void = () => context.CompSyncFusionTreeGrid[dataInstance].loadData()
        Utils.showHideModalDialogA({
            title: "New Business Unit",
            isOpen: true,
            element: <AdminNewEditBusinessUnit loadData={loadData} />,
        })
    }

    function handleNewBusinessUser() {
        const loadData: () => void = () => context.CompSyncFusionTreeGrid[dataInstance].loadData()
        Utils.showHideModalDialogA({
            title: "New business user",
            isOpen: true,
            element: <AdminNewEditBusinessUser loadData={loadData} />,
        })
    }
}

type AdminLinkUsersCustomControlType = {
    dataInstance: string
}

