import { useContext } from "react";
import { GlobalContextType } from "../../../../app/global-context";
import { WidgetSwitch } from "../../../../controls/widgets/widget-switch";
import { GlobalContext } from "../../../../App";
import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store/store";

export function AdminLinkUsersCustomControl({
    dataInstance
}: AdminLinkUsersCustomControlType) {

    const context: GlobalContextType = useContext(GlobalContext)
    const dispatch: AppDispatchType = useDispatch()

    return (
        <div className="flex items-center ">
            <WidgetSwitch
                leftLabel="Collapse"
                onChange={handleOnChange}
                rightLabel="Expand"
            />
            <button className="bg-primary-400 rounded-md mx-2 px-2 py-0.5 text-white ">New business unit</button>
            <button className="bg-secondary-500 rounded-md mx-2 px-2 py-0.5 text-white"> New business user</button>
        </div>)

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

