import { useContext } from "react";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { Utils } from "../../../../utils/utils"
import { AdminNewEditBusinessUnit } from "./admin-new-edit-business-unit"
import clsx from "clsx";

export function AdminNewBusinessUnitButton({ className, dataInstance, isTreeGrid = false }: { className?: string, dataInstance: string, isTreeGrid?: boolean }) {
    const context: GlobalContextType = useContext(GlobalContext);

    return (<button className={clsx("bg-primary-400 text-white w-20 h-10 rounded-md hover:bg-primary-600", className)}
        onClick={handleNewBu}>New</button>)

    function handleNewBu() {
        const loadData: () => void = () => isTreeGrid ? context.CompSyncFusionTreeGrid[dataInstance].loadData() : context.CompSyncFusionGrid[dataInstance].loadData()
        Utils.showHideModalDialogA({
            title: "New Business Unit",
            isOpen: true,
            element: <AdminNewEditBusinessUnit loadData={loadData} />,
        })
    }
}