import clsx from "clsx"

export function ReactTooltip() {
    return (
        <div className="p-10">
            <div className="group relative w-max">
                <button>Click me!</button>
                <span
                    className="pointer-events-none absolute -top-7 left-0 w-max rounded-sm bg-gray-500 px-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    This is a button.
                </span>
            </div>
        </div>
    )
}

export function ReactTooltip1({ children, className}: any) {
    return (
        <div className={clsx(className,"group relative w-max")}>
            {children}
            <span className="pointer-events-none absolute -top-7 left-0 w-max rounded-sm bg-gray-500 px-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                This is a button1
            </span>
        </div>
    )
}

export function ReactTooltip1Control(){
    return(
        <div>
            <ReactTooltip1 className='ml-10'>
                <button className="bg-slate-200">Click me1</button>
            </ReactTooltip1>
        </div>
    )
}