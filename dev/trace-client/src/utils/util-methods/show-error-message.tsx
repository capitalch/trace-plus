import Swal from "sweetalert2"
import { Messages } from "../messages"

export function showErrorMessage(error?: ErrorType, errorCode?: string, errorMessage?: string): void {
    const errCode = error?.response?.data?.error_code || errorCode || ''
    const errMessage = error?.response?.data?.message || errorMessage || Messages.errUnknown
    const status = error?.response?.status || 500

        Swal.fire({
            toast: true,
            position: "bottom-right",
            color: "white",
            background: 'red',
            timer: 10000,
            timerProgressBar: true,
            
            // title: `Error ${errorCode || ''}`,
            // titleText:'Error details is here',
            title: `Error ${status}: ${errCode}: ${errMessage}`,
            padding: '10px',
            showConfirmButton: false,
            icon: 'error',
            iconColor: 'white',
            width: 'auto',
            // allowEscapeKey: true,
            // showCloseButton: true,
            // onOutsideClick:(e: any) =>{},
            // showCancelButton: true,
            // allowOutsideClick: true,
        })
}

export type ErrorType = {
    message: string
    response: {
        status: number
        data: {
            error_code: string
            message: string
        }
    }
}