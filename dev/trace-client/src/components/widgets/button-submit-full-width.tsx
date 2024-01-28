import clsx from "clsx"

function ButtonSubmitFullWidth({ className = '', label, onClick }: ButtonSubmitFullWidthType) {
    return (<button onClick={onClick}
        className={clsx(className, "w-full rounded-md h-10 py-1 text-xl text-white hover:border-primary-300 bg-primary-400 hover:bg-primary-600 hover:border-2")}>{label}</button>)
}
// 
export { ButtonSubmitFullWidth }

type ButtonSubmitFullWidthType = {
    className?: string
    label: string
    onClick?: () => void
}