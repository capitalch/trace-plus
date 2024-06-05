import { useEffect, useRef, useState } from "react";
import { ibukiFilterOn } from "../../../utils/ibuki";
import { IbukiMessages } from "../../../utils/ibukiMessages";
import { CompModalDialog } from "../../../controls/components/comp-modal-dialog";

export function ModalDialogA() {
    const instanceName: string = 'A'
    const meta = useRef<ModalDialogMetaType>({
        isOpen: false,
        title: '',
        element: <></>
    })
    const [, setRefresh] = useState({})

    useEffect(() => {
        const subsA: any = ibukiFilterOn(IbukiMessages["SHOW-MODAL-DIALOG-A"]).subscribe((d) => {
            meta.current.title = d.data.title
            meta.current.isOpen = d.data.isOpen
            meta.current.element = d.data.element
            setRefresh({})
        })
        return (() => {
            subsA.unsubscribe()
        })
    }, [])

    return (
        <CompModalDialog body={meta.current.element} title={meta.current.title} isOpen={meta.current.isOpen} instanceName={instanceName} />
    )
}

type ModalDialogMetaType = {
    isOpen: boolean
    title: string
    element: any
}