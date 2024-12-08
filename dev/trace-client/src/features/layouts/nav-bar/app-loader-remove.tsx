import { useEffect, useRef, useState } from "react";
import { WidgetLoadingIndicator } from "../../../controls/widgets/widget-loading-indicator";
import { ibukiFilterOn } from "../../../utils/ibuki";

export function AppLoaderRemove() {
    const [, setRefresh] = useState({})
    const meta: any = useRef({
        isOpen: false
    })

    useEffect(() => {
        const subs1: any = ibukiFilterOn('SHOW-APP-LOADER').subscribe((d: any) => {
            meta.current.isOpen = d.data
            setRefresh({})
        })
        return (() => {
            subs1.unsubscribe()
        })
    }, [])

    return (
        meta.current.isOpen ? <div className="fixed inset-0 z-150 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
            <WidgetLoadingIndicator />
        </div> : <></>)
}