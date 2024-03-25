import { useEffect, useRef, useState } from "react";
import { ModalDialog } from "../../../components/widgets/modal-dialog";
import { ibukiFilterOn } from "../../../utils/ibuki";
import { IbukiMessages } from "../../../utils/ibukiMessages";

export function ModalDialogA() {
    const instanceName: string = 'A'
    const meta = useRef<ModalDialogMetaType>({
        isOpen: false,
        title: '',
        element: <></>
    })
    const [, setRefresh] = useState({})

    useEffect(() => {
        const subsA: any = ibukiFilterOn(IbukiMessages["SHOW-MODAL-DIALOG-"] + instanceName).subscribe((d) => {
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
        <ModalDialog body={meta.current.element} title={meta.current.title} isOpen={meta.current.isOpen} instanceName={instanceName} />
    )
}

type ModalDialogMetaType = {
    isOpen: boolean
    title: string
    element: any
}