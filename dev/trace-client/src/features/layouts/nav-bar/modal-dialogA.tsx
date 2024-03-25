import { useSelector } from "react-redux";
import { ModalDialog } from "../../../components/widgets/modal-dialog";
import { isOpenModalDialogAFn } from "../layouts-slice";

export function ModalDialogA({ title, }: ModalDialogType) {
    const isOpenModalDialogASelector: boolean = useSelector(isOpenModalDialogAFn)
    return (
        <ModalDialog title={title} isOpen={isOpenModalDialogASelector} />
    )
}

export type ModalDialogType = {
    title: string
}