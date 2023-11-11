import { useDispatch, useSelector } from "react-redux"
import { decrement, increment, incrementByAmount } from "./counter-slice"

function ReduxComponent() {
    const count = useSelector((state: any) => state.counter.value)
    const dispatch = useDispatch()
    // const args: any = {amount: 10}
    return (<div className="flex flex-col gap-2 m-4">
        <span>Count:{count}</span>
        <div className="flex gap-2">
            <button onClick={() => dispatch(increment())} className="p-2 bg-slate-200">Increment</button>
            <button onClick={() => dispatch(decrement())} className="p-2 bg-slate-300">Decrement</button>
            <button onClick={() => dispatch(incrementByAmount({amount: 20}))} className="p-2 bg-slate-300">Increment 10</button>
        </div>
    </div>)
}
export { ReduxComponent }

