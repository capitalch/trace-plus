import { useContext, useEffect, useRef } from "react"
// import _ from 'lodash'
import { GlobalContextType } from "../../../app/global-context"
import { GlobalContext } from "../../../App"
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
    const meta: any = useRef({
        scrollTop: 0,
        row: undefined
    })
    useEffect(() => { // make them available globally
        if (!context.CompSyncFusionTreeGrid[instance]) {
            context.CompSyncFusionTreeGrid[instance] = { loadData: undefined, gridRef: undefined, isCollapsed: true }
        }
        context.CompSyncFusionTreeGrid[instance].loadData = loadData
        context.CompSyncFusionTreeGrid[instance].gridRef = gridRef
        // const gridElement = gridRef.current.element.querySelector('.e-content');
        // gridRef.current.expandAll()
        // Add scroll event listener
        // if (gridElement) {
        //     gridElement.addEventListener('scroll', handleScroll);
        // }

        return (() => {
            // if (gridElement) {
            //     gridElement.removeEventListener('scroll', handleScroll);
            // }
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
                clipMode="EllipsisWithTooltip"
                collapsed={onCollapsed}
                dataSource={selectedData}
                enablePersistence={true}
                enableCollapseAll={(isCollapsed === undefined) ? true : isCollapsed}
                expanded={onxpanded}
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

    function onxpanded(e: any) {
        console.log(e)
        meta.current.row = e.row
    }

    function onCollapsed(e: any) {
        console.log(e)
    }

    // function handleScroll(e:any){
    //     const scrollTop = e.target.scrollTop; // Vertical scroll 
    //     meta.current.scrollTop = scrollTop
    // }

    // function onRowDrop(e: any) {
    //     e.cancel =true
    //     const content = gridRef.current.getContent()
    //     // const scrolltop = content.scrollTop
    //     const scrollTop1 = gridRef.current.element.querySelector('.e-content').scrollTop;
    //     meta.current.scrollTop = scrollTop1
    //     if(gridDragAndDropSettings?.onRowDrop) {
    //         gridDragAndDropSettings.onRowDrop(e)
    //     } 
    // }

    function onDataBound(e: any) {

        if (gridRef?.current && meta.current?.row) {
            // gridRef.current.expandAll()
        }
        // if(gridRef.current?.element) {
        //     gridRef.current.element.querySelector('.e-content').scrollTop = meta.current.scrollTop
        // }
    }

    function onRowDataBound(args: any) {
        // console.log(args)
        // Check if the row is a child row by checking the 'parentId'
        if (args.data.level === 1) {
            // Apply background color to child rows
            args.row.style.backgroundColor = '#f5f5f5';  // Light grey background for child rows
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
