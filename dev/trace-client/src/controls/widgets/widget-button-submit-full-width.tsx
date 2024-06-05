import clsx from "clsx"

export function WidgetButtonSubmitFullWidth({ className = '', label, onClick, props }: WidgetButtonSubmitFullWidthType) {
    return (<button onClick={onClick} {...props}
        className={clsx(className, "w-full rounded-md h-10 py-1 text-xl text-white hover:border-primary-300 bg-primary-400 hover:bg-primary-600 hover:border-2")}>{label}</button>)
}

type WidgetButtonSubmitFullWidthType = {
    className?: string
    label: string
    onClick?: () => void
    props?: any
}