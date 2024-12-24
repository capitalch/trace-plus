import clsx from "clsx"
import { Utils } from "../../utils/utils"
import { FC } from "react"

export function CompAccountsContainer({ children, className, CustomControl, MiddleCustomControl }: CompAccountsContainerType) {
    return (<div className={clsx(className, 'flex flex-col ml-8',)}>
        <div className="mt-6 flex justify-between items-center">
            <label className='text-xl font-semibold text-primary-400'>{Utils.getUnitInfo()?.unitName}</label>
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
}