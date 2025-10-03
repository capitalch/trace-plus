import _ from 'lodash'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../app/store";
import { ChangeEvent, useContext, useEffect, useMemo } from "react";
import { GlobalContext, GlobalContextType } from "../../../app/global-context";
import { setSearchString } from '../../../app/graphql/query-helper-slice';
import { IconSearch } from '../../icons/icon-search';

export function CompSyncFusionTreeGridSearchBox({ handleOnChange, instance }: CompSyncFusionTreeGridSearchBoxType) {
    const dispatch: AppDispatchType = useDispatch()
    const context: GlobalContextType = useContext(GlobalContext)
    const selectedSearchString: string = useSelector((state: RootStateType) => state.queryHelper[instance]?.searchString)

    const onTextChange = useMemo( // For debounce
        () =>
            _.debounce((e: ChangeEvent<HTMLInputElement>) => {
                if (handleOnChange) {
                    handleOnChange(e)
                } else {
                    handleOnChangeLocal(e)
                }
            }, 1200),
        []
    )
    useEffect(() => {
        return (() => onTextChange.cancel())
    }, [onTextChange])

    return (
        <div className="flex items-center pr-1 border-2 border-gray-400 rounded-xs focus:ring-2">
            <input type="search" placeholder="Search" className="w-56 h-9 text-md border-none focus:ring-0" value={selectedSearchString || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    dispatch(setSearchString({ instance: instance, searchString: e.target.value }))
                    onTextChange(e)
                }}
            />
            <IconSearch />
        </div>
    )

    function handleOnChangeLocal(event: ChangeEvent<HTMLInputElement>) {
        const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        gridRef.current.search(event.target.value)
    }
}

type CompSyncFusionTreeGridSearchBoxType = {
    handleOnChange?: (event: ChangeEvent<HTMLInputElement>) => void
    instance: string
}