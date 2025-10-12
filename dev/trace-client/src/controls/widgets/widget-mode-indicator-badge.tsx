import clsx from "clsx";
import { IconEdit } from "../icons/icon-edit";
import { IconPlus } from "../icons/icon-plus";

export function WidgetModeIndicatorBadge({ isEditMode }: WidgetModeIndicatorBadgeProps) {
    return (
        <div
            className={clsx(
                "inline-flex items-center gap-1 px-2 py-0.5",
                "rounded-full text-[10px] font-semibold uppercase",
                "shadow-md border-2 transition-all duration-200",
                isEditMode
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-emerald-500 text-white border-emerald-600"
            )}
        >
            {isEditMode ? (
                <IconEdit className="w-2.5 h-2.5" />
            ) : (
                <IconPlus className="w-2.5 h-2.5" />
            )}
            <span>{isEditMode ? "EDIT" : "NEW"}</span>
        </div>
    );
}

type WidgetModeIndicatorBadgeProps = {
    isEditMode: boolean;
};
