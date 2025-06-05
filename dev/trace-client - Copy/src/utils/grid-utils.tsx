import { GlobalContextType } from "../app/global-context"

export const gridUtils: GridUtilsType = {

    resetScrollPos(context: GlobalContextType, instance: string) {
        context.CompSyncFusionGrid[instance].scrollPos = 0
    },

    restoreScrollPos(context: GlobalContextType, instance: string) {
        const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
        const gridElement = gridRef?.current?.grid?.getContent();
        if (gridElement) {
            const scrollableContainer = gridElement.querySelector('.e-content');
            scrollableContainer.scrollTop = context.CompSyncFusionGrid[instance].scrollPos
        }
    },
    
    saveScrollPos(context: GlobalContextType, instance: string) {
        const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
        const gridElement = gridRef?.current?.grid?.getContent();
        if (gridElement) {
            const scrollableContainer = gridElement.querySelector('.e-content'); // Adjust selector if needed
            if(scrollableContainer.scrollTop > 0){
                context.CompSyncFusionGrid[instance].scrollPos = scrollableContainer.scrollTop
            }
        }
    }
}

export type GridUtilsType = {
    resetScrollPos: (context: GlobalContextType, instance: string) => void
    restoreScrollPos: (context: GlobalContextType, instance: string) => void
    saveScrollPos: (context: GlobalContextType, instance: string) => void
}