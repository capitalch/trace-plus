import { useContext } from "react";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { Utils } from "../../../../utils/utils"
import { AdminNewEditBusinessUser } from "./admin-new-edit-business-user"
// import { GlobalContext } from "../../../../App";
import clsx from "clsx";

export function AdminNewBusinessUserButton({ className, dataInstance }: AdminNewBusinessUserButtonType) {
    const context: GlobalContextType = useContext(GlobalContext);
    return (<button className={clsx("bg-primary-400 text-white w-20  h-10 rounded-md hover:bg-primary-600", className)} onClick={handleNewBusinessUser}>New</button>)

    function handleNewBusinessUser() {
        const loadData: () => void = () => context.CompSyncFusionGrid[dataInstance].loadData()
        Utils.showHideModalDialogA({
            title: "New business user",
            isOpen: true,
            element: <AdminNewEditBusinessUser loadData={loadData} />,
        })
    }
}

type AdminNewBusinessUserButtonType = {
    className?: string
    dataInstance: string
}