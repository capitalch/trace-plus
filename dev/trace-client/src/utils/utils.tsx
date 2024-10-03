import Swal from "sweetalert2"
import { RootStateType, store } from "../app/store/store"
import { Messages } from "./messages"
import { ReactElement } from "react"
import { ibukiEmit } from "./ibuki"
import { IbukiMessages } from "./ibukiMessages"
import { getApolloClient } from "../app/graphql/apollo-client"

export const Utils: UtilsType = {
    getHostUrl: getHostUrl,
    getReduxState: getReduxState,
    getToken: getToken,
    mutateGraphQL: mutateGraphQL,
    queryGraphQL: queryGraphQL,
    showAppLoader: showAppLoader,
    showErrorMessage: showErrorMessage,
    showHideModalDialogA: showHideModalDialogA,
    showHideModalDialogB: showHideModalDialogB,
    showGraphQlErrorMessage: showGraphQlErrorMessage,
    showSaveMessage: showSaveMessage,
    showSuccessAlertMessage: showSuccessAlertMessage,
    showFailureAlertMessage: showFailureAlertMessage
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

function getReduxState(): RootStateType {
    return (store.getState())
}

function getToken() {
    const state: RootStateType = store.getState();
    return (state.login.token)
}

async function mutateGraphQL(q: any, queryName: string) {
    try {
        showAppLoader(true)
        const client = getApolloClient()
        const result: any = await client.mutate({
            mutation: q
        })
        const error: any = result?.data?.[queryName]?.error?.content
        if (error) {
            Utils.showGraphQlErrorMessage(error)
            throw error
        }
        showSaveMessage()
        return (result)
    } finally {
        showAppLoader(false)
    }
}

async function queryGraphQL(q: any, queryName: string) {
    try {
        showAppLoader(true)
        const client = getApolloClient()
        const result: any = await client.query({
            query: q
        })
        const error: any = result?.data?.[queryName]?.error?.content
        if (error) {
            Utils.showGraphQlErrorMessage(error)
            throw error
        }
        return (result)
    } finally {
        showAppLoader(false)
    }
}

function showAppLoader(val: boolean) {
    ibukiEmit('SHOW-APP-LOADER', val)
}

function showErrorMessage(error?: ErrorType, errorCode?: string, errorMessage?: string): void {
    const errCode = error?.response?.data?.error_code || errorCode || ''
    const errMessage = error?.response?.data?.message || errorMessage || error?.message || Messages.errUnknown
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

function showGraphQlErrorMessage(error: GraphQlErrorType) {
    Swal.fire({
        toast: true,
        position: "bottom-right",
        color: "white",
        background: 'red',
        timer: 50000,
        timerProgressBar: true,
        title: `Error ${error?.status_code}: ${error?.error_code}: ${error?.message}: ${error?.detail}`,
        padding: '10px',
        showConfirmButton: false,
        icon: 'error',
        iconColor: 'white',
        width: 'auto',
        showCloseButton: true,
    })
}

function showHideModalDialogA({ isOpen, title = '', element = <></> }: ShowHideModalDialogType) {
    const args: ShowModalDialogMessageArgsType = {
        title: title,
        isOpen: isOpen,
        element: element,
        instanceName: 'A'
    }
    ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-A"], args)
}

function showHideModalDialogB({ isOpen, title = '', element = <></> }: ShowHideModalDialogType) {

    const args: ShowModalDialogMessageArgsType = {
        title: title,
        isOpen: isOpen,
        element: element,
        instanceName: 'B'
    }
    ibukiEmit(IbukiMessages["SHOW-MODAL-DIALOG-B"], args)

}

function showSaveMessage() {
    Swal.fire({
        toast: true,
        position: "bottom-right",
        background: '#d0f0c0',
        timer: 5000,
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
        width: '20rem'
    })
}

function showSuccessAlertMessage(alertMessage: AlertMessageType) {
    Swal.fire({
        title: alertMessage.title,
        text: alertMessage.message,
        icon: 'success'
    })
}

function showFailureAlertMessage(alertMessage: AlertMessageType) {
    Swal.fire({
        title: alertMessage.title,
        text: alertMessage.message,
        icon: 'error'
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

type AlertMessageType = {
    title: string
    message: string
}

type GraphQlErrorType = {
    detail: string
    error_code: string
    status_code: number
    message: string
}

type ShowHideModalDialogType = {
    isOpen: boolean
    title?: string | undefined
    element?: ReactElement
}

type ShowModalDialogMessageArgsType = {
    title?: string | undefined
    isOpen: boolean
    element?: ReactElement
    instanceName: string
}

type UtilsType = {
    getHostUrl: () => string
    getReduxState: () => RootStateType
    getToken: () => string | undefined
    mutateGraphQL: (q: any, queryName: string) => any
    queryGraphQL: (q: any, queryName: string) => any
    showFailureAlertMessage:(alertMessage:AlertMessageType) => void
    showSuccessAlertMessage: (alertMessage: AlertMessageType) => void
    showAppLoader: (val: boolean) => void
    showErrorMessage: (error?: ErrorType, errorCode?: string, errorMessage?: string) => void
    showHideModalDialogA: (options: ShowHideModalDialogType) => void
    showHideModalDialogB: (options: ShowHideModalDialogType) => void
    showGraphQlErrorMessage: (error: GraphQlErrorType) => void
    showSaveMessage: () => void
}