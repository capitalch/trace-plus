import { useContext, useState } from "react"
import { GlobalContext, GlobalContextType } from "../../app/global-context"
// import { GlobalContext } from "../../App"

export function WidgetTreeGridSwitch({
    // defaultChecked = false
    instance
    , leftLabel = ''
    // , onChange
    , rightLabel = ''
}: WidgetSwitchType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const [, setRefresh] = useState({})
    return (
        <label className="inline-flex cursor-pointer items-center">
            <span className="mr-2 text-sm font-medium text-gray-500">{leftLabel}</span>
            <input type="checkbox" checked={getChecked()} className="peer sr-only" onChange={handleOnChangeSwitch} />
            <div className="peer relative h-6 w-11 rounded-full bg-primary-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] hover:bg-slate-500 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:peer-focus:ring-blue-800"></div>
            <span className="ml-2 text-sm font-medium text-gray-600">{rightLabel}</span>
        </label>
    )

    function getChecked(){
        let isCollapsed = context.CompSyncFusionTreeGrid?.[instance]?.isCollapsed
        if(isCollapsed === undefined){
            isCollapsed = true
        }
        return(!isCollapsed)
    }

    function handleOnChangeSwitch(e: any) {
        const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        if (!gridRef?.current) {
            return
        }
        if (e.target?.checked) {
            gridRef.current.expandAll()
            context.CompSyncFusionTreeGrid[instance].isCollapsed = false
        } else {
            gridRef.current.collapseAll()
            context.CompSyncFusionTreeGrid[instance].isCollapsed = true
        }
        setRefresh({})
    }
}

type WidgetSwitchType = {
    instance: string
    leftLabel?: string
    // onChange?: (e: any) => void
    rightLabel?: string
}