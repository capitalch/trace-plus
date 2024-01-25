import { useDispatch, useSelector } from "react-redux"
import { doDecrement, doIncrement } from "./counter-slice"
import { AppDispatchType, RootStateType} from "../../app/store"

function Counter() {
    const dispatch: AppDispatchType = useDispatch()
    const count = useSelector((state: RootStateType) => {
        const count = state.counter.count
        return (count)
    })

    return (<div className="flex flex-col gap-2 m-2">
        <span>Counter:{count}</span>
        <div className="flex gap-2">
            <button className="bg-slate-200 px-2" onClick={handleIncrement}>Increment</button>
            <button className="bg-slate-300 px-2" onClick={handleDecrement}>Decrement</button>
        </div>
    </div>)

    function handleIncrement() {
        dispatch(doIncrement({step:1}))
        
    }

    function handleDecrement() {
        dispatch(doDecrement({step:1}))
    }
}
export { Counter }