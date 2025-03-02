import { Utils } from "../../../../utils/utils"
import { ManageCategoryHsn } from "./manage-category-hsn-modal"

export function ProductCategoriesToolbarButtons() {
    return (<div className="flex items-center gap-4 mb-1 mr-2">
        <button onClick={handleManageHsn} className="bg-primary-400 text-white px-4 py-1 rounded-md hover:bg-primary-600 w">Manage HSN</button>
        <button onClick={handleManageTags} className="bg-blue-400 text-white px-4 py-1 rounded-md hover:bg-blue-600">Manage Tags</button>
    </div>)

    function handleManageHsn() {
        Utils.showHideModalDialogA({
            title: "Manage HSN",
            isOpen: true,
            element: <ManageCategoryHsn />,
            size: 'lg',
        })
    }

    function handleManageTags() {

    }
}