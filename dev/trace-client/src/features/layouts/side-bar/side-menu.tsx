import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import { MenuItemType, menuItemSelectorFn, setIsSideBarOpen, setSideBarSelectedChildId, setSideBarSelectedParentChildIds, sideBarSelectedChildIdFn, sideBarSelectedParentIdFn } from "../layouts-slice"
import { AppDispatchType } from "../../../app/store"
import { ChildMenuItemType, MenuDataItemType } from "../master-menu-data"
import { useNavigate } from "react-router-dom"
import { IconCheveronUp } from "../../../controls/icons/icon-cheveron-up"
import { IconCheveronDown } from "../../../controls/icons/icon-cheveron-down"
import { useMediaQuery } from "react-responsive"
import { useFilteredMenu } from "../use-filtered-menu"

function SideMenu() {
    const navigate = useNavigate()
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const sideBarSelectedParentIdSelector = useSelector(sideBarSelectedParentIdFn)
    const sideBarSelectedChildIdSelector = useSelector(sideBarSelectedChildIdFn)
    const dispatch: AppDispatchType = useDispatch()
    const isXLScreen = useMediaQuery({ query: '(min-width: 1280px)' })

    const menuData = useFilteredMenu(menuItemSelector)
    const rootClass = "flex flex-col p-2"
    const parentClass = "flex h-11 items-center gap-3 px-3 rounded-lg focus:outline-none transition-all duration-300 group font-semibold text-base whitespace-nowrap shadow-sm"
    const childClass = "flex h-10 w-full items-center pl-11 rounded-lg focus:outline-none transition-all duration-200 text-base whitespace-nowrap border-l-2 border-transparent"
    const transitionClass = 'flex flex-col gap-0.5 transition-all duration-300 ease-out mt-1'

    // Empty state for accounts menu with no permissions
    if (menuData.length === 0 && menuItemSelector === 'accounts') {
        return (
            <div className="p-4 text-center text-neutral-500">
                <p>No menu items available.</p>
                <p className="text-sm">Contact your administrator.</p>
            </div>
        )
    }

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
                        getParentSelectedClass(item),
                        getParentHoverClass(item)
                    )}
                >
                    <div className={clsx("p-1.5 rounded-lg transition-all duration-300", getIconBgClass(item))}>
                        <item.icon className={clsx(item.iconColorClass, "h-5 w-5 flex-shrink-0")} />
                    </div>
                    <span className="mr-auto text-neutral-800 group-hover:text-neutral-900 transition-colors">
                        {item.label}
                    </span>
                    {item.children.length > 0 && (
                        <>
                            <IconCheveronUp className={clsx(getArrowUpClass(item.id), "h-4 w-4 text-neutral-500 transition-colors")} />
                            <IconCheveronDown className={clsx(getArrowDownClass(item.id), "h-4 w-4 text-neutral-500 transition-colors")} />
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
                        getSelectedChildClass(child.id, item),
                        getChildHoverClass(item),
                        "text-neutral-700"
                    )}
                >
                    <span className="transition-colors">{child.label}</span>
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
            return getGradientClass(item.id)
        }
        return 'bg-white hover:bg-gradient-to-r'
    }

    function getSelectedChildClass(childId: string, item: MenuDataItemType) {
        if (sideBarSelectedChildIdSelector === childId) {
            return `${getChildBorderColor(item.id)} bg-gradient-to-r ${getChildGradientClass(item.id)} font-medium`
        }
        return ''
    }

    function getGradientClass(itemId: string) {
        const gradients: any = {
            '1': 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 text-blue-700 border border-blue-200',
            '2': 'bg-gradient-to-r from-purple-50 via-purple-100 to-pink-50 text-purple-700 border border-purple-200',
            '3': 'bg-gradient-to-r from-red-50 via-rose-100 to-pink-50 text-red-700 border border-red-200',
            '4': 'bg-gradient-to-r from-orange-50 via-amber-100 to-yellow-50 text-orange-700 border border-orange-200',
            '5': 'bg-gradient-to-r from-amber-50 via-yellow-100 to-lime-50 text-amber-700 border border-amber-200',
            '6': 'bg-gradient-to-r from-yellow-50 via-lime-100 to-green-50 text-yellow-700 border border-yellow-200',
            '7': 'bg-gradient-to-r from-teal-50 via-emerald-100 to-green-50 text-teal-700 border border-teal-200',
            '8': 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 text-blue-700 border border-blue-200',
            '9': 'bg-gradient-to-r from-teal-50 via-emerald-100 to-green-50 text-teal-700 border border-teal-200',
            '10': 'bg-gradient-to-r from-red-50 via-rose-100 to-pink-50 text-red-700 border border-red-200',
            '11': 'bg-gradient-to-r from-amber-50 via-yellow-100 to-lime-50 text-amber-700 border border-amber-200',
            '12': 'bg-gradient-to-r from-purple-50 via-purple-100 to-pink-50 text-purple-700 border border-purple-200',
            '13': 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 text-blue-700 border border-blue-200',
            '14': 'bg-gradient-to-r from-teal-50 via-emerald-100 to-green-50 text-teal-700 border border-teal-200',
            '15': 'bg-gradient-to-r from-amber-50 via-yellow-100 to-lime-50 text-amber-700 border border-amber-200',
            '16': 'bg-gradient-to-r from-red-50 via-rose-100 to-pink-50 text-red-700 border border-red-200',
            '17': 'bg-gradient-to-r from-red-50 via-rose-100 to-pink-50 text-red-700 border border-red-200',
            '18': 'bg-gradient-to-r from-green-50 via-emerald-100 to-teal-50 text-green-700 border border-green-200',
        }
        return gradients[itemId] || 'bg-primary-50 text-primary-700'
    }

    function getParentHoverClass(item: MenuDataItemType) {
        const hoverClasses: any = {
            '1': 'hover:from-blue-100 hover:via-blue-150 hover:to-indigo-100',
            '2': 'hover:from-purple-100 hover:via-purple-150 hover:to-pink-100',
            '3': 'hover:from-red-100 hover:via-rose-150 hover:to-pink-100',
            '4': 'hover:from-orange-100 hover:via-amber-150 hover:to-yellow-100',
            '5': 'hover:from-amber-100 hover:via-yellow-150 hover:to-lime-100',
            '6': 'hover:from-yellow-100 hover:via-lime-150 hover:to-green-100',
            '7': 'hover:from-teal-100 hover:via-emerald-150 hover:to-green-100',
            '8': 'hover:from-blue-100 hover:via-blue-150 hover:to-indigo-100',
            '9': 'hover:from-teal-100 hover:via-emerald-150 hover:to-green-100',
            '10': 'hover:from-red-100 hover:via-rose-150 hover:to-pink-100',
            '11': 'hover:from-amber-100 hover:via-yellow-150 hover:to-lime-100',
            '12': 'hover:from-purple-100 hover:via-purple-150 hover:to-pink-100',
            '13': 'hover:from-blue-100 hover:via-blue-150 hover:to-indigo-100',
            '14': 'hover:from-teal-100 hover:via-emerald-150 hover:to-green-100',
            '15': 'hover:from-amber-100 hover:via-yellow-150 hover:to-lime-100',
            '16': 'hover:from-red-100 hover:via-rose-150 hover:to-pink-100',
            '17': 'hover:from-red-100 hover:via-rose-150 hover:to-pink-100',
            '18': 'hover:from-green-100 hover:via-emerald-150 hover:to-teal-100',
        }
        return hoverClasses[item.id] || 'hover:bg-neutral-100'
    }

    function getIconBgClass(item: MenuDataItemType) {
        const bgClasses: any = {
            '1': 'bg-blue-100 group-hover:bg-blue-200',
            '2': 'bg-purple-100 group-hover:bg-purple-200',
            '3': 'bg-red-100 group-hover:bg-red-200',
            '4': 'bg-orange-100 group-hover:bg-orange-200',
            '5': 'bg-amber-100 group-hover:bg-amber-200',
            '6': 'bg-yellow-100 group-hover:bg-yellow-200',
            '7': 'bg-teal-100 group-hover:bg-teal-200',
            '8': 'bg-blue-100 group-hover:bg-blue-200',
            '9': 'bg-teal-100 group-hover:bg-teal-200',
            '10': 'bg-red-100 group-hover:bg-red-200',
            '11': 'bg-amber-100 group-hover:bg-amber-200',
            '12': 'bg-purple-100 group-hover:bg-purple-200',
            '13': 'bg-blue-100 group-hover:bg-blue-200',
            '14': 'bg-teal-100 group-hover:bg-teal-200',
            '15': 'bg-amber-100 group-hover:bg-amber-200',
            '16': 'bg-red-100 group-hover:bg-red-200',
            '17': 'bg-red-100 group-hover:bg-red-200',
            '18': 'bg-green-100 group-hover:bg-green-200',
        }
        return bgClasses[item.id] || 'bg-neutral-100'
    }

    function getChildBorderColor(parentId: string) {
        const borderColors: any = {
            '1': 'border-l-blue-500',
            '2': 'border-l-purple-500',
            '3': 'border-l-red-500',
            '4': 'border-l-orange-500',
            '5': 'border-l-amber-500',
            '6': 'border-l-yellow-500',
            '7': 'border-l-teal-500',
            '8': 'border-l-blue-500',
            '9': 'border-l-teal-500',
            '10': 'border-l-red-500',
            '11': 'border-l-amber-500',
            '12': 'border-l-purple-500',
            '13': 'border-l-blue-500',
            '14': 'border-l-teal-500',
            '15': 'border-l-amber-500',
            '16': 'border-l-red-500',
            '17': 'border-l-red-500',
            '18': 'border-l-green-500',
        }
        return borderColors[parentId] || 'border-l-primary-500'
    }

    function getChildGradientClass(parentId: string) {
        const gradients: any = {
            '1': 'from-blue-50 to-blue-100 text-blue-700',
            '2': 'from-purple-50 to-purple-100 text-purple-700',
            '3': 'from-red-50 to-rose-100 text-red-700',
            '4': 'from-orange-50 to-amber-100 text-orange-700',
            '5': 'from-amber-50 to-yellow-100 text-amber-700',
            '6': 'from-yellow-50 to-lime-100 text-yellow-700',
            '7': 'from-teal-50 to-emerald-100 text-teal-700',
            '8': 'from-blue-50 to-blue-100 text-blue-700',
            '9': 'from-teal-50 to-emerald-100 text-teal-700',
            '10': 'from-red-50 to-rose-100 text-red-700',
            '11': 'from-amber-50 to-yellow-100 text-amber-700',
            '12': 'from-purple-50 to-purple-100 text-purple-700',
            '13': 'from-blue-50 to-blue-100 text-blue-700',
            '14': 'from-teal-50 to-emerald-100 text-teal-700',
            '15': 'from-amber-50 to-yellow-100 text-amber-700',
            '16': 'from-red-50 to-rose-100 text-red-700',
            '17': 'from-red-50 to-rose-100 text-red-700',
            '18': 'from-green-50 to-emerald-100 text-green-700',
        }
        return gradients[parentId] || 'from-primary-50 to-primary-100'
    }

    function getChildHoverClass(item: MenuDataItemType) {
        const hoverClasses: any = {
            '1': 'hover:bg-blue-50 hover:border-l-blue-600 hover:text-blue-800',
            '2': 'hover:bg-purple-50 hover:border-l-purple-600 hover:text-purple-800',
            '3': 'hover:bg-red-50 hover:border-l-red-600 hover:text-red-800',
            '4': 'hover:bg-orange-50 hover:border-l-orange-600 hover:text-orange-800',
            '5': 'hover:bg-amber-50 hover:border-l-amber-600 hover:text-amber-800',
            '6': 'hover:bg-yellow-50 hover:border-l-yellow-600 hover:text-yellow-800',
            '7': 'hover:bg-teal-50 hover:border-l-teal-600 hover:text-teal-800',
            '8': 'hover:bg-blue-50 hover:border-l-blue-600 hover:text-blue-800',
            '9': 'hover:bg-teal-50 hover:border-l-teal-600 hover:text-teal-800',
            '10': 'hover:bg-red-50 hover:border-l-red-600 hover:text-red-800',
            '11': 'hover:bg-amber-50 hover:border-l-amber-600 hover:text-amber-800',
            '12': 'hover:bg-purple-50 hover:border-l-purple-600 hover:text-purple-800',
            '13': 'hover:bg-blue-50 hover:border-l-blue-600 hover:text-blue-800',
            '14': 'hover:bg-teal-50 hover:border-l-teal-600 hover:text-teal-800',
            '15': 'hover:bg-amber-50 hover:border-l-amber-600 hover:text-amber-800',
            '16': 'hover:bg-red-50 hover:border-l-red-600 hover:text-red-800',
            '17': 'hover:bg-red-50 hover:border-l-red-600 hover:text-red-800',
            '18': 'hover:bg-green-50 hover:border-l-green-600 hover:text-green-800',
        }
        return hoverClasses[item.id] || 'hover:bg-neutral-100'
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