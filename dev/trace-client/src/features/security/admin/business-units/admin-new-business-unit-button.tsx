import { useContext } from "react";
import { GlobalContextType } from "../../../../app/global-context";
import { Utils } from "../../../../utils/utils"
import { AdminNewEditBusinessUnit } from "./admin-new-edit-business-unit"
import { GlobalContext } from "../../../../App";

export function AdminNewBusinessUnitButton({ dataInstance }: { dataInstance: string }) {
    const context: GlobalContextType = useContext(GlobalContext);
    
    return (<button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600"
        onClick={handleNewBu}>New</button>)

    function handleNewBu() {
        const loadData: () => void = () => context.CompSyncFusionGrid[dataInstance].loadData()
        Utils.showHideModalDialogA({
            title: "New Business Unit",
            isOpen: true,
            element: <AdminNewEditBusinessUnit loadData={loadData} />,
        })
    }


}