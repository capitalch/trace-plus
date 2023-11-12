import { computed, effect, useSignal } from "@preact/signals-react"
import { SignalsStore } from "../app/signals-store"

function AppSignals() {
    const localCount = useSignal(0)
    const cnt: any = SignalsStore.main.count
    // const countValue = SignalsStore.main.count.value

    effect(
        () => {
            console.log(SignalsStore.main.count.value)
        }
    )

    return (<div className="flex flex-col gap-3 m-10 prose">
        <h1>Signals</h1>
        <div className="flex items-center gap-3">
            <label>Count: {SignalsStore.main.count}</label>
            {/* <label>Count X3:{cnt * 3}</label> */}
            <label>Computed: {computed(() => SignalsStore.main.count.value * 4)}</label>
            <button onClick={handleClickAdd} className="h-8 px-2 text-white rounded-md bg-stone-500">Add</button>
            <button onClick={handleClickMinus} className="h-8 px-2 text-white rounded-md bg-stone-500">Minus</button>
        </div>

        <div className="flex items-center gap-3">
            <label>Local Count: {localCount}</label>
            <button onClick={handleClickAddLocal} className="h-8 px-2 text-white rounded-md bg-stone-500">Add</button>
            <button onClick={handleClickMinusLocal} className="h-8 px-2 text-white rounded-md bg-stone-500">Minus</button>
        </div>

    </div>)

    function handleClickAdd() {
        SignalsStore.main.count.value = SignalsStore.main.count.value + 1
    }

    function handleClickMinus() {
        SignalsStore.main.count.value = SignalsStore.main.count.value - 1
    }

    function handleClickAddLocal() {
        localCount.value = localCount.value + 1
    }

    function handleClickMinusLocal() {
        localCount.value = localCount.value - 1
    }
}
export { AppSignals }