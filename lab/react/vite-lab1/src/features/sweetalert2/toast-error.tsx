import Swal from "sweetalert2"
import { Button } from 'primereact/button';
// import './style.css';
// import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';
function ToastError() {
    return (<div>
        <button className="bg-slate-100" onClick={handleOnClick}>Error notification</button>
        <Button label="My button" icon="pi pi-check" />
    </div>)

    function handleOnClick() {
        Swal.fire({
            allowOutsideClick:true,
            toast: true,
            position: "bottom-right",
            color: "white",
            background:'red',
            timer: 5000,
            timerProgressBar: true,
            title: 'This is an error. Please try again to overcome this error',
            padding: '5px',
            showConfirmButton: false,
            icon: 'error',
            iconColor:'white',
            // grow:'column',
            // heightAuto:false,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
    }
}
export { ToastError }