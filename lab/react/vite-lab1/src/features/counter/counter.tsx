import { useDispatch, useSelector } from "react-redux"
import { doDecrement, doIncrement } from "./counter-slice"
import { useEffect } from "react"
import { fetchData } from "../../app/app-slice"

function Counter() {
    const dispatch: any = useDispatch()
    const count = useSelector((state: any) => {
        const count = state.counter.count
        return (count)
    })

    useEffect(() => {
        const args: any = { a: 1 }
        dispatch(fetchData(args))
    }, [dispatch])

    return (<div className="flex flex-col gap-2 m-2">
        <span>Counter:{count}</span>
        <div className="flex gap-2">
            <button className="bg-slate-200 px-2" onClick={handleIncrement}>Increment</button>
            <button className="bg-slate-300 px-2" onClick={handleDecrement}>Decrement</button>
        </div>
    </div>)

    function handleIncrement() {
        const args: any = { step: 1 }
        dispatch(doIncrement(args))
    }

    function handleDecrement() {
        const args: any = { step: 1 }
        dispatch(doDecrement(args))
    }
}
export { Counter }