import { FC, useContext, useEffect, useRef } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
import { useCompSyncfusionTreeGrid } from "./comp-syncfusion-tree-grid-hook"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { Aggregate, AggregateColumnsDirective, AggregateDirective, AggregatesDirective, ColumnsDirective, Edit, ExcelExport, Filter, InfiniteScroll, Inject, Page, PdfExport, Resize, RowDD, RowDropSettingsModel, SearchSettingsModel, Sort, Toolbar, TreeGridComponent } from "@syncfusion/ej2-react-treegrid"
import { GraphQLQueryArgsType } from "../../../app/graphql/maps/graphql-queries-map"
import { DocumentNode } from "graphql"
import { shallowEqual, useSelector } from "react-redux"
import { RootStateType } from "../../../app/store/store"
import { selectCompSwitchStateFn } from "../../redux-components/comp-slice"

export function CompSyncfusionTreeGrid({
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
    dataBound,
    dataPath,
    dataSource,
    dbName,
    dbParams,
    editSettings,
    graphQlQueryFromMap,
    gridDragAndDropSettings,
    height,
    instance,
    isLoadOnInit = true,
    loadData,
    minWidth = '600px',
    pageSize = 50,
    queryCellInfo,
    rowHeight,
    sqlArgs,
    sqlId,
    treeColumnIndex = 0
}: CompSyncfusionTreeGridType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const { getAggregateColumnDirectives, getColumnDirectives, loading, loadData: loadDataLocal, selectedData } = useCompSyncfusionTreeGrid({ addUniqueKeyToJson, aggregates, buCode, childMapping, columns, dataPath, dbName, dbParams, graphQlQueryFromMap, instance, isLoadOnInit, sqlId, sqlArgs, treeColumnIndex })
    const gridRef: any = useRef({})
    const isCollapsedRedux: boolean = !(useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance), shallowEqual) || false)

    useEffect(() => { // make them available globally
        if (!context.CompSyncFusionTreeGrid[instance]) {
            context.CompSyncFusionTreeGrid[instance] = {
                expandedKeys: new Set(),
                gridRef: undefined,
                // isCollapsed: true,
                loadData: undefined,
                scrollPos: 0,
            }
        }
        context.CompSyncFusionTreeGrid[instance].loadData = loadData || loadDataLocal
        context.CompSyncFusionTreeGrid[instance].gridRef = gridRef
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
    // const isCollapsed = context.CompSyncFusionTreeGrid[instance]?.isCollapsed
    const rowDropOptions: RowDropSettingsModel = { targetID: gridDragAndDropSettings?.targetId }

    return (
        //The div container is important. The minWidth works with style only
        <div className="mt-2" style={{ minWidth: `${minWidth}` }} id="grid2">
            <TreeGridComponent
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
                created={onCreated}
                dataSource={dataSource || selectedData}
                editSettings={editSettings}
                enableCollapseAll={(isCollapsedRedux === undefined) ? true : isCollapsedRedux || false}
                enablePersistence={true}
                expanded={onRowExpanded}
                gridLines="Both"
                height={height}
                id={instance}
                dataBound={onDataBound}
                pageSettings={{ pageSize: pageSize }}
                queryCellInfo={queryCellInfo}
                ref={gridRef}
                rowDataBound={onRowDataBound}
                rowDragStart={gridDragAndDropSettings?.onRowDragStart}
                rowDragStartHelper={gridDragAndDropSettings?.onRowDragStartHelper}
                rowDrop={gridDragAndDropSettings?.onRowDrop}
                rowDropSettings={rowDropOptions}
                rowHeight={rowHeight} // When rowheight is undefined then footer row height looks good, otherwise this becomes small
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
                    , Sort
                    , Toolbar
                ]} />
            </TreeGridComponent>
        </div>
    )

    function onCreated() {
        // const expandedKeys: Set<number> = context.CompSyncFusionTreeGrid[instance].expandedKeys || new Set()
        // if (expandedKeys.size > 0) {
        //     expandedKeys.forEach((key: number) => {
        //         if (gridRef?.current?.expandByKey) {
        //             setTimeout(() => {
        //                 gridRef.current.expandByKey(key)
        //             }, 500); // Delay between expansions. Otherwise error occurs
        //         }
        //     })
        // }
    }

    function onDataBound(e: any) {
        if (dataBound) {
            dataBound(e)
        }
    }

    function onRowCollapsed(args: any) {
        const expandedKeys: Set<number> = context.CompSyncFusionTreeGrid[instance].expandedKeys || new Set()
        expandedKeys.delete(args.data.pkey)
        // expandedKeys = expandedKeys.filter((key: any) => key !== args.data.pkey);
        // context.CompSyncFusionTreeGrid[instance].expandedKeys = [...expandedKeys]
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
    }

    function onRowExpanded(args: any) {
        const expandedKeys: Set<number> = context.CompSyncFusionTreeGrid[instance].expandedKeys || new Set()
        if (!args?.data?.pkey) {
            return
        }
        expandedKeys.add(args.data.pkey)
        // if (!expandedKeys.includes(args.data.pkey)) {
        //     expandedKeys.push(args.data.pkey)
        // }
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
    dataBound?: (args: any) => void
    dbName?: string
    dbParams?: { [key: string]: string | undefined }
    editSettings?: {
        allowEditing: boolean
        mode: 'Dialog' | 'Row' | 'Cell'
        // showConfirmDialog: boolean
    }
    // enableCollapseAll?: boolean
    graphQlQueryFromMap?: (
        dbName: string,
        val: GraphQLQueryArgsType
    ) => DocumentNode,
    gridDragAndDropSettings?: GridDragAndDropSettingsType
    height?: string
    instance: string
    isLoadOnInit?: boolean
    loadData?: () => void
    minWidth?: string
    pageSize?: number
    onRowDrop?: (args: any) => void
    queryCellInfo?: (args: any) => void
    rowHeight?: number
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
    editTemplate?: any
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
