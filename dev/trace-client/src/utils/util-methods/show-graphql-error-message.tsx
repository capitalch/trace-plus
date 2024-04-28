import Swal from "sweetalert2"

export function showGraphQlErrorMessage(error: GraphQlErrorType){
    Swal.fire({
        toast: true,
        position: "bottom-right",
        color: "white",
        background: 'red',
        timer: 10000,
        timerProgressBar: true,
        title: `Error ${error?.status_code}: ${error?.error_code}: ${error?.message}`,
        padding: '10px',
        showConfirmButton: false,
        icon: 'error',
        iconColor: 'white',
        width: 'auto',
    })
}

type GraphQlErrorType = {
    error_code: string
    status_code: number
    message: string
}