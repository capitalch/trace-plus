import clsx from "clsx";
import { EditNewBranchType } from "./new-edit-branch";
import { SlidingPaneEnum, SlidingPaneMap } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map";
import { AppDispatchType } from "../../../../app/store/store";
import { useDispatch } from "react-redux";
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice";

export function NewBranchButton({ className }: NewBranchButtonType) {
    const dispatch: AppDispatchType = useDispatch()
    return (<button className={clsx("bg-primary-400 text-white w-20 h-10 rounded-md hover:bg-primary-600", className)}
        onClick={handleNewBranch}>New</button>)

    function handleNewBranch() {
        const props: EditNewBranchType = SlidingPaneMap[SlidingPaneEnum.branchMaster].props
        props.id = undefined
        props.branchCode = ''
        props.branchName = ''
        props.remarks = undefined
        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.branchMaster,
            title: 'New branch',
            width: '600px'
        }))
    }
}

type NewBranchButtonType = {
    className?: string
}