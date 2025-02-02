import { GlobalContextType } from "../app/global-context"

export const treeGridUtils: TreeGridUtilsType = {

    resetScrollPos(context: GlobalContextType, instance: string) {
        context.CompSyncFusionTreeGrid[instance].scrollPos = 0
    },

    restoreScrollPos(context: GlobalContextType, instance: string) {
        const gridRef: any = context?.CompSyncFusionTreeGrid?.[instance]?.gridRef
        const treeGridElement = gridRef?.current?.grid?.getContent();
        if (treeGridElement) {
            const scrollableContainer = treeGridElement.querySelector('.e-content');
            setTimeout(() => (scrollableContainer.scrollTop = context.CompSyncFusionTreeGrid[instance].scrollPos), 500)
        }
    },

    saveScrollPos(context: GlobalContextType, instance: string) {
        const gridRef: any = context?.CompSyncFusionTreeGrid?.[instance]?.gridRef
        const treeGridElement = gridRef?.current?.grid?.getContent();
        if (treeGridElement) {
            const scrollableContainer = treeGridElement.querySelector('.e-content'); // Adjust selector if needed
            context.CompSyncFusionTreeGrid[instance].scrollPos = scrollableContainer.scrollTop
        }
    }
}

export type TreeGridUtilsType = {
    resetScrollPos: (context: GlobalContextType, instance: string) => void
    restoreScrollPos: (context: GlobalContextType, instance: string) => void
    saveScrollPos: (context: GlobalContextType, instance: string) => void
}