import { FC, useContext, useEffect, useRef } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
import { useCompSyncfusionTreeGrid } from "./comp-syncfusion-tree-grid-hook"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { Aggregate, AggregateColumnsDirective, AggregateDirective, AggregatesDirective, ColumnsDirective, Edit, ExcelExport, Filter, InfiniteScroll, Inject, Page, PdfExport, Resize, RowDD, RowDropSettingsModel, SearchSettingsModel, Selection, Sort, Toolbar, TreeGridComponent } from "@syncfusion/ej2-react-treegrid"
import { GraphQLQueryArgsType } from "../../../app/graphql/maps/graphql-queries-map"
import { DocumentNode } from "graphql"
import { shallowEqual, useSelector } from "react-redux"
import { RootStateType } from "../../../app/store/store"
import { selectCompSwitchStateFn } from "../../redux-components/comp-slice"
import { Utils } from "../../../utils/utils"

export function CompSyncfusionTreeGrid({
    actionBegin,
    actionComplete,
    addUniqueKeyToJson = false,
    aggregates,
    allowSorting = false,
    buCode = undefined,
    cellEdit,
    cellSave,
    childMapping,
    className = '',
    columns,
    // dataBound,
    dataPath,
    dataSource,
    dbName,
    dbParams,
    editSettings,
    graphQlQueryFromMap,
    gridDragAndDropSettings,
    hasCheckBoxSelection = false,
    height,
    instance,
    isLoadOnInit = true,
    loadData,
    minWidth = '600px',
    pageSize = 50,
    queryCellInfo,
    rowDataBound,
    rowDeselected,
    rowHeight,
    rowSelecting,
    rowSelected,
    sqlArgs,
    sqlId,
    treeColumnIndex = 0
}: CompSyncfusionTreeGridType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const { getAggregateColumnDirectives, getColumnDirectives, loading, loadData: loadDataLocal, selectedData } = useCompSyncfusionTreeGrid({ addUniqueKeyToJson, aggregates, buCode, childMapping, columns, dataPath, dbName, dbParams, hasCheckBoxSelection, graphQlQueryFromMap, instance, isLoadOnInit, sqlId, sqlArgs, treeColumnIndex })
    const gridRef: any = useRef({})
    const isCollapsedRedux: boolean = !(useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance), shallowEqual) || false)

    useEffect(() => { // make them available globally
        if (!context.CompSyncFusionTreeGrid[instance]) {
            context.CompSyncFusionTreeGrid[instance] = {
                expandedKeys: new Set(),
                gridRef: undefined,
                loadData: undefined,
                scrollPos: 0,
            }
        }
        context.CompSyncFusionTreeGrid[instance].loadData = loadData || loadDataLocal
        context.CompSyncFusionTreeGrid[instance].gridRef = gridRef
        // Add scroll event listener to remember scrolled location
        const treeGridElement = gridRef?.current?.grid?.getContent() // (treegridRef.current as any).grid.element;
        if (treeGridElement) {
            const scrollableContainer = treeGridElement.querySelector('.e-content');
            scrollableContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (treeGridElement) {
                // const scrollableContainer = treeGridElement.querySelector('.e-content'); // Adjust selector if needed
                // context.CompSyncFusionTreeGrid[instance].scrollPos = scrollableContainer.scrollTop
                treeGridElement.removeEventListener('scroll', handleScroll);
            }
            // if (current) {
            //     const treegridElement = current?.grid?.getContent() // (treegridRef.current as any).grid.element;
            //     if (treegridElement) {
            //         treegridElement.removeEventListener('scroll', handleScroll);
            //     }
            // }
        };
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

    const rowDropOptions: RowDropSettingsModel = { targetID: gridDragAndDropSettings?.targetId }

    return (
        //The div container is important. The minWidth works with style only
        <div className="mt-2" style={{ minWidth: `${minWidth}` }} id="grid2">
            <TreeGridComponent
                actionBegin={actionBegin}
                actionComplete={actionComplete}
                allowPdfExport={true}
                allowExcelExport={true}
                allowResizing={true}
                allowRowDragAndDrop={gridDragAndDropSettings?.allowRowDragAndDrop}
                allowSelection={true}
                allowSorting={allowSorting}
                allowTextWrap={true}
                cellEdit={cellEdit}
                cellSave={cellSave}
                childMapping={childMapping}
                className={className}
                collapsed={onRowCollapsed}
                dataSource={dataSource || selectedData}
                editSettings={editSettings}
                enableCollapseAll={(isCollapsedRedux === undefined) ? true : isCollapsedRedux || false}
                enablePersistence={true}
                expanded={onRowExpanded}
                gridLines="Both"
                height={height}
                id={instance}
                pageSettings={{ pageSize: pageSize }}
                queryCellInfo={queryCellInfo}
                ref={gridRef}
                rowDataBound={onRowDataBound}
                rowDeselected={rowDeselected}
                rowDragStart={gridDragAndDropSettings?.onRowDragStart}
                rowDragStartHelper={gridDragAndDropSettings?.onRowDragStartHelper}
                rowDrop={gridDragAndDropSettings?.onRowDrop}
                rowDropSettings={rowDropOptions}
                rowHeight={rowHeight} // When rowheight is undefined then footer row height looks good, otherwise this becomes small
                rowSelecting={rowSelecting}
                rowSelected={rowSelected}
                searchSettings={searchOptions}
                treeColumnIndex={treeColumnIndex}>
                <ColumnsDirective>
                    {getColumnDirectives()}
                </ColumnsDirective>
                {aggregates && <AggregatesDirective>
                    <AggregateDirective showChildSummary={false}>
                        <AggregateColumnsDirective >
                            {getAggregateColumnDirectives()}
                        </AggregateColumnsDirective>
                    </AggregateDirective>
                </AggregatesDirective>}
                <Inject services={[
                    Aggregate
                    , ExcelExport
                    , Edit
                    , Filter // In treeGrid control Filter module is used in place of Search module. It works the same way
                    , InfiniteScroll
                    , Page
                    , PdfExport
                    , Resize
                    , RowDD
                    , Selection
                    , Sort
                    , Toolbar
                ]} />
            </TreeGridComponent>
        </div>
    )

    function handleScroll() {
        Utils.treeGridUtils.saveScrollPos(context, instance)
    }

    function onRowCollapsed(args: any) {
        const expandedKeys: Set<number> = context.CompSyncFusionTreeGrid[instance].expandedKeys || new Set()
        expandedKeys.delete(args.data.pkey)
    }

    function onRowDataBound(args: any) {
        // Check if the row is a child row by checking the 'parentId'
        if (args.data.level === 1) {
            args.row.style.backgroundColor = '#f5f5f5';  // Light grey background for child rows
        }
        const expandedKeys: Set<number> = context.CompSyncFusionTreeGrid[instance].expandedKeys || new Set()
        if (expandedKeys.has(args.data.pkey)) {
            setTimeout(() => gridRef.current.expandRow(args.row), 50)
        }
        if (rowDataBound) {
            rowDataBound(args)
        }
    }

    function onRowExpanded(args: any) {
        const expandedKeys: Set<number> = context.CompSyncFusionTreeGrid[instance].expandedKeys || new Set()
        if (!args?.data?.pkey) {
            return
        }
        expandedKeys.add(args.data.pkey)
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
    actionBegin?: (args: any) => void
    actionComplete?: (args: any) => void
    aggregates?: SyncFusionTreeGridAggregateColumnType[]
    addUniqueKeyToJson?: boolean
    allowRowDragAndDrop?: boolean
    allowSorting?: boolean
    buCode?: string
    cellEdit?: (args: any) => void
    cellSave?: (args: any) => void
    childMapping: string
    className?: string
    columns: SyncFusionTreeGridColumnType[]
    dataPath?: string
    dataSource?: any
    // dataBound?: (args: any) => void
    dbName?: string
    dbParams?: { [key: string]: string | undefined }
    editSettings?: {
        allowEditing: boolean
        mode: 'Dialog' | 'Row' | 'Cell'
    }
    graphQlQueryFromMap?: (
        dbName: string,
        val: GraphQLQueryArgsType
    ) => DocumentNode,
    gridDragAndDropSettings?: GridDragAndDropSettingsType
    hasCheckBoxSelection?: boolean
    height?: string
    instance: string
    isLoadOnInit?: boolean
    loadData?: () => void
    minWidth?: string
    pageSize?: number
    onRowDrop?: (args: any) => void
    queryCellInfo?: (args: any) => void
    rowDataBound?: (args: any) => void
    rowDeselected?: (args: any) => void
    rowHeight?: number
    rowSelecting?: (args: any) => void
    rowSelected?: (args: any) => void
    sqlArgs?: SqlArgsType
    sqlId?: string
    treeColumnIndex: number
}

export type SyncFusionTreeGridColumnType = {
    allowEditing?: boolean
    customAttributes?: {
        [key: string]: string
    }
    edit?: {
        [key: string]: {
            [key: string]: any
        }
    }
    editTemplate?: any // (args: any) => void
    editType?: 'datepickeredit' | 'textedit' | 'numericedit'
    field: string
    format?: string
    headerTemplate?: any
    headerText?: string
    isPrimaryKey?: boolean
    key?: string
    template?: any
    textAlign?: 'Center' | 'Justify' | 'Left' | 'Right'
    type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime'
    validationRules?: { [key: string]: any }
    visible?: boolean
    width?: number
}

export type SyncFusionTreeGridAggregateColumnType = {
    columnName: string
    customAggregate?: (data: any) => any
    field: string
    type?: 'Average' | 'Count' | 'Sum' | 'Min' | 'Max' | 'Custom'
    footerTemplate?: FC<any>
    format?: 'N2' | 'N0'
}

export type SqlArgsType = {
    [key: string]: string | number | null
}
