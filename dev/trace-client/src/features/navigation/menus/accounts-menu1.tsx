import { useNavigate, } from "react-router-dom"
import { VoucherIcon } from "../../../components/icons/voucher-icon"
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon"
import { Signal, useSignal } from "@preact/signals-react"
import { CheveronUpIcon } from "../../../components/icons/cheveron-up-icon"
import clsx from "clsx"
// import { TMenu } from "./tmenu"

function AccountsMenu() {
    const navigate = useNavigate()
    const menuMeta: MenuMetaType = {
        isExpanded: useSignal(false),
        activeParentId: useSignal(''),
        selectedChildId: useSignal(''),
    }
    const childClass = 'mr-1 flex rounded-lg py-2 no-underline pl-9 hover:cursor-pointer hover:bg-slate-300 border-none focus:outline-none'
    const parentClass = 'mr-1 flex items-center gap-3 px-2 py-2 rounded-lg hover:cursor-pointer hover:bg-slate-300  border-none focus:outline-none'
    return (
        <div className="flex flex-col text-sm font-semibold prose text-black md:text-base">
            <button id='1' onClick={handleOnClickParent} className={parentClass}><VoucherIcon /><span className="mr-auto">Vouchers</span><CheveronUpIcon className={getParentClass('1')} /> <CheveronDownIcon className={getParentOppositeClass('1')} /></button>
            <div className={clsx(getParentClass('1'), "flex flex-col gap-1")}>
                <button id='11' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('11'), childClass,)}>Journals</button>
                <button id='12' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('12'), childClass)}>Payments</button>
                <button id='13' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('13'), childClass)}>Receipts</button>
                <button id='14' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('14'), childClass)}>Contra</button>
            </div>

            <button id='2' onClick={handleOnClickParent} className={parentClass}><VoucherIcon /><span className="mr-auto">Purch / sales</span><CheveronUpIcon className={getParentClass('2')} /> <CheveronDownIcon className={getParentOppositeClass('2')} /></button>
            <div className={clsx(getParentClass('2'), "flex flex-col gap-1")}>
                <button id='21' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('21'), childClass)}>Purchases</button>
                <button id='22' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('22'), childClass)}>Purchase returns</button>
                <button id='23' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('23'), childClass)}>Sales</button>
                <button id='24' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('24'), childClass)}>Sales returns</button>
                <button id='25' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('25'), childClass)}>Debit notes</button>
                <button id='26' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('26'), childClass)}>Credit notes</button>
            </div>

            <button id='3' onClick={handleOnClickParent} className={parentClass}><VoucherIcon /><span className="mr-auto">Masters</span><CheveronUpIcon className={getParentClass('3')} /> <CheveronDownIcon className={getParentOppositeClass('3')} /></button>
            <div className={clsx(getParentClass('3'), "flex flex-col gap-1")}>
                <button id='31' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('31'), childClass)}>Purchases</button>
                <button id='32' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('32'), childClass)}>Company info</button>
                <button id='33' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('33'), childClass)}>General settings</button>
                <button id='34' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('34'), childClass)}>Accounts</button>
                <button id='35' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('35'), childClass)}>Opening balances</button>
            </div>
            {/* <TMenu /> */}
        </div>
    )

    function getParentClass(id: string) {
        let cls = 'hidden'
        if (id === menuMeta.activeParentId.value) {
            if (menuMeta.isExpanded.value) {
                cls = 'block'
            }
        }
        return (cls)
    }

    function getParentOppositeClass(id: string) {
        let cls = getParentClass(id)
        if (cls === 'block') {
            cls = 'hidden'
        } else {
            cls = 'block'
        }
        return (cls)
    }

    function getSelectedChildClass(id: string) {
        let aClass = ''
        if (id === menuMeta.selectedChildId.value) {
            aClass = 'bg-slate-300'
        }
        return (aClass)
    }

    function handleOnClickChild(e: any) {
        const id = e.currentTarget.id
        menuMeta.selectedChildId.value = id
        navigate('purchase')
    }

    function handleOnClickParent(e: any) {
        const id = e.currentTarget.id
        if (id === menuMeta.activeParentId.value) {
            menuMeta.isExpanded.value = !menuMeta.isExpanded.value
        } else {
            menuMeta.activeParentId.value = id
            menuMeta.isExpanded.value = true
        }
    }

}
export { AccountsMenu }

type MenuMetaType = {
    isExpanded: Signal<boolean>
    activeParentId: Signal<string>
    selectedChildId: Signal<string>
}