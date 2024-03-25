import { ReactElement } from "react"
import { ibukiEmit } from "../ibuki"
import { IbukiMessages } from "../ibukiMessages"

export function showHideModalDialogA({ isOpen, title, element }: ShowHideModalDialogType) {
    const instanceName: string = 'A'
    const args: ShowModalDialogMessageArgsType = {
        title: title,
        isOpen: isOpen,
        element: element,
        instanceName: instanceName
    }
    ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-"] + instanceName, args)
}

export function showHideModalDialogB({ isOpen, title, element }: ShowHideModalDialogType) {
    const instanceName: string = 'B'
    const args: ShowModalDialogMessageArgsType = {
        title: title,
        isOpen: isOpen,
        element: element,
        instanceName: instanceName
    }
    ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-"] + instanceName, args)
}

type ShowHideModalDialogType = {
    isOpen: boolean
    title: string | undefined
    element: ReactElement
}

export type ShowModalDialogMessageArgsType = {
    title: string | undefined
    isOpen: boolean
    element: ReactElement
    instanceName: string
}