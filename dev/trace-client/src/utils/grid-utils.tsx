import { GlobalContextType } from "../app/global-context"

export const gridUtils: GridUtilsType = {

    resetScrollPos(context: GlobalContextType, instance: string) {
        context.CompSyncFusionTreeGrid[instance].scrollPos = 0
    },

    restoreScrollPos(context: GlobalContextType, instance: string) {
        const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        const treeGridElement = gridRef?.current?.grid?.getContent();
        if (treeGridElement) {
            const scrollableContainer = treeGridElement.querySelector('.e-content');
            scrollableContainer.scrollTop = context.CompSyncFusionTreeGrid[instance].scrollPos
        }
    },
    
    saveScrollPos(context: GlobalContextType, instance: string) {
        const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        const treeGridElement = gridRef?.current?.grid?.getContent();
        if (treeGridElement) {
            const scrollableContainer = treeGridElement.querySelector('.e-content'); // Adjust selector if needed
            context.CompSyncFusionTreeGrid[instance].scrollPos = scrollableContainer.scrollTop
        }
    }
}

export type GridUtilsType = {
    resetScrollPos: (context: GlobalContextType, instance: string) => void
    restoreScrollPos: (context: GlobalContextType, instance: string) => void
    saveScrollPos: (context: GlobalContextType, instance: string) => void
}