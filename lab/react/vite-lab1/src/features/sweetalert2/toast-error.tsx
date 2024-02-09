import Swal from "sweetalert2"

function ToastError() {
    return (<div>
        <button className="bg-slate-100" onClick={handleOnClick}>Error notification</button>
    </div>)

    function handleOnClick() {
        Swal.fire({
            toast: true,
            position: "bottom-right",
            color: "white",
            background:'red',
            timer: 5000,
            timerProgressBar: true,
            title: 'This is an error. Please try again to overcome this error',
            showConfirmButton: false,
            icon: 'error',
            customClass:{
                
            }
        })
    }
}
export { ToastError }