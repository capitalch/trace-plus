import clsx from "clsx";
import { FC, } from "react";

export function CompContentContainer({ title, children, className, CustomControl, }: CompContentContainerType) {
    return (<div className={clsx(className, 'mt-4 mx-8 flex flex-col h-full',)}>
        <div className="flex items-center h-12">
            <label className="text-xl font-semibold text-gray-500">{title}</label>
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