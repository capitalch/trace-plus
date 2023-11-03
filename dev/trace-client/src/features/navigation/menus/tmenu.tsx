import { useNavigate, } from "react-router-dom"
import { VoucherIcon } from "../../../components/icons/voucher-icon"
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon"
import { Signal, useSignal } from "@preact/signals-react"
import { CheveronUpIcon } from "../../../components/icons/cheveron-up-icon"
import clsx from "clsx"

function TMenu() {
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
            {getAllParentsWithChildren()}
        </div>
    )

    function getAllParentsWithChildren() {
        const items: any[] = menuItems.map((item: ParentMenuItemType, index: number) => {
            return (
                <div key={index} className="flex flex-col">
                    {getParentWithChildren(item)}
                </div>
            )
        })
        return (items)
    }

    function getParentWithChildren(item: ParentMenuItemType) {
        return (
            <div className="flex flex-col">
                <button id={item.id} onClick={handleOnClickParent} className={parentClass}><VoucherIcon /><span className="mr-auto">{item.title}</span><CheveronUpIcon className={getParentClass(item.id)} /> <CheveronDownIcon className={getParentOppositeClass(item.id)} /></button>
                {getChildren(item.children)}
            </div>
        )
    }

    function getChildren(menuItemschildren: ChildMenuItemType[]) {
        const children = menuItemschildren.map((child: ChildMenuItemType, index: number) => {
            return (
                <button key={index} id={child.id} onClick={handleOnClickChild} className={clsx(getSelectedChildClass(child.id), childClass)}>{child.title}</button>
            )
        })
        return (children)
    }

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
export { TMenu }

type MenuMetaType = {
    isExpanded: Signal<boolean>
    activeParentId: Signal<string>
    selectedChildId: Signal<string>
}

const menuItems: ParentMenuItemType[] = [
    {
        id: '1',
        title: 'Vouchers',
        icon: <VoucherIcon />,
        children: [
            {
                id: '11',
                title: 'Journals',
                path: 'purchase'
            },
            {
                id: '12',
                title: 'Payments',
                path: 'purchase'
            }
        ]
    },
    {
        id: '2',
        title: 'Purch / Sales',
        icon: <VoucherIcon />,
        children: [
            {
                id: '21',
                title: 'Purchase',
                path: 'purchase'
            },
            {
                id: '22',
                title: 'Sales',
                path: 'purchase'
            }
        ]
    }
]

type ParentMenuItemType = {
    id: string
    title: string
    icon: any
    children: Array<ChildMenuItemType>
}

type ChildMenuItemType = {
    id: string
    title: string
    path: string
}