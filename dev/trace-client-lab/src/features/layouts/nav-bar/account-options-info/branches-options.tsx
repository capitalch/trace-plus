import { useSelector } from "react-redux"
import { BranchType, currentBranchSelectorFn } from "../../../login/login-slice"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { Utils } from "../../../../utils/utils"
import { BranchOptionsListModal } from "./branch-options-list-modal"
import { useMediaQuery } from "react-responsive"

export function BranchesOptions() {
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn)
    const isMobile = useMediaQuery({ query: '(max-width: 639px)' })

    return (
        <TooltipComponent content={currentBranch?.branchName} position="BottomCenter">
            <button onClick={handleOnClickBranches}
                className={`flex items-center ${isMobile ? 'ml-0 px-1 py-1 h-6 min-w-[32px]' : 'ml-2 sm:ml-4 px-2 py-2 h-8 min-w-[80px]'} text-gray-800 bg-gray-200 rounded-full shadow-sm`}>
                {/* Badge section */}
                <div className={`${isMobile ? 'px-0.5 py-0.5' : 'px-1 py-1'} font-bold text-white text-xs bg-blue-500 rounded-full`}>
                    BR
                </div>
                {/* Text section - hide on mobile */}
                {!isMobile && (
                    <span className="ml-1 font-medium text-ellipsis text-xs sm:text-sm whitespace-nowrap overflow-hidden max-w-[60px] sm:max-w-[80px] md:max-w-none">
                        {currentBranch?.branchCode}
                    </span>
                )}
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