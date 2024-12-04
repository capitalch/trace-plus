import clsx from "clsx"
import { Utils } from "../../utils/utils"

export function CompAccountsContainer({ children, className }: CompAccountsContainerType) {
    return (<div className={clsx(className, 'flex flex-col ml-8',)}>
        <div className="mt-6 flex justify-between items-center">
            <label className='text-xl font-semibold text-primary-400'>{Utils.getUnitInfo()?.unitName}</label>
            <label className="mr-6 font-semibold text-primary-300">{Utils.getUserDetails()?.clientName}</label>
        </div>
        {children}
    </div>)
}

type CompAccountsContainerType = {
    children: any
    className?: string
}