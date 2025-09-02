import { Utils } from "../../../../utils/utils"
import { ManageCategoryHsn } from "./manage-hsn/manage-category-hsn-modal"
import { ManageTags } from "./manage-tags/manage-tags"

export function ProductCategoriesToolbarButtons() {
    return (<div className="flex items-center mr-2 mb-1 gap-4">
        <button onClick={handleManageHsn} className="px-4 py-1 text-white rounded-md hover:bg-primary-600 bg-primary-400 w">Manage HSN</button>
        <button onClick={handleManageTags} className="px-4 py-1 text-white bg-blue-400 rounded-md hover:bg-blue-600">Manage Tags</button>
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
        Utils.showHideModalDialogA({
            title: "Manage Tags",
            isOpen: true,
            element: <ManageTags />,
            size: 'md',
        })
    }
}