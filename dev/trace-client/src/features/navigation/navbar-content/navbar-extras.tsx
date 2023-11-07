import { SignalsStore } from "../../../app/signals-store"
import { ModalDialog } from "../../../components/widgets/modal-dialog"

// contains Modal dialogs
function NavbarExtras(){
    const isMmodalDialogAOpen = SignalsStore.modalDialogA.isOpen.value
    return(<div>
        <ModalDialog isOpen = {isMmodalDialogAOpen} />
    </div>)
}
export {NavbarExtras}