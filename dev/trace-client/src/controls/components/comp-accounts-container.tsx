import clsx from "clsx"
import { Utils } from "../../utils/utils"
import { FC } from "react"

export function CompAccountsContainer({ children, className, CustomControl, MiddleCustomControl, LeftCustomControl }: CompAccountsContainerType) {
    return (
        <div className={clsx(className, 'flex flex-col ml-8',)}>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                    <label className='font-semibold text-primary-400 text-xl'>{Utils.getUnitInfo()?.unitName}</label>
                    {LeftCustomControl && <LeftCustomControl />}
                </div>
                {MiddleCustomControl && <MiddleCustomControl />}
                <div className="flex items-center">
                    {CustomControl && <CustomControl />}
                    <label className="mr-6 font-semibold text-primary-300">{Utils.getUserDetails()?.clientName}</label>
                </div>
            </div>
            {children}
        </div>)
}

type CompAccountsContainerType = {
    children: any
    className?: string
    CustomControl?: FC
    MiddleCustomControl?: FC
    LeftCustomControl?: FC
}