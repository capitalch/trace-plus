import Swal from "sweetalert2"

function showSaveMessage() {
    Swal.fire({
        toast: true,
        position: "top-right",
        // color: "white",
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

export { showSaveMessage }
