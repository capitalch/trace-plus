import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon"
import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import { MenuItemType, menuItemSelectorFn, setSideBarSelectedChildId, setSideBarSelectedParentChildIds, sideBarSelectedChildIdFn, sideBarSelectedParentIdFn } from "../layouts-slice"
import { AppDispatchType } from "../../../app/store/store"
import { CheveronUpIcon } from "../../../components/icons/cheveron-up-icon"
import { ChildMenuItemType, MasterMenuData, MenuDataItemType } from "../menus/master-menu-data"

function SideMenu() {
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const sideBarSelectedParentIdSelector = useSelector(sideBarSelectedParentIdFn)
    const sideBarSelectedChildIdSelector = useSelector(sideBarSelectedChildIdFn)
    const dispatch: AppDispatchType = useDispatch()

    const menuData = MasterMenuData[menuItemSelector]

    const rootClass = "prose mx-0.5 mt-0.5 flex flex-col text-sm text-black md:text-base"
    const parentClass = "flex h-10 px-2 border-b-[1px] items-center gap-3 rounded-md  font-bold hover:bg-primary-50 focus:outline-none"
    const childClass = "flex h-10 w-full border-b-[1px]  items-center rounded-md  pl-9 hover:bg-primary-100 focus:outline-none "
    const transitionClass = 'flex flex-col gap-1 transform-gpu origin-top transition-all duration-300 ease-out'

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
                    // getParentExpandedClass(item.id)
                    className={clsx(parentClass,)}>
                    <item.icon className={item.iconColorClass} /><span className="mr-auto">{item.label}</span><CheveronUpIcon className={clsx(getArrowUpClass(item.id), getHiddenClassWhenNochildren(item))} /> <CheveronDownIcon className={clsx(getArrowDownClass(item.id), getHiddenClassWhenNochildren(item))} />
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

    // function getParentSelectedClassWhenNoChildren(item: any){
    //     let ret = 'bg-primary-50'
    //     if(item.children && (item.children.length > 0)){
    //         ret = ''
    //     }
    //     return(ret)
    // }

    function getSelectedChildClass(childId: string) {
        return ((sideBarSelectedChildIdSelector === childId) ? 'bg-primary-100' : 'bg-slate-50')
    }

    function handleParentClick(item: MenuDataItemType) {
        const id = item.id
        if (id === sideBarSelectedParentIdSelector) {
            dispatch(setSideBarSelectedParentChildIds({ parentId: '', childId: '' }))
        } else {
            dispatch(setSideBarSelectedParentChildIds({ parentId: id, childId: '' }))
        }
    }

    function handleChildClick(e: any, path?: string) {
        console.log(path)
        const id = e.currentTarget.id
        dispatch(setSideBarSelectedChildId({ id: id }))
    }
}
export { SideMenu }