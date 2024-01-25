export type NodeMenuItemType = {
    id: string
    label: string
    icon: any
    children: Array<ChildMenuItemType>
    path?: string
}

export type ChildMenuItemType = {
    id: string
    label: string
    path: string
}