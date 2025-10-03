import clsx from "clsx";
import { FC, } from "react";

export function CompContentContainer({ title, children, className, CustomControl, }: CompContentContainerType) {
    return (<div className={clsx(className, 'mt-6 mx-8 flex flex-col h-full',)}>
        <div className="flex items-center justify-between h-12">
            <label className="font-semibold text-gray-500 text-xl">{title}</label>
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