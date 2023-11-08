import { SignalsStore } from "../../../app/signals-store"
import { ModalDialog } from "../../../components/widgets/modal-dialog"

// contains Modal dialogs
function NavbarExtras() {
    
    return (<div>
        <ModalDialog
            body={SignalsStore.modalDialogA.body.value}
            defaultData={SignalsStore.modalDialogA.defaultData.value}
            isOpen={SignalsStore.modalDialogA.isOpen}
            size={SignalsStore.modalDialogA.size.value}
            title={SignalsStore.modalDialogA.title.value}
            toShowCloseButton={SignalsStore.modalDialogA.toShowCloseButton.value}
        />
    </div>)
}
export { NavbarExtras }