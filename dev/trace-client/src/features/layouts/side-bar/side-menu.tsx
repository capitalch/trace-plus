import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import { MenuItemType, menuItemSelectorFn, setSideBarSelectedChildIdR, setSideBarSelectedParentChildIdsR, sideBarSelectedChildIdFn, sideBarSelectedParentIdFn } from "../layouts-slice"
import { AppDispatchType } from "../../../app/store/store"
import { ChildMenuItemType, MasterMenuData, MenuDataItemType } from "../master-menu-data"
import { useNavigate } from "react-router-dom"
import { IconCheveronUp } from "../../../controls/icons/icon-cheveron-up"
import { IconCheveronDown } from "../../../controls/icons/icon-cheveron-down"

function SideMenu() {
    const navigate = useNavigate()
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const sideBarSelectedParentIdSelector = useSelector(sideBarSelectedParentIdFn)
    const sideBarSelectedChildIdSelector = useSelector(sideBarSelectedChildIdFn)
    const dispatch: AppDispatchType = useDispatch()

    const menuData = MasterMenuData[menuItemSelector]
    const rootClass = "prose mx-0.5 mt-0.5 flex flex-col text-sm text-black md:text-base"
    const parentClass = "flex h-10 items-center gap-3 rounded-md border-b-[1px] px-2 hover:font-bold focus:outline-none text-primary-500"
    const childClass = "flex h-10 w-full items-center rounded-md border-b-[1px] pl-9 hover:font-bold focus:outline-none text-primary-400"
    const transitionClass = 'flex origin-top transform-gpu flex-col gap-1 transition-all duration-300 ease-out'

    return (
        <div className={rootClass}>
            {getAllParentsWithChildren()}
        </div>)

    function getAllParentsWithChildren() {
        const items: any[] = menuData.map((item: MenuDataItemType, index: number) => {
            return (
                <div key={index} className="flex flex-col">
                    {getParentWithChildren(item)}
                </div>
            )
        })
        return (items)
    }

    function getParentWithChildren(item: MenuDataItemType) {
        return (
            <div className="flex flex-col">
                <button id={item.id} onClick={() => handleParentClick(item)}
                    className={clsx(parentClass, getParentSelectedClass(item))}>
                    <item.icon className={item.iconColorClass} /><span className="mr-auto">{item.label}</span><IconCheveronUp className={clsx(getArrowUpClass(item.id), getHiddenClassWhenNochildren(item))} /> <IconCheveronDown className={clsx(getArrowDownClass(item.id), getHiddenClassWhenNochildren(item))} />
                </button>
                {getChildren(item)}
            </div>
        )
    }

    function getChildren(item: MenuDataItemType) {
        const children = item.children.map((child: ChildMenuItemType, index: number) => {
            return (
                <button key={index} id={child.id} onClick={(e: any) => handleChildClick(e, child.path)}
                    className={clsx(childClass, getSelectedChildClass(child.id))}>
                    {child.label}
                </button>
            )
        })
        return (
            <div className={clsx(getParentExpandedClass(item.id), transitionClass)}>
                {children}
            </div>
        )
    }

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

    function getHiddenClassWhenNochildren(item: any) {
        let ret: string = 'hidden'
        if (item.children && (item.children.length > 0)) {
            ret = 'block'
        }
        return (ret)
    }

    function getParentExpandedClass(parentId: string) {
        return (
            (sideBarSelectedParentIdSelector === parentId) ? 'block' : 'hidden'
        )
    }

    function getParentSelectedClass(item: any) {
        let ret = ''
        // if((!item.children || (item.children.length === 0)) && (item.id === sideBarSelectedParentIdSelector)){
        //     // ret = 'bg-primary-50'
        //     ret = 'font-semibold'
        // }
        if (item.id === sideBarSelectedParentIdSelector) {
            ret = 'font-bold'
        }
        return (ret)
    }

    function getSelectedChildClass(childId: string) {
        // return ((sideBarSelectedChildIdSelector === childId) ? 'bg-primary-100' : 'bg-slate-50')
        return ((sideBarSelectedChildIdSelector === childId) ? 'font-bold' : '')
    }

    function handleParentClick(item: MenuDataItemType) {
        const id = item.id
        if (id === sideBarSelectedParentIdSelector) {
            dispatch(setSideBarSelectedParentChildIdsR({ parentId: '', childId: '' }))
        } else {
            dispatch(setSideBarSelectedParentChildIdsR({ parentId: id, childId: '' }))
        }
        if (item.path) {
            navigate(item.path)
        }
    }

    function handleChildClick(e: any, path?: string) {
        const id = e.currentTarget.id
        dispatch(setSideBarSelectedChildIdR({ id: id }))
        if (path) {
            navigate(path)
        }
    }
}
export { SideMenu }