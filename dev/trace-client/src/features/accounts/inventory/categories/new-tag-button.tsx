import clsx from "clsx";
import { Utils } from "../../../../utils/utils";
import { NewEditTagModal } from "./new-edit-tag-modal";

export function NewTagButton({ className }: NewTagButtonType) {
    return (
        <button
            className={clsx(
                "bg-primary-400 text-white w-20 h-10 rounded-md hover:bg-primary-600",
                className
            )}
            onClick={handleNewTag}>
            New
        </button>
    );

    function handleNewTag() {
        Utils.showHideModalDialogB({
            title: "New Tag",
            isOpen: true,
            element: <NewEditTagModal id={undefined} tagName="" />,
        });
    }
}

type NewTagButtonType = {
    className?: string;
};
