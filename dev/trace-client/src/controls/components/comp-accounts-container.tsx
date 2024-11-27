import clsx from "clsx"
import { Utils } from "../../utils/utils"

export function CompAccountsContainer({ children, className }: CompAccountsContainerType) {
    return (<div className={clsx(className, 'flex flex-col ml-8',)}>
        <label className='mt-6 text-xl font-semibold text-primary-400'>{Utils.getUnitInfo()?.unitName}</label>
        {children}
    </div>)
}

type CompAccountsContainerType = {
    children: any
    className?: string
}