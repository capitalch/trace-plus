import { useContext, useState } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
// import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-react-popups';
// import { Utils } from "../../../utils/utils";
import clsx from "clsx";

export function WidgetTreeGridSwitch({
    className
    , instance
    , leftLabel = ''
    , rightLabel = ''
}: WidgetSwitchType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const [, setRefresh] = useState({})

    return (
        <label className={clsx("inline-flex cursor-pointer items-center", className)}>
            <span className="mr-2 text-sm font-medium text-gray-500">{leftLabel}</span>
            <input type="checkbox" checked={getChecked()} className="peer sr-only" onChange={handleOnChangeSwitch} />
            <div className="peer relative h-6 w-11 rounded-full bg-primary-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] hover:bg-slate-500 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:peer-focus:ring-blue-800"></div>
            {rightLabel && <span className="ml-2 text-sm font-medium text-gray-600">{rightLabel}</span>}
        </label>
    )

    function getChecked() {
        let isCollapsed = context.CompSyncFusionTreeGrid?.[instance]?.isCollapsed
        if (isCollapsed === undefined) {
            isCollapsed = true
        }
        return (!isCollapsed)
    }

    function handleOnChangeSwitch(e: any) {
        const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        if (!gridRef?.current) {
            return
        }
        if (e.target?.checked) {
            setTimeout(() => {
                gridRef.current.expandAll(); // Hide the spinner
            }, 100);
            context.CompSyncFusionTreeGrid[instance].isCollapsed = false
        } else {
            setTimeout(() => {
                gridRef.current.collapseAll(); // Hide the spinner
            }, 100);
            context.CompSyncFusionTreeGrid[instance].isCollapsed = true
        }
        setRefresh({})
    }
}

type WidgetSwitchType = {
    className?: string
    instance: string
    leftLabel?: string
    rightLabel?: string
}