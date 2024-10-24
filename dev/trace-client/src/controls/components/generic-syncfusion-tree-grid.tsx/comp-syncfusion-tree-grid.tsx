import { useContext, useEffect, useRef } from "react"
import { GlobalContextType } from "../../../app/global-context"
import { GlobalContext } from "../../../App"
import { useCompSyncfusionTreeGrid } from "./comp-syncfusion-tree-grid-hook"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { Aggregate, ColumnsDirective, ExcelExport,Filter, InfiniteScroll, Inject, Page, PdfExport, Resize, SearchSettings, SearchSettingsModel, Sort, Toolbar, TreeGridComponent } from "@syncfusion/ej2-react-treegrid"

export function CompSyncfusionTreeGrid({
    allowPaging = false,
    allowSorting = false,
    childMapping,
    className = '',
    columns,
    instance,
    isCollapsedAllByDefault = true,
    isLoadOnInit = true,
    pageSize = 50,
    rowHeight = 20,
    sqlArgs,
    sqlId,
    treeColumnIndex = 0
}: CompSyncfusionTreeGridType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const { getColumnDirectives, loading, loadData, selectedData } = useCompSyncfusionTreeGrid({ childMapping, columns, instance, isLoadOnInit, sqlId, sqlArgs, treeColumnIndex })
    const gridRef: any = useRef({})

    useEffect(() => { // make them available globally
        if (!context.CompSyncFusionTreeGrid[instance]) {
            context.CompSyncFusionTreeGrid[instance] = { loadData: undefined, gridRef: undefined }
        }
        context.CompSyncFusionTreeGrid[instance].loadData = loadData
        context.CompSyncFusionTreeGrid[instance].gridRef = gridRef
        return (() => {
            console.log('Syncfusion cleanup')
        })
    }, [])

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    const searchOptions: SearchSettingsModel = {
        // ignoreAccent: true,
        ignoreCase: true,
        operator: 'contains',
        hierarchyMode: 'Both'
    }

    return (
        //The div container is important. The minWidth works with style only
        <div className="mt-2" style={{ minWidth: '1200px', height: '100%' }}>
            <TreeGridComponent
                allowPdfExport={true}
                allowExcelExport={true}
                allowPaging={allowPaging}
                allowResizing={true}
                
                allowSelection={true}
                allowSorting={allowSorting}
                allowTextWrap={true}
                childMapping={childMapping}
                className={className}
                clipMode="EllipsisWithTooltip"
                dataSource={selectedData || []}
                enablePersistence={false}
                enableCollapseAll={isCollapsedAllByDefault}
                gridLines="Both"
                height='100%'
                pageSettings={{ pageSize: pageSize }}
                ref={gridRef}
                rowHeight={rowHeight}
                searchSettings={searchOptions}
                treeColumnIndex={treeColumnIndex}>
                <ColumnsDirective>
                    {getColumnDirectives()}
                </ColumnsDirective>
                {/* <AggregatesDirective>
                    <AggregateDirective>
                        <AggregateColumnsDirective>
                            {getAggrColDirectives()}
                        </AggregateColumnsDirective>
                    </AggregateDirective>
                </AggregatesDirective> */}
                <Inject services={[
                    Aggregate
                    , ExcelExport
                    , Filter // In treeGrid control Filter module is used in place of Search module. It works the same way
                    , InfiniteScroll
                    , Page
                    , PdfExport
                    , Resize
                    , Sort
                    , Toolbar
                ]} />

            </TreeGridComponent>
        </div>
    )
}

export type CompSyncfusionTreeGridType = {
    allowPaging?: boolean
    allowSorting?: boolean
    childMapping: string
    className?: string
    columns: SyncFusionTreeGridColumnType[]
    instance: string
    isCollapsedAllByDefault?: boolean
    isLoadOnInit?: boolean
    pageSize?: number
    rowHeight?: number
    sqlArgs: SqlArgsType
    sqlId: string
    treeColumnIndex: number
}

export type SyncFusionTreeGridColumnType = {
    field: string
    format?: string
    headerText: string
    template?: any
    textAlign?: 'Center' | 'Justify' | 'Left' | 'Right'
    type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime'
    width?: number
}

export type SqlArgsType = {
    [key: string]: string | number
}