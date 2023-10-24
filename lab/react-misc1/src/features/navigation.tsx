import { useRef, useState } from "react"
import { Button } from "../components/controls/buttons"
import clsx from "clsx"

function Navigation() {
    const [, setRefresh] = useState({})
    const leftGap = 200
    const meta: any = useRef({
        toggleValue: '200px'
    })
    const pre = meta.current
    // ml-[${pre.toggleValue}] 
    // `w-[calc(100vw_-_${pre.toggleValue})]
    const toggleClass = `ml-[${pre.toggleValue}] w-[calc(100vw_-_${pre.toggleValue})]`
    return (<div className="flex flex-col w-1/5 gap-2 m-10 ml-0">
        <Button />
        <button className="btn-primary ">Btn</button>
        <input type="text" className="h-8 px-2 py-3 border border-zinc-300" />
        <div className="prose prose-slate prose-h4:text-red-600">
            <h4 className="ml-2">Header</h4>
        </div>
        {/* <div className="h-10 bg-slate-400 md-header"></div> */}
        <div className={clsx('h-10 bg-slate-400', toggleClass)}></div>
        <button onClick={handleMenuToggle} className="bg-slate-700 text-white w-28 py-1 rounded-sm">Menu toggle</button>
    </div>)

    function handleMenuToggle() {
        if(pre.toggleValue === '0px'){
            pre.toggleValue = '200px'
        } else {
            pre.toggleValue = '0px'
        }
        setRefresh({})
    }
}
export { Navigation }