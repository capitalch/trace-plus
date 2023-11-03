export type MenuItemType = {
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