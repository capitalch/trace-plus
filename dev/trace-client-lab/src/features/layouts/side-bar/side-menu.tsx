import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import { MenuItemType, menuItemSelectorFn, setIsSideBarOpen, setSideBarSelectedChildId, setSideBarSelectedParentChildIds, sideBarSelectedChildIdFn, sideBarSelectedParentIdFn } from "../layouts-slice"
import { AppDispatchType } from "../../../app/store"
import { ChildMenuItemType, MasterMenuData, MenuDataItemType } from "../master-menu-data"
import { useNavigate } from "react-router-dom"
import { IconCheveronUp } from "../../../controls/icons/icon-cheveron-up"
import { IconCheveronDown } from "../../../controls/icons/icon-cheveron-down"
import { useMediaQuery } from "react-responsive"

function SideMenu() {
    const navigate = useNavigate()
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const sideBarSelectedParentIdSelector = useSelector(sideBarSelectedParentIdFn)
    const sideBarSelectedChildIdSelector = useSelector(sideBarSelectedChildIdFn)
    const dispatch: AppDispatchType = useDispatch()
    const isXLScreen = useMediaQuery({ query: '(min-width: 1280px)' })

    const menuData = MasterMenuData[menuItemSelector]
    const rootClass = "flex flex-col p-2"
    const parentClass = "flex h-11 items-center gap-3 px-3 rounded-lg hover:bg-neutral-100 focus:outline-none transition-colors group font-semibold text-base whitespace-nowrap"
    const childClass = "flex h-10 w-full items-center pl-11 rounded-lg hover:bg-neutral-100 focus:outline-none transition-colors text-base whitespace-nowrap"
    const transitionClass = 'flex flex-col gap-0.5 transition-all duration-200 ease-out mt-1'

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
            <div className="flex flex-col mb-1">
                <button
                    id={item.id}
                    onClick={() => handleParentClick(item)}
                    className={clsx(
                        parentClass,
                        getParentSelectedClass(item)
                    )}
                >
                    <item.icon className={clsx(item.iconColorClass, "h-5 w-5 flex-shrink-0")} />
                    <span className="mr-auto text-neutral-800 group-hover:text-neutral-900">
                        {item.label}
                    </span>
                    {item.children.length > 0 && (
                        <>
                            <IconCheveronUp className={clsx(getArrowUpClass(item.id), "h-4 w-4 text-neutral-400")} />
                            <IconCheveronDown className={clsx(getArrowDownClass(item.id), "h-4 w-4 text-neutral-400")} />
                        </>
                    )}
                </button>
                {getChildren(item)}
            </div>
        )
    }

    function getChildren(item: MenuDataItemType) {
        const children = item.children.map((child: ChildMenuItemType, index: number) => {
            return (
                <button
                    key={index}
                    id={child.id}
                    onClick={(e: any) => handleChildClick(e, child.label, child.path)}
                    className={clsx(
                        childClass,
                        getSelectedChildClass(child.id),
                        "text-neutral-700 hover:text-neutral-900"
                    )}
                >
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

    function getParentExpandedClass(parentId: string) {
        return (sideBarSelectedParentIdSelector === parentId) ? 'block' : 'hidden'
    }

    function getParentSelectedClass(item: any) {
        if (item.id === sideBarSelectedParentIdSelector) {
            return 'bg-primary-50 text-primary-700'
        }
        return ''
    }

    function getSelectedChildClass(childId: string) {
        if (sideBarSelectedChildIdSelector === childId) {
            return 'bg-primary-50 text-primary-700 font-medium'
        }
        return ''
    }

    function handleParentClick(item: MenuDataItemType) {
        const id = item.id
        if (id === sideBarSelectedParentIdSelector) {
            dispatch(setSideBarSelectedParentChildIds({ parentId: '', childId: '' }))
        } else {
            dispatch(setSideBarSelectedParentChildIds({ parentId: id, childId: '' }))
        }
        if (item.path) {
            navigate(item.path)
            // Auto-collapse sidebar on small/medium screens when navigating
            if (!isXLScreen) {
                dispatch(setIsSideBarOpen({ isSideBarOpen: false }))
            }
        }
    }

    function handleChildClick(e: any, _label: string, path?: string) {
        const id = e.currentTarget.id
        dispatch(setSideBarSelectedChildId({ id: id }))
        if (path) {
            navigate(path)
            // Auto-collapse sidebar on small/medium screens when navigating
            if (!isXLScreen) {
                dispatch(setIsSideBarOpen({ isSideBarOpen: false }))
            }
        }
    }
}
export { SideMenu }