import clsx from "clsx"

function FormErrorMessage({ className = '', errorMessage }: FormErrorMessageType) {
    return (<span className={clsx(className, "mt-0.5 text-xs text-error-500")}>{errorMessage}</span>)
}
export { FormErrorMessage }

type FormErrorMessageType = {
    className?: string
    errorMessage: any
}