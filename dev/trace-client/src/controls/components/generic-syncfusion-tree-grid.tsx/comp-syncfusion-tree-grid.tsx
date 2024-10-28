import { useContext, useEffect, useRef } from "react"
// import _ from 'lodash'
import { GlobalContextType } from "../../../app/global-context"
import { GlobalContext } from "../../../App"
import { useCompSyncfusionTreeGrid } from "./comp-syncfusion-tree-grid-hook"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { ColumnsDirective, ExcelExport, Filter, InfiniteScroll, Inject, Page, PdfExport, Resize, RowDD, SearchSettingsModel, Sort, Toolbar, TreeGridComponent } from "@syncfusion/ej2-react-treegrid"

export function CompSyncfusionTreeGrid({
    addUniqueKeyToJson = false,
    // allowPaging = false,
    allowRowDragAndDrop = false,
    allowSorting = false,
    childMapping,
    className = '',
    columns,
    height,
    instance,
    // isCollapsedAllByDefault = true,
    isLoadOnInit = true,
    minWidth ='1200px',
    onRowDrop,
    pageSize = 50,
    rowHeight = 20,
    sqlArgs,
    sqlId,
    treeColumnIndex = 0
}: CompSyncfusionTreeGridType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const { getColumnDirectives, loading, loadData, selectedData } = useCompSyncfusionTreeGrid({ addUniqueKeyToJson, childMapping, columns, instance, isLoadOnInit, sqlId, sqlArgs, treeColumnIndex })
    const gridRef: any = useRef({})

    useEffect(() => { // make them available globally
        if (!context.CompSyncFusionTreeGrid[instance]) {
            context.CompSyncFusionTreeGrid[instance] = { loadData: undefined, gridRef: undefined, isCollapsed: true }
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
    const isCollapsed = context.CompSyncFusionTreeGrid[instance]?.isCollapsed
    return (
        //The div container is important. The minWidth works with style only
        <div className="mt-2" style={{minWidth:`${minWidth}`}}>
            <TreeGridComponent
                allowPdfExport={true}
                allowExcelExport={true}
                // allowPaging={allowPaging}
                allowResizing={true}
                allowRowDragAndDrop={allowRowDragAndDrop}
                allowSelection={true}
                allowSorting={allowSorting}
                allowTextWrap={true}
                childMapping={childMapping}
                className={className}
                clipMode="EllipsisWithTooltip"
                dataSource={selectedData}
                enablePersistence={false}
                enableCollapseAll={(isCollapsed === undefined) ? true : isCollapsed}
                gridLines="Both"
                height={height}
                pageSettings={{ pageSize: pageSize }}
                ref={gridRef}
                rowDrop={onRowDrop}
                rowHeight={rowHeight}
                searchSettings={searchOptions}
                treeColumnIndex={treeColumnIndex}
                >
                <ColumnsDirective>
                    {getColumnDirectives()}
                    {/* {addUniqueKeyToJson && <ColumnDirective field="key" isPrimaryKey={true} visible={false} />} */}
                </ColumnsDirective>
                {/* <AggregatesDirective>
                    <AggregateDirective>
                        <AggregateColumnsDirective>
                            {getAggrColDirectives()}
                        </AggregateColumnsDirective>
                    </AggregateDirective>
                </AggregatesDirective> */}
                <Inject services={[
                    // Aggregate,
                    ExcelExport
                    , Filter // In treeGrid control Filter module is used in place of Search module. It works the same way
                    , InfiniteScroll
                    , Page
                    , PdfExport
                    , Resize
                    , RowDD
                    , Sort
                    , Toolbar
                ]} />

            </TreeGridComponent>
        </div>
    )
}

export type CompSyncfusionTreeGridType = {
    addUniqueKeyToJson?: boolean
    allowRowDragAndDrop?: boolean
    allowSorting?: boolean
    childMapping: string
    className?: string
    columns: SyncFusionTreeGridColumnType[]
    height?: string
    instance: string
    isLoadOnInit?: boolean
    minWidth?: string
    pageSize?: number
    onRowDrop?: (args: any) => void
    rowHeight?: number
    sqlArgs: SqlArgsType
    sqlId: string
    treeColumnIndex: number
}

export type SyncFusionTreeGridColumnType = {
    field: string
    format?: string
    headerText?: string
    isPrimaryKey?: boolean
    key?: string
    template?: any
    textAlign?: 'Center' | 'Justify' | 'Left' | 'Right'
    type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime'
    visible?: boolean
    width?: number
}

export type SqlArgsType = {
    [key: string]: string | number
}
