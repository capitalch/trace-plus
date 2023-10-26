import { useEffect, useRef, useState } from "react"
import { Button } from "../components/controls/buttons"
import clsx from "clsx"

function Navigation() {
    const [, setRefresh] = useState({})
    const leftGap = 200
    const meta: any = useRef({
       toggle: true
    })
    const pre = meta.current
    
   return (<div className="flex flex-col w-1/5 gap-2 m-10 ml-0">
        <Button />
        <button className="btn-primary ">Btn</button>
        <input type="text" className="h-8 px-2 py-3 border border-zinc-300" />
        <div className="prose prose-slate prose-h4:text-red-600">
            <h4 className="ml-2">Header</h4>
        </div>
        
        <div className={pre.toggle ? 'full-width': clsx('less-width h-10')}></div>
        <button onClick={handleMenuToggle} className="py-1 text-white rounded-sm bg-slate-700 w-28">Menu toggle</button>
    </div>)

    function handleMenuToggle() {
        pre.toggle = !pre.toggle
        setRefresh({})
    }
}
export { Navigation }