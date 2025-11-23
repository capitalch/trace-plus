import clsx from "clsx"
import { Utils } from "../../utils/utils"
import { FC } from "react"
import { useSelector } from "react-redux"
import { WidgetButtonBackToReport } from "../widgets/widget-button-back-to-report"

export function CompAccountsContainer({ children, className, CustomControl, MiddleCustomControl, LeftCustomControl }: CompAccountsContainerType) {
    const selectedMainTitle = useSelector((state: any) => state.reduxComp.compAccountsContainer.mainTitle)
    return (
        <div className={clsx(className, 'flex flex-col ml-8',)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 items-center mt-4 mr-6">
                {/* <div className="flex items-center mt-4 mr-6"> */}
                {/* Column 1: Unit and Title */}
                <div className="flex items-center gap-2">
                    <label className='font-semibold text-primary-400 text-lg lg:text-xl'>{Utils.getUnitInfo()?.unitName}</label>
                    <span className="text-base lg:text-lg text-gray-600 font-bold">→ {selectedMainTitle}</span>
                    {LeftCustomControl && <LeftCustomControl />}
                </div>

                {/* Column 2: Toggle Buttons - Always Centered */}
                <div className="flex justify-center">
                    {MiddleCustomControl && <MiddleCustomControl />}
                </div>

                {/* Column 3: Back and Client */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-center lg:justify-end">
                    <WidgetButtonBackToReport className="" />
                    <div className="flex items-center gap-2">
                        {CustomControl && <CustomControl />}
                        <label className="font-semibold text-primary-300 text-sm lg:text-base">{Utils.getUserDetails()?.clientName}</label>
                    </div>
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