import clsx from "clsx"

export function NewFinYearButton({ className }:NewFinYearButtonType){
return (<button className={clsx("bg-primary-400 text-white w-20 h-10 rounded-md hover:bg-primary-600", className)}
        onClick={handleNewBranch}>New</button>)

    function handleNewBranch() {
        // const props: NewEdit = SlidingPaneMap[SlidingPaneEnum.branchMaster].props
        // props.id = undefined
        // props.branchCode = ''
        // props.branchName = ''
        // props.remarks = undefined
        // dispatch(openSlidingPane({
        //     identifier: SlidingPaneEnum.branchMaster,
        //     title: 'New branch',
        //     width: '600px'
        // }))
    }
}

type NewFinYearButtonType = {
    className?: string
}