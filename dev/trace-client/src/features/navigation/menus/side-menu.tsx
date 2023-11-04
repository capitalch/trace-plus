import { useNavigate, } from "react-router-dom"
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon"
import { Signal, useSignal } from "@preact/signals-react"
import { CheveronUpIcon } from "../../../components/icons/cheveron-up-icon"
import clsx from "clsx"
import { ChildMenuItemType, NodeMenuItemType } from "./menu-items-type"

function SideMenu({ menuData }: { menuData: NodeMenuItemType[] }) {
    const navigate = useNavigate()
    const menuMeta: MenuMetaType = {
        isExpanded: useSignal(false),
        activeNodeId: useSignal(''),
        selectedChildId: useSignal(''),
    }
    const childClass = 'mr-1 flex rounded-lg py-2 no-underline pl-9 hover:cursor-pointer hover:bg-slate-300 border-none focus:outline-none'
    const nodeClass = 'mr-1 flex items-center gap-3 px-2 py-2 rounded-lg hover:cursor-pointer hover:bg-slate-300  border-none focus:outline-none'
    const rootClass = 'flex flex-col text-sm font-semibold prose text-black md:text-base'
    return (
        <div className={rootClass}>
            {getAllNodessWithChildren()}
        </div>
    )

    function getAllNodessWithChildren() {
        const items: any[] = menuData.map((item: NodeMenuItemType, index: number) => {
            return (
                <div key={index} className="flex flex-col">
                    {getNodeWithChildren(item)}
                </div>
            )
        })
        return (items)
    }

    function getNodeWithChildren(item: NodeMenuItemType) {
        return (
            <div className="flex flex-col">
                <button id={item.id} onClick={handleOnClickNode} className={nodeClass}><item.icon className='text-primary-400' /><span className="mr-auto">{item.title}</span><CheveronUpIcon className={getNodeClass(item.id)} /> <CheveronDownIcon className={getNodeOppositeClass(item.id)} /></button>
                {getChildren(item)}
            </div>
        )
    }

    function getChildren(item: NodeMenuItemType) {
        const children = item.children.map((child: ChildMenuItemType, index: number) => {
            return (
                <button key={index} id={child.id} onClick={(e:any)=>handleOnClickChild(e,child.path)} className={clsx(getSelectedChildClass(child.id), childClass)}>{child.title}</button>
            )
        })
        return (
            <div className={clsx(getNodeClass(item.id), "flex flex-col gap-1")}>
                {children}
            </div>
        )
    }

    function getNodeClass(id: string) {
        let cls = 'hidden'
        if (id === menuMeta.activeNodeId.value) {
            if (menuMeta.isExpanded.value) {
                cls = 'block'
            }
        }
        return (cls)
    }

    function getNodeOppositeClass(id: string) {
        let cls = getNodeClass(id)
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

    function handleOnClickNode(e: any) {
        const id = e.currentTarget.id
        if (id === menuMeta.activeNodeId.value) {
            menuMeta.isExpanded.value = !menuMeta.isExpanded.value
        } else {
            menuMeta.activeNodeId.value = id
            menuMeta.isExpanded.value = true
        }
    }

}
export { SideMenu }

type MenuMetaType = {
    isExpanded: Signal<boolean>
    activeNodeId: Signal<string>
    selectedChildId: Signal<string>
}