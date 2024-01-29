import clsx from "clsx"

function FormHelperText({className='', helperText }: FormHelperText) {
    return (
        <span className={clsx(className,"mt-0.5 text-xs text-slate-400")}>{helperText}</span>
    )
}
export { FormHelperText }

type FormHelperText = {
    className?: string
    helperText: string
}