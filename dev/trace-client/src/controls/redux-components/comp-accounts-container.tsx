import clsx from "clsx"
import { Utils } from "../../utils/utils"
import { FC } from "react"
import { useSelector } from "react-redux"

export function CompAccountsContainer({ children, className, CustomControl, MiddleCustomControl, LeftCustomControl }: CompAccountsContainerType) {
    const selectedMainTitle = useSelector((state: any) => state.reduxComp.compAccountsContainer.mainTitle)
    return (
        <div className={clsx(className, 'flex flex-col ml-8',)}>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                    <label className='font-semibold text-primary-400 text-xl'>{Utils.getUnitInfo()?.unitName}</label>
                    {<span className="ml-2 text-lg text-gray-600 font-bold">→ {selectedMainTitle}</span>}
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