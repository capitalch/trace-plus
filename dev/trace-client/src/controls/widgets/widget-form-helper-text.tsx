import clsx from "clsx"

export function WidgetFormHelperText({className='', helperText }: WidgetFormHelperText) {
    return (
        <span className={clsx(className,"mt-0.5 text-xs text-slate-400")}>{helperText}</span>
    )
}

type WidgetFormHelperText = {
    className?: string
    helperText: string
}