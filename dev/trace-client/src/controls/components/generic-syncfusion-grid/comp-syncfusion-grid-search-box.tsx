import { ChangeEvent, useContext, useEffect, useMemo } from "react";
import { GlobalContextType } from "../../../app/global-context";
import { IconSearch } from "../../icons/icon-search";
import { GlobalContext } from "../../../App";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../app/store/store";
import { setSearchStringR } from "../../../app/graphql/query-helper-slice";

export function CompSyncFusionGridSearchBox({ instance }: CompSyncFusionGridSearchBoxType) {
    const dispatch: AppDispatchType = useDispatch()
    const context: GlobalContextType = useContext(GlobalContext)
    const selectedSearchString: string = useSelector((state: RootStateType) => state.queryHelper[instance]?.searchString)

    const onTextChange = useMemo( // For debounce
        () =>
            _.debounce((e: ChangeEvent<HTMLInputElement>) => {
                handleOnChange(e);
            }, 1200),
        []
    )
    useEffect(() => {
        return (() => onTextChange.cancel())
    }, [onTextChange])

    return (
        <div className="flex pr-1 rounded-sm items-center border-2 border-gray-400 focus:ring-2">
            <input type="search" placeholder="Search" className="text-md h-9 w-56 border-none focus:ring-0" value={selectedSearchString || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    dispatch(setSearchStringR({ instance: instance, searchString: e.target.value }))
                    onTextChange(e)
                }}
            />
            <IconSearch />
        </div>
    )

    function handleOnChange(event: ChangeEvent<HTMLInputElement>) {        
        const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
        gridRef.current.search(event.target.value)
    }
}

type CompSyncFusionGridSearchBoxType = {
    instance: string
}