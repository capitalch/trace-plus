import { FC } from "react"
import { CompAppGridSearchBox } from "./comp-app-grid-search-box"
import { IconIconRefresh } from "../icons/icon-icon-refresh"

export function CompAppGridToolbar({ CustomControl = undefined, isLastNoOfRows = false, title }: CompAppGridToolbarType) {
    return (<div className="flex justify-between items-center">
        <h2 className="mt-0 text-primary-500 text-lg font-medium">{title}</h2>
        <div className="flex gap-2 items-center" >
            {CustomControl && <CustomControl />}
            {isLastNoOfRows && <select className="h-8 border border-none bg-slate-200  text-sm rounded-xs focus:outline-none focus:border-none">
                <option value="100">Last 100 rows</option>
                <option value="500">Last 500 rows</option>
                <option value="1000">Last 1000 rows</option>
                <option value="">All rows</option>
            </select>}
            <CompAppGridSearchBox />
            <button className="bg-slate-100 hover:bg-slate-200">
                <IconIconRefresh className='w-10 h-10 text-primary-400 hover:text-primary-600'/>
            </button>
        </div>
    </div>)
}

type CompAppGridToolbarType = {
    CustomControl?: FC
    isLastNoOfRows?: boolean
    title: string,
}