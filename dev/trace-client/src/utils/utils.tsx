import Swal from "sweetalert2"
import { RootStateType, store } from "../app/store/store"
import { Messages } from "./messages"
import { ReactElement } from "react"
import { ibukiEmit } from "./ibuki"
import { IbukiMessages } from "./ibukiMessages"

export const Utils: UtilsType = {
    getHostUrl: getHostUrl,
    getReduxState: getReduxState,
    getToken: getToken,
    showErrorMessage: showErrorMessage,
    showHideModalDialogA: showHideModalDialogA,
    showHideModalDialogB: showHideModalDialogB,
    showGraphQlErrorMessage: showGraphQlErrorMessage,
    showSaveMessage: showSaveMessage
}

function getHostUrl() {
    let url: string
    if (import.meta.env.DEV) {
        url = import.meta.env['VITE_APP_LOCAL_SERVER_URL']
    } else {
        url = window.location.href
    }
    return (url)
}

function getReduxState(): RootStateType{
    return(store.getState())
}

function getToken(){
    const state: RootStateType = store.getState();
    return(state.login.token)
}

function showErrorMessage(error?: ErrorType, errorCode?: string, errorMessage?: string): void {
    const errCode = error?.response?.data?.error_code || errorCode || ''
    const errMessage = error?.response?.data?.message || errorMessage || Messages.errUnknown
    const status = error?.response?.status || 500

    Swal.fire({
        toast: true,
        position: "bottom-right",
        color: "white",
        background: 'red',
        timer: 50000,
        timerProgressBar: true,
        title: `Error ${status}: ${errCode}: ${errMessage}`,
        padding: '10px',
        showConfirmButton: false,
        icon: 'error',
        iconColor: 'white',
        width: 'auto',
        showCloseButton: true,
        
    })
}

function showGraphQlErrorMessage(error: GraphQlErrorType){
    Swal.fire({
        toast: true,
        position: "bottom-right",
        color: "white",
        background: 'red',
        timer: 10000,
        timerProgressBar: true,
        title: `Error ${error?.status_code}: ${error?.error_code}: ${error?.message}: ${error?.detail}`,
        padding: '10px',
        showConfirmButton: false,
        icon: 'error',
        iconColor: 'white',
        width: 'auto',
    })
}

function showHideModalDialogA({ isOpen, title, element }: ShowHideModalDialogType) {
    const instanceName: string = 'A'
    const args: ShowModalDialogMessageArgsType = {
        title: title,
        isOpen: isOpen,
        element: element,
        instanceName: instanceName
    }
    ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-" + instanceName] , args)
}

function showHideModalDialogB({ isOpen, title, element }: ShowHideModalDialogType) {
    const instanceName: string = 'B'
    const args: ShowModalDialogMessageArgsType = {
        title: title,
        isOpen: isOpen,
        element: element,
        instanceName: instanceName
    }
    ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-" + instanceName] , args)
}

function showSaveMessage() {
    Swal.fire({
        toast: true,
        position: "top-right",
        background: '#d0f0c0',
        timer: 3000,
        timerProgressBar: true,
        title: 'Operation successful',
        padding: '10px',
        showConfirmButton: false,
        icon: 'success',
        iconColor: '#007f5c',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
        width:'20rem'
    })
}

type ErrorType = {
    message: string
    response?: {
        status: number
        data: {
            error_code: string
            message: string
        }
    }
}

type GraphQlErrorType = {
    detail: string
    error_code: string
    status_code: number
    message: string
}

type ShowHideModalDialogType = {
    isOpen: boolean
    title: string | undefined
    element: ReactElement
}

type ShowModalDialogMessageArgsType = {
    title: string | undefined
    isOpen: boolean
    element: ReactElement
    instanceName: string
}

type UtilsType = {
    getHostUrl: () => string
    getReduxState: () => RootStateType
    getToken: () => string | undefined
    showErrorMessage: (error?: ErrorType, errorCode?: string, errorMessage?: string) => void
    showHideModalDialogA: (options:ShowHideModalDialogType) => void
    showHideModalDialogB: (options:ShowHideModalDialogType) => void
    showGraphQlErrorMessage: (error: GraphQlErrorType) => void
    showSaveMessage: () => void
}