import clsx from "clsx"

export function WidgetFormErrorMessage({ className = '', errorMessage }: WidgetFormErrorMessageType) {
    return (<span className={clsx(className, "mt-0.5 text-xs text-error-500")}>{errorMessage}</span>)
}

type WidgetFormErrorMessageType = {
    className?: string
    errorMessage: any
}