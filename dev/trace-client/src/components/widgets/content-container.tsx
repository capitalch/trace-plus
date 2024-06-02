import clsx from "clsx";

export function ContentContainer({ title, children, className }: ContentContainerType) {
    return (<div className={clsx('mx-8 flex flex-col', className)}>
        <h3 className="mb-4 mt-4 font-bold text-primary-300 ml-auto">{title}</h3>
        {children}
    </div>)
}

type ContentContainerType = {
    className?: string
    children: any
    title: string
}