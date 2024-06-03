import clsx from "clsx";

export function ContentContainer({ title, children, className }: ContentContainerType) {
    return (<div className={clsx('mx-8 flex flex-col h-full bg-white', className)}>
        <h2 className="mb-4 mt-4 font-bold text-primary-400 text-2xl">{title}</h2>
        {children}
    </div>)
}

type ContentContainerType = {
    className?: string
    children: any
    title: string
}