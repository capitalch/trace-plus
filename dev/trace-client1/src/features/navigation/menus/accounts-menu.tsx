// This file is not used. This is only for visualization and testing purpose
import { useNavigate, } from "react-router-dom"
import { VoucherIcon } from "../../../components/icons/voucher-icon"
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon"
import { Signal, useSignal } from "@preact/signals-react"
import { CheveronUpIcon } from "../../../components/icons/cheveron-up-icon"
import clsx from "clsx"

function AccountsMenu() {
    const navigate = useNavigate()
    const menuMeta: MenuMetaType = {
        isExpanded: useSignal(false),
        activeNodeId: useSignal(''),
        selectedChildId: useSignal(''),
    }
    const childClass = 'mr-1 flex rounded-lg py-2 no-underline pl-9 hover:cursor-pointer hover:bg-slate-300 border-none focus:outline-none'
    const nodeClass = 'mr-1 mb-1 flex items-center gap-3 px-2 py-2 rounded-lg hover:cursor-pointer hover:bg-slate-300  border-none focus:outline-none'
    const transitionClass = 'flex flex-col gap-1 transform-gpu origin-top transition-all duration-300 ease-out'
    
    return (
        <div className="flex flex-col text-sm font-semibold prose text-black md:text-base">
            <div className="flex flex-col">
                <button id='1' onClick={handleOnClickParent} className={nodeClass}><VoucherIcon /><span className="mr-auto">Vouchers</span><CheveronUpIcon className={getArrowUpClass('1')} /> <CheveronDownIcon className={getArrowDownClass('1')} /></button>
                <div className={clsx(getParentVisibleClass('1'), transitionClass)}>
                    <button id='11' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('11'), childClass,)}>Journals</button>
                    <button id='12' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('12'), childClass)}>Payments</button>
                    <button id='13' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('13'), childClass)}>Receipts</button>
                    <button id='14' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('14'), childClass)}>Contra</button>
                </div>
            </div>

            <div className="flex flex-col">
                <button id='2' onClick={handleOnClickParent} className={nodeClass}><VoucherIcon /><span className="mr-auto">Purch / sales</span><CheveronUpIcon className={getArrowUpClass('2')} /> <CheveronDownIcon className={getArrowDownClass('2')} /></button>
                <div className={clsx(getParentVisibleClass('2'),transitionClass)}>
                    <button id='21' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('21'), childClass)}>Purchases</button>
                    <button id='22' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('22'), childClass)}>Purchase returns</button>
                    <button id='23' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('23'), childClass)}>Sales</button>
                    <button id='24' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('24'), childClass)}>Sales returns</button>
                    <button id='25' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('25'), childClass)}>Debit notes</button>
                    <button id='26' onClick={handleOnClickChild} className={clsx(getSelectedChildClass('26'), childClass)}>Credit notes</button>
                </div>
            </div>

        </div>
    )

    function getArrowUpClass(id: string) {
        let cls = 'hidden'
        if (id === menuMeta.activeNodeId.value) {
            if (menuMeta.isExpanded.value) {
                cls = 'block'
            }
        }
        return (cls)
    }

    function getArrowDownClass(id: string) {
        let cls = getArrowUpClass(id)
        if (cls === 'block') {
            cls = 'hidden'
        } else {
            cls = 'block'
        }
        return (cls)
    }

    function getParentVisibleClass(id: string) {
        let cls = 'scale-y-0 h-0'
        if (id === menuMeta.activeNodeId.value) {
            if (menuMeta.isExpanded.value) {
                cls = 'scale-y-1 h-auto'
            }
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
        if (id === menuMeta.activeNodeId.value) {
            menuMeta.isExpanded.value = !menuMeta.isExpanded.value
        } else {
            menuMeta.activeNodeId.value = id
            menuMeta.isExpanded.value = true
        }
    }
}
export { AccountsMenu }

type MenuMetaType = {
    isExpanded: Signal<boolean>
    activeNodeId: Signal<string>
    selectedChildId: Signal<string>
}