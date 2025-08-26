import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import { setSideBarSelectedChildId, setSideBarSelectedParentChildIds, sideBarSelectedChildIdFn, sideBarSelectedParentIdFn } from "../layouts-slice"
import { AppDispatchType } from "../../../app/store"
import { IconCheveronUp } from "../../../controls/icons/icon-cheveron-up"
import { IconVoucher } from "../../../controls/icons/icon-voucher"
import { IconCheveronDown } from "../../../controls/icons/icon-cheveron-down"
import { IconPurchaseSales } from "../../../controls/icons/icon-purchase-sales"

function SideMenuTemp() {
    const sideBarSelectedParentIdSelector = useSelector(sideBarSelectedParentIdFn)
    const sideBarSelectedChildIdSelector = useSelector(sideBarSelectedChildIdFn)
    const dispatch: AppDispatchType = useDispatch()

    const rootClass = "prose mx-0.5 mt-0.5 flex flex-col text-sm text-black md:text-base"
    const parentClass = "flex h-10 px-2 border-b-[1px] items-center gap-3 rounded-md  font-bold hover:bg-primary-50 focus:outline-hidden"
    const childClass = "flex h-10 w-full border-b-[1px]  items-center rounded-md  pl-9 hover:bg-primary-100 focus:outline-hidden "
    return (
        // root
        <div className={rootClass}>
            {/* parent with children */}
            <div className="flex flex-col">
                {/* parent */}
                <button id='1' onClick={handleParentClick} className={parentClass}>
                    <IconVoucher className='text-blue-500' />
                    <span>Vouchers</span>
                    <IconCheveronDown className={clsx('ml-auto', getArrowDownClass('1'))} />
                    <IconCheveronUp className={clsx('ml-auto', getArrowUpClass('1'))} />
                </button>
                {/* children */}
                <div className={getParentExpandedClass('1')}>
                    <button onClick={handleChildClick} id='11' className={clsx(childClass, getSelectedChildClass('11'))}>Journals</button>
                    <button onClick={handleChildClick} id='12' className={clsx(childClass, getSelectedChildClass('12'))}>Payments</button>
                    <button onClick={handleChildClick} id='13' className={clsx(childClass, getSelectedChildClass('13'))}>Receipts</button>
                    <button onClick={handleChildClick} id='14' className={clsx(childClass, getSelectedChildClass('14'))}>Contra</button>
                </div>
            </div>
            <div className="flex flex-col">
                <button id='2' onClick={handleParentClick} className={parentClass}>
                    <IconPurchaseSales className='text-orange-500' />
                    <span>Purch / sales</span>
                    <IconCheveronDown className={clsx('ml-auto', getArrowDownClass('2'))} />
                    <IconCheveronUp className={clsx('ml-auto', getArrowUpClass('2'))} />
                </button>
                <div className={getParentExpandedClass('2')}>
                    <button onClick={handleChildClick} id='21' className={clsx(childClass, getSelectedChildClass('21'))}>Purchase</button>
                    <button onClick={handleChildClick} id='22' className={clsx(childClass, getSelectedChildClass('22'))}>Purchase return</button>
                    <button onClick={handleChildClick} id='23' className={clsx(childClass, getSelectedChildClass('23'))}>Sales</button>
                    <button onClick={handleChildClick} id='24' className={clsx(childClass, getSelectedChildClass('24'))}>Sales return</button>
                </div>
            </div>
        </div>)

    function getArrowUpDown(parentId: string): 'up' | 'down' {
        let ret: any = 'down'

        if (sideBarSelectedParentIdSelector === parentId) {
            if (parentId !== '') {
                ret = 'up'
            }
        }
        return (ret)
    }

    function getArrowDownClass(parentId: string) {
        const upDown = getArrowUpDown(parentId)
        return ((upDown === 'down') ? 'block' : 'hidden')
    }

    function getArrowUpClass(parentId: string) {
        const upDown = getArrowUpDown(parentId)
        return ((upDown === 'up') ? 'block' : 'hidden')
    }

    function getParentExpandedClass(parentId: string) {
        return (
            (sideBarSelectedParentIdSelector === parentId) ? 'block' : 'hidden'
        )
    }

    function getSelectedChildClass(childId: string) {
        return ((sideBarSelectedChildIdSelector === childId) ? 'bg-primary-100' : 'bg-slate-50')
    }

    function handleParentClick(e: any) {
        const id = e.currentTarget.id
        if (id === sideBarSelectedParentIdSelector) {
            dispatch(setSideBarSelectedParentChildIds({ parentId: '', childId: '' }))
        } else {
            dispatch(setSideBarSelectedParentChildIds({ parentId: id, childId: '' }))
        }
    }

    function handleChildClick(e: any) {
        const id = e.currentTarget.id
        dispatch(setSideBarSelectedChildId({ id: id }))
    }
}
export { SideMenuTemp }