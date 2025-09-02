import { useSelector } from "react-redux"
import { BranchType, currentBranchSelectorFn } from "../../../login/login-slice"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { Utils } from "../../../../utils/utils"
import { BranchOptionsListModal } from "./branch-options-list-modal"

export function BranchesOptions() {
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn)

    return (
        <TooltipComponent content={currentBranch?.branchName} position="RightCenter">
            <button onClick={handleOnClickBranches} className="flex items-center ml-4 px-2 py-2 w-70 h-8 text-gray-800 bg-gray-200 rounded-full shadow-sm">
                {/* Badge section */}
                <div className="px-1 py-1 font-bold text-white text-xs bg-blue-500 rounded-full">
                    BR
                </div>
                {/* Text section */}
                <span className="ml-1 font-medium text-ellipsis text-sm whitespace-nowrap overflow-hidden">
                    {currentBranch?.branchCode}
                </span>
            </button></TooltipComponent>)

    function handleOnClickBranches() {
        Utils.showHideModalDialogA({
            className:'ml-2',
            title: "Select a branch",
            isOpen: true,
            element: <BranchOptionsListModal />,
        })
    }
}