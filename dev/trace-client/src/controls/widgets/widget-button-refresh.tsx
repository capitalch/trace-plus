import { useState } from "react";
import { IconRefresh } from "../icons/icon-refresh";
import clsx from "clsx";

export function WidgetButtonRefresh({ handleRefresh }: WidgetButtonRefreshType) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        try {
            await handleRefresh();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            className="flex px-2 bg-slate-50 rounded-xl hover:bg-slate-100"
            onClick={handleClick}
            disabled={isLoading}
        >
            <IconRefresh
                className={clsx(
                    'w-10 h-10 text-primary-400 hover:text-primary-600',
                    { 'animate-spin': isLoading }
                )}
            />
        </button>
    );
}

type WidgetButtonRefreshType = {
    handleRefresh: (args?: ArgsType) => void | Promise<void>
}
type ArgsType = {
    [item: string]: string | undefined | any
}