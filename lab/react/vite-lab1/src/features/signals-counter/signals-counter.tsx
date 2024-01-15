import { SignalsStore } from "../../app/signals-store"

function SignalsCounter() {
    return (<div className="flex flex-col">
        <span>Signals Counter: {SignalsStore.counter.value}</span>
        <span className="flex gap-2"> <button onClick={handleIncr} className="bg-slate-100 px-2">Increment</button>
            <button onClick={handleDecr} className="bg-slate-100 px-2">Decrement</button>
        </span>
    </div>)

    function handleIncr() {
        SignalsStore.counter.value = SignalsStore.counter.value + 1
    }

    function handleDecr() {
        SignalsStore.counter.value = SignalsStore.counter.value - 1
    }
}
export { SignalsCounter }