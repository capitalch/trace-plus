export type NodeMenuItemType = {
    id: string
    title: string
    icon: any
    children: Array<ChildMenuItemType>
}

export type ChildMenuItemType = {
    id: string
    title: string
    path: string
}