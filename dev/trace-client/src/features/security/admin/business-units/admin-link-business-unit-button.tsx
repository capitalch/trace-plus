// import { useContext } from "react";
// import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import clsx from "clsx";
import { Utils } from "../../../../utils/utils";
import { AdminBusinessUnitSchemasLisr } from "./admin-business-unit-schemas-list";

export function AdminLinkBusinessUnitButton({ className }: { className?: string }) {
    // const context: GlobalContextType = useContext(GlobalContext);

    return (<button className={clsx("bg-secondary-400 text-white w-40 h-10 rounded-md hover:bg-secondary-500", className)}
        onClick={handleNewBu}>Link Existing Bu</button>)

    function handleNewBu() {
        // const loadData: () => void = () => isTreeGrid ? context.CompSyncFusionTreeGrid[dataInstance].loadData() : context.CompSyncFusionGrid[dataInstance].loadData()
        Utils.showHideModalDialogA({
            title: "Assign Business Units Not Yet Linked",
            isOpen: true,
            element: <AdminBusinessUnitSchemasLisr />,
        })
    }
}