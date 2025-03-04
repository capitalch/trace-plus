import { useEffect, useRef, useState } from "react";
import { ibukiFilterOn } from "../../../utils/ibuki";
import { IbukiMessages } from "../../../utils/ibukiMessages";
import { CompModalDialog } from "../../../controls/components/comp-modal-dialog";

export function ModalDialogB() {
    const instanceName: string = 'B'
    const meta = useRef<ModalDialogMetaType>({
        className: '',
        isOpen: false,
        title: '',
        element: <></>,
        size: 'sm'
    })
    const [, setRefresh] = useState({})

    useEffect(() => {
        const subsA: any = ibukiFilterOn(IbukiMessages["SHOW-MODAL-DIALOG-B"]).subscribe((d) => {
            meta.current.title = d.data.title
            meta.current.isOpen = d.data.isOpen
            meta.current.element = d.data.element
            meta.current.className = d.data.className
            meta.current.size = d.data.size || 'sm'
            setRefresh({})
        })
        return (() => {
            subsA.unsubscribe()
        })
    }, [])

    return (
        <CompModalDialog body={meta.current.element} className={meta.current.className} title={meta.current.title} isOpen={meta.current.isOpen} instanceName={instanceName} size={meta.current.size} />
    )
}

type ModalDialogMetaType = {
    className: string
    isOpen: boolean
    title: string
    element: any
    size?: 'sm' | 'md' | 'lg'
}