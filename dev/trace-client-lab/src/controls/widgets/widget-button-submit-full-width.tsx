import clsx from "clsx"

export function WidgetButtonSubmitFullWidth({ className = '', label, onClick, props, disabled=false}: WidgetButtonSubmitFullWidthType) {
    return (<button onClick={onClick} {...props} disabled={disabled}
        className={clsx(className,
            "w-full h-10 py-1 text-xl text-white bg-primary-400 rounded-md hover:border-2 hover:border-primary-300 hover:bg-primary-600 disabled:bg-primary-200")
        }>
        {label}
    </button>)
}

type WidgetButtonSubmitFullWidthType = {
    className?: string
    label: string
    onClick?: (data?:any) => void
    props?: any
    disabled?: boolean
}