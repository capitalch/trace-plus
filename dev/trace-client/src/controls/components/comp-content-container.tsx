import clsx from "clsx";
import { FC, } from "react";

export function CompContentContainer({ title, children, className, CustomControl }: CompContentContainerType) {
    return (<div className={clsx('mb-4 mt-4 mx-8 flex flex-col h-full', className)}>
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-400">{title}</h2>
            {CustomControl && <CustomControl />}
        </div>
        {children}
    </div>)
}

type CompContentContainerType = {
    className?: string
    children: any
    CustomControl?: FC
    title: string
}