import clsx from "clsx";
import { NewEditTagModal } from "./new-edit-tag-modal";
import { Utils } from "../../../../../utils/utils";

export function NewTagButton({ className, instance }: NewTagButtonType) {
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
            element: <NewEditTagModal id={undefined} tagName="" instance={instance} />,
        });
    }
}

type NewTagButtonType = {
    className?: string;
    instance: string
};
