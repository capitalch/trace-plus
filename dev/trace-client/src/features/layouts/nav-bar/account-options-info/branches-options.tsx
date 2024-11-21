import { useSelector } from "react-redux"
import { BranchType, currentBranchSelectorFn } from "../../../login/login-slice"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
// import { AppDispatchType } from "../../../../app/store/store"
import { Utils } from "../../../../utils/utils"
import { BranchOptionsListModal } from "./branch-options-list-modal"

export function BranchesOptions() {
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn)
    // const dispatch: AppDispatchType = useDispatch()

    return (
        <TooltipComponent content={currentBranch?.branchName}>
            <button onClick={handleOnClickBranches} className="w-70 ml-4 flex h-8 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow">
                {/* Badge section */}
                <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                    BR
                </div>
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                    {currentBranch?.branchCode}
                </span>
            </button></TooltipComponent>)

    function handleOnClickBranches() {
        Utils.showHideModalDialogA({
            title: "Select a branch",
            isOpen: true,
            element: <BranchOptionsListModal />,
        })
    }
}