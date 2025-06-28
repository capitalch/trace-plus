import clsx from "clsx"

export function WidgetTooltip({ children, className, title }: WidgetTooltipType) {
    return (
        <div className={clsx("group relative w-max z-50")}>
            {children}
            <span className={clsx(className,"pointer-events-none absolute -top-8 z-10 left-0 w-max rounded-md bg-gray-500 px-2 text-white opacity-0 transition-opacity group-hover:opacity-100")}>
                {title}
            </span>
        </div>
    )
}

type WidgetTooltipType = {
    children: any
    className?: string
    title: string
}