import { useNavigate, } from "react-router-dom"
// import { VoucherIcon } from "../../../components/icons/voucher-icon"
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon"
import { Signal, useSignal } from "@preact/signals-react"
import { CheveronUpIcon } from "../../../components/icons/cheveron-up-icon"
import clsx from "clsx"
import { MenuItemType } from "./menu-items-type"

function TMenu({ menuData }: { menuData: MenuItemType[] }) {
    const navigate = useNavigate()
    const menuMeta: MenuMetaType = {
        isExpanded: useSignal(false),
        activeParentId: useSignal(''),
        selectedChildId: useSignal(''),
    }
    const childClass = 'mr-1 flex rounded-lg py-2 no-underline pl-9 hover:cursor-pointer hover:bg-slate-300 border-none focus:outline-none'
    const parentClass = 'mr-1 flex items-center gap-3 px-2 py-2 rounded-lg hover:cursor-pointer hover:bg-slate-300  border-none focus:outline-none'
    const rootClass = 'flex flex-col text-sm font-semibold prose text-black md:text-base'
    return (
        <div className={rootClass}>
            {getAllParentsWithChildren()}
        </div>
    )

    function getAllParentsWithChildren() {
        const items: any[] = menuData.map((item: ParentMenuItemType, index: number) => {
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
                <button id={item.id} onClick={handleOnClickParent} className={parentClass}><item.icon className='text-primary-400' /><span className="mr-auto">{item.title}</span><CheveronUpIcon className={getParentClass(item.id)} /> <CheveronDownIcon className={getParentOppositeClass(item.id)} /></button>
                {getChildren(item)}
            </div>
        )
    }

    function getChildren(item: ParentMenuItemType) {
        const children = item.children.map((child: ChildMenuItemType, index: number) => {
            return (
                <button key={index} id={child.id} onClick={(e:any)=>handleOnClickChild(e,child.path)} className={clsx(getSelectedChildClass(child.id), childClass)}>{child.title}</button>
            )
        })
        return (
            <div className={clsx(getParentClass(item.id), "flex flex-col gap-1")}>
                {children}
            </div>
        )
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

    function handleOnClickChild(e: any, path: string) {
        const id = e.currentTarget.id
        menuMeta.selectedChildId.value = id
        navigate(path)
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