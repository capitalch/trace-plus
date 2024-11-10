import { useContext, useEffect, useRef } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
import { useCompSyncfusionTreeGrid } from "./comp-syncfusion-tree-grid-hook"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { ColumnsDirective, ExcelExport, Filter, InfiniteScroll, Inject, Page, PdfExport, Resize, RowDD, RowDropSettingsModel, SearchSettingsModel, Sort, Toolbar, TreeGridComponent } from "@syncfusion/ej2-react-treegrid"

export function CompSyncfusionTreeGrid({
    addUniqueKeyToJson = false,
    // allowRowDragAndDrop = false,
    allowSorting = false,
    childMapping,
    className = '',
    columns,
    dataBound,
    gridDragAndDropSettings,
    height,
    instance,
    isLoadOnInit = true,
    minWidth = '1200px',
    // onRowDrop,
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
            context.CompSyncFusionTreeGrid[instance] = {
                expandedKeys: [],
                gridRef: undefined,
                isCollapsed: true,
                loadData: undefined,
                scrollPos: 0,
            }
        }
        context.CompSyncFusionTreeGrid[instance].loadData = loadData
        context.CompSyncFusionTreeGrid[instance].gridRef = gridRef
        // if(gridRef.current){
        //     const content = gridRef.current.grid.getContent()
        //     const scrollPos = content.scrollTop
        //     console.log(scrollPos)
        // }
        
        // return (() => {
        //     context.CompSyncFusionTreeGrid[instance].scrollPos = 300
            
        //     if (gridRef.current) {
        //         context.CompSyncFusionTreeGrid[instance].scrollPos = gridRef.current.getContent().children[0].scrollTop
        //     }
        // })
    }, [])

    // useEffect(() => {
    //     if (gridRef.current) {
    //         const content = gridRef.current.grid.getContent()
    //         setTimeout(() => {
    //             content.scrollTop = 400
    //             content.scrollLeft = 0
    //         }, 900);
    //     }
    // })

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
    const rowDropOptions: RowDropSettingsModel = { targetID: gridDragAndDropSettings?.targetId }

    return (
        //The div container is important. The minWidth works with style only
        <div className="mt-2" style={{ minWidth: `${minWidth}` }} id="grid2">
            <TreeGridComponent
                allowPdfExport={true}
                allowExcelExport={true}
                allowResizing={true}
                allowRowDragAndDrop={gridDragAndDropSettings?.allowRowDragAndDrop}
                allowSelection={true}
                allowSorting={allowSorting}
                allowTextWrap={true}
                childMapping={childMapping}
                className={className}
                // clipMode='Ellipsis'
                collapsed={onRowCollapsed}
                created={onCreated}
                dataSource={selectedData}
                // enablePersistence={true}
                enableCollapseAll={(isCollapsed === undefined) ? true : isCollapsed}
                expanded={onRowEpanded}
                gridLines="Both"
                height={height}
                id={instance}
                dataBound={onDataBound}
                pageSettings={{ pageSize: pageSize }}
                ref={gridRef}
                rowDataBound={onRowDataBound}
                rowDragStart={gridDragAndDropSettings?.onRowDragStart}
                rowDragStartHelper={gridDragAndDropSettings?.onRowDragStartHelper}
                rowDrop={gridDragAndDropSettings?.onRowDrop}
                rowDropSettings={rowDropOptions}
                rowHeight={rowHeight}
                searchSettings={searchOptions}
                treeColumnIndex={treeColumnIndex}
            >
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

    function onCreated() {
        const expandedKeys: string[] = context.CompSyncFusionTreeGrid[instance].expandedKeys || []
        if (expandedKeys.length > 0) {
            expandedKeys.forEach((key: string) => {
                if (gridRef?.current?.expandByKey) {
                    setTimeout(() => {
                        gridRef.current.expandByKey(key)
                    }, 500); // Delay between expansions. Otherwise error occurs
                }
            })
        }
    }

    function onDataBound(e: any) {
        if (dataBound) {
            dataBound(e)
        }
    }

    function onRowCollapsed(args: any) {
        let expandedKeys: string[] = context.CompSyncFusionTreeGrid[instance].expandedKeys || []
        expandedKeys = expandedKeys.filter((key: any) => key !== args.data.pkey);
        context.CompSyncFusionTreeGrid[instance].expandedKeys = [...expandedKeys]
    }

    function onRowDataBound(args: any) {
        // Check if the row is a child row by checking the 'parentId'
        if (args.data.level === 1) {
            args.row.style.backgroundColor = '#f5f5f5';  // Light grey background for child rows
        }
    }

    function onRowEpanded(args: any) {
        const expandedKeys = context.CompSyncFusionTreeGrid[instance].expandedKeys || []
        if (!args?.data?.pkey) {
            return
        }
        if (!expandedKeys.includes(args.data.pkey)) {
            expandedKeys.push(args.data.pkey)
        }
    }

}

type GridDragAndDropSettingsType = {
    allowRowDragAndDrop?: boolean
    onRowDragStart?: (args: any) => void
    onRowDragStartHelper?: (args: any) => void
    onRowDrop?: (args: any) => void
    targetId?: string
}

export type CompSyncfusionTreeGridType = {
    addUniqueKeyToJson?: boolean
    allowRowDragAndDrop?: boolean
    allowSorting?: boolean
    childMapping: string
    className?: string
    columns: SyncFusionTreeGridColumnType[]
    dataBound?: (args: any) => void
    gridDragAndDropSettings?: GridDragAndDropSettingsType
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
