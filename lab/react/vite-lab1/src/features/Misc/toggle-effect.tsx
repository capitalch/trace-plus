import { useEffect, useState } from "react";

export function ToggleEffect() {
    const [toggle, setToggle] = useState(false);

    useEffect(() => {
        loadData();
    }, [toggle]);

    return (<div className="flex flex-col w-40 m-4">
        <div>Toggle Effect</div>
        <button onClick={() => setToggle((old: boolean) => !old)} className="p-2 bg-blue-500 text-white rounded mt-2">
            Toggle button</button>
    </div>);

    function loadData() {
        // Simulate data loading
        console.log("Data loaded");
    }
}