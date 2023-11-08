import { useNavigate, } from "react-router-dom"
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon"
import { Signal, useSignal } from "@preact/signals-react"
import { CheveronUpIcon } from "../../../components/icons/cheveron-up-icon"
import clsx from "clsx"
import { ChildMenuItemType, NodeMenuItemType } from "./menu-items-type"
import _ from "lodash"

function SideMenu({ menuData }: { menuData: NodeMenuItemType[] }) {
    const navigate = useNavigate()
    const menuMeta: MenuMetaType = {
        isExpanded: useSignal(false),
        activeNodeId: useSignal(''),
        selectedChildId: useSignal(''),
        selectedNodeId: useSignal(''),
    }
    const childClass = clsx('bg-lime-50 mr-1 flex rounded-lg py-2 pl-9 hover:cursor-pointer hover:bg-slate-300 border-none focus:outline-none',)
    const nodeClass = 'mr-1 mb-1 flex items-center gap-3 px-2 py-2 rounded-lg hover:cursor-pointer hover:bg-slate-300  border-none focus:outline-none'
    const rootClass = 'flex flex-col  font-semibold text-xs text-black md:text-sm'
    const transitionClass = 'flex flex-col gap-1 transform-gpu origin-top transition-all duration-300 ease-out'
    return (
        <div className={clsx(rootClass, '')}>
            {getAllNodesWithChildren()}
        </div>
    )

    function getAllNodesWithChildren() {
        const items: any[] = menuData.map((item: NodeMenuItemType, index: number) => {
            return (
                <div key={index} className="flex flex-col bg">
                    {getNodeWithChildren(item)}
                </div>
            )
        })
        return (items)
    }

    function getNodeWithChildren(item: NodeMenuItemType) {
        return (
            <div className="flex flex-col">
                <button id={item.id} onClick={() => handleOnClickNode(item)} className={nodeClass}><item.icon className='text-primary-400' /><span className="mr-auto">{item.title}</span><CheveronUpIcon className={getArrowUpClass(item)} /> <CheveronDownIcon className={getArrowDownClass(item)} /></button>
                {getChildren(item)}
            </div>
        )
    }

    function getChildren(item: NodeMenuItemType) {
        const children = item.children.map((child: ChildMenuItemType, index: number) => {
            return (
                <button key={index} id={child.id} onClick={(e: any) => handleOnClickChild(e, child.path)} className={clsx(childClass, getSelectedChildClass(child.id),)}>{child.title}</button>
            )
        })
        return (
            <div className={clsx(getNodeVisibleClass(item.id), transitionClass)}>
                {children}
            </div>
        )
    }

    function getArrowUpClass(item: NodeMenuItemType) {
        let cls = 'hidden'
        if (_.isEmpty(item.children)) {
            return (cls)
        }
        if (item.id === menuMeta.activeNodeId.value) {
            if (menuMeta.isExpanded.value) {
                cls = 'block'
            }
        }
        return (cls)
    }

    function getArrowDownClass(item: NodeMenuItemType) {
        if (_.isEmpty(item.children)) {
            return ('hidden')
        }
        let cls = getArrowUpClass(item)
        if (cls === 'block') {
            cls = 'hidden'
        } else {
            cls = 'block'
        }
        return (cls)
    }

    function getNodeVisibleClass(id: string) {
        // let cls = 'hidden'
        let cls = 'scale-y-0 h-0'
        if (id === menuMeta.activeNodeId.value) {
            if (menuMeta.isExpanded.value) {
                // cls = 'block'
                cls = 'scale-y-1 h-auto'
            }
        }
        return (cls)
    }

    function getSelectedChildClass(id: string) {
        let aClass = ''
        if (id === menuMeta.selectedChildId.value) {
            aClass = '!bg-slate-300'
        }
        return (aClass)
    }

    // function getSelectedNodeClass(id: string){
    //     let aClass = ''
    //     if (id === menuMeta.selectedNodeId.value) {
    //         aClass = '!bg-slate-300'
    //     }
    //     return (aClass)
    // }

    function handleOnClickChild(e: any, path: string) {
        const id = e.currentTarget.id
        menuMeta.selectedChildId.value = id
        navigate(path)
    }

    function handleOnClickNode(item: NodeMenuItemType) {
        // const id = e.currentTarget.id
        if (_.isEmpty(item.children)) {
            menuMeta.selectedChildId.value = ''
            menuMeta.activeNodeId.value = item.id
            menuMeta.selectedNodeId.value = item.id
            if (item.path) {
                navigate(item.path)
            }
        } else {
            const id = item.id
            menuMeta.selectedNodeId.value = ''
            if (id === menuMeta.activeNodeId.value) {
                menuMeta.isExpanded.value = !menuMeta.isExpanded.value
            } else {
                menuMeta.activeNodeId.value = id
                menuMeta.isExpanded.value = true
            }
        }

    }

}
export { SideMenu }

type MenuMetaType = {
    isExpanded: Signal<boolean>
    activeNodeId: Signal<string>
    selectedChildId: Signal<string>
    selectedNodeId: Signal<string>
}