export type NodeMenuItemType = {
    id: string
    title: string
    icon: any
    children: Array<ChildMenuItemType>
    path?: string
}

export type ChildMenuItemType = {
    id: string
    title: string
    path: string
}