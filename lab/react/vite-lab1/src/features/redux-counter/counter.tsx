import { useDispatch, useSelector } from "react-redux"
import { AppDispatcherType } from "../../app/store"
import { countSelectorFn, decrementR, incrementByAmountR, incrementR } from "./counter-slice"

export function Counter() {
    const dispatch: AppDispatcherType = useDispatch()
    const countSelector = useSelector(countSelectorFn)
    return (
        <div className="flex flex-col m-4 gap-2">
            <span>Count: {countSelector}</span>
            <div className="flex gap-4">
                <button className="bg-slate-200 px-2" onClick={doIncr}>Increment</button>
                <button className="bg-slate-200 px-2" onClick={doDecr}>Decrement</button>
                <button className="bg-slate-200 px-2" onClick={doAmountIncr}>Increment by 5</button>
            </div>
        </div>
    )

    function doIncr() {
        dispatch(incrementR())
    }

    function doDecr() {
        dispatch(decrementR())
    }

    function doAmountIncr() {
        dispatch(incrementByAmountR({ amount: 5 }))
    }
}
