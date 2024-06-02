import { Bounce, toast } from "react-toastify"

export function ReactToastify(){
    return(<div>
        <button className="bg-slate-100" onClick={handleOnClick}>Error notification</button>
    </div>)
    function handleOnClick() {
        toast('This is error',{
            autoClose: false,
            position:'bottom-right',
            closeOnClick: true,
            
            theme:"colored",
            transition:Bounce,
            type:'error',
            onClick: ()=>{
                toast.dismiss()
            }
        })
    }
}