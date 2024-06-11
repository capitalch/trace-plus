import { useContext } from "react";
import { GlobalContextType } from "../../../app/global-context";
import { IconSearch } from "../../icons/icon-search";
import { GlobalContext } from "../../../App";

export function CompSyncFusionGridSearchBox({ instance }: CompSyncFusionGridSearchBoxType) {
    console.log(instance)
    const context: GlobalContextType = useContext(GlobalContext)
    const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
    console.log(gridRef)
    return (
        <div className="flex pr-1 rounded-sm items-center border-2 border-gray-400 focus:ring-2">
            <input type="search" placeholder="Search" className="text-md h-9 w-56 border-none focus:ring-0" />
            <IconSearch />
        </div>
    )
}

type CompSyncFusionGridSearchBoxType = {
    instance: string
}