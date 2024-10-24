import { useContext } from "react";
import { GlobalContextType } from "../../../../app/global-context";
import { WidgetSwitch } from "../../../../controls/widgets/widget-switch";
import { GlobalContext } from "../../../../App";
import { Utils } from "../../../../utils/utils";
import { AdminNewEditBusinessUnit } from "../business-units/admin-new-edit-business-unit";
import { AdminNewEditBusinessUser } from "../business users/admin-new-edit-business-user";
// import { useDispatch } from "react-redux";
// import { AppDispatchType } from "../../../../app/store/store";

export function AdminLinkUsersCustomControl({
    dataInstance
}: AdminLinkUsersCustomControlType) {
    const context: GlobalContextType = useContext(GlobalContext)

    return (
        <div className="flex items-center">
            <WidgetSwitch
                leftLabel="Collapse"
                onChange={handleOnChange}
                rightLabel="Expand"
            />
            <button onClick={handleNewBu} className="mx-2 rounded-md bg-primary-400 px-2 py-0.5 text-white hover:bg-primary-500">New business unit</button>
            <button onClick={handleNewBusinessUser} className="mx-2 rounded-md bg-secondary-400 px-2 py-0.5 text-white hover:bg-secondary-500"> New business user</button>
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

    function handleOnChange(e: any) {
        const gridRef: any = context.CompSyncFusionTreeGrid[dataInstance].gridRef
        if (!gridRef?.current) {
            return
        }
        if (e.target?.checked) {
            gridRef.current.expandAll()
        } else {
            gridRef.current.collapseAll()
        }
    }
}

type AdminLinkUsersCustomControlType = {
    dataInstance: string
}

