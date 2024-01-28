import clsx from "clsx"

function FormHelperText({className='', helperText }: FormHelperText) {
    return (
        <span className={clsx(className,"mt-1 text-xs text-slate-500")}>{helperText}</span>
    )
}
export { FormHelperText }

type FormHelperText = {
    className?: string
    helperText: string
}