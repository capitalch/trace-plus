import { Aggregate, AggregatesDirective, ColumnsDirective, Selection, ExcelExport, GridComponent, InfiniteScroll, Inject, PdfExport, Resize, Search, Sort, Toolbar, AggregateDirective, AggregateColumnsDirective, SearchSettingsModel, RowDD, RowDataBoundEventArgs, Edit } from "@syncfusion/ej2-react-grids"
import { FC, useContext, useEffect, useRef } from "react"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { useCompSyncFusionGrid } from "./comp-syncfusion-grid-hook"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
import { RootStateType } from "../../../app/store/store"
import { Utils } from "../../../utils/utils"
import { GraphQLQueryArgsType } from "../../../app/graphql/maps/graphql-queries-map"
import { useSelector } from "react-redux"
import { isSideBarOpenSelectorFn } from "../../../features/layouts/layouts-slice"

export function CompSyncFusionGrid({
    aggregates,
    className = '',
    columns,
    dataSource,
    editSettings,
    gridDragAndDropSettings,
    hasCheckBoxSelection = false,
    hasIndexColumn = false,
    height,
    isLoadOnInit = true,
    instance,
    loadData,
    minWidth = '1200px',
    onCellEdit,
    onDelete = undefined,
    onEdit = undefined,
    onPreview = undefined,
    onRowDataBound,
    rowHeight,
    sqlArgs = {},
    sqlId
}: CompSyncFusionGridType) {
    const context: GlobalContextType = useContext(GlobalContext)
    const { getAggrColDirectives, getColumnDirectives, loading, loadData: loadDataLocal, selectedData } = useCompSyncFusionGrid({ aggregates, columns, instance, hasCheckBoxSelection, hasIndexColumn, isLoadOnInit, onDelete, onEdit, onPreview, sqlId, sqlArgs, })
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    const maxWidth = isSideBarOpenSelector ? 'calc(100vw - 240px - 12px)' : 'calc(100vw - 62px)'
    const gridRef: any = useRef({})

    useEffect(() => { // make them available globally
        if (!context.CompSyncFusionGrid[instance]) {
            context.CompSyncFusionGrid[instance] = {
                gridRef: undefined,
                loadData: undefined,
            }
        }
        context.CompSyncFusionGrid[instance].loadData = loadData || loadDataLocal
        context.CompSyncFusionGrid[instance].gridRef = gridRef
        return (() => {
            console.log('Syncfusion cleanup')
        })
    }, [])

    if (loading) {
        return (<WidgetLoadingIndicator />)
    }

    const searchOptions: SearchSettingsModel = {
        ignoreAccent: true,
        ignoreCase: true,
        operator: 'contains'
    }

    return (
        <GridComponent style={{ maxWidth: maxWidth, minWidth: minWidth }}
            allowRowDragAndDrop={gridDragAndDropSettings?.allowRowDragAndDrop}
            allowPdfExport={true}
            allowExcelExport={true}
            allowResizing={true}
            allowSorting={true}
            allowSelection={true}
            allowTextWrap={true}
            // beginEdit={handleBeginEdit}
            cellEdit={onCellEdit}
            // beforeExcelExport={handleBeforeExcelExport}
            className={className}
            created={onCreated}
            dataSource={dataSource || selectedData || []}
            editSettings={editSettings}
            enablePersistence={false}
            // excelQueryCellInfo={handleExcelQueryCellInfo}
            // excelAggregateQueryCellInfo={handleExcelQueryCellInfo}
            gridLines="Both"
            height={height}
            id={instance}
            // beforePdfExport={handleBeforePdfExport}
            // pdfQueryCellInfo={handlePdfQueryCellInfo}
            ref={gridRef}
            rowDataBound={onRowDataBound}
            rowDragStart={gridDragAndDropSettings?.onRowDragStart}
            rowDragStartHelper={gridDragAndDropSettings?.onRowDragStartHelper}
            rowDrop={gridDragAndDropSettings?.onRowDrop}
            rowDropSettings={{
                targetID: gridDragAndDropSettings?.targetId || undefined,
            }}
            rowHeight={rowHeight}
            searchSettings={searchOptions}
            selectionSettings={{ type: gridDragAndDropSettings?.selectionType || 'Single', }}
        >
            <ColumnsDirective>
                {getColumnDirectives()}
            </ColumnsDirective>
            {aggregates && <AggregatesDirective>
                <AggregateDirective>
                    <AggregateColumnsDirective>
                        {getAggrColDirectives()}
                    </AggregateColumnsDirective>
                </AggregateDirective>
            </AggregatesDirective>}
            <Inject services={[
                Aggregate
                , Edit
                , ExcelExport
                , InfiniteScroll
                , PdfExport
                , Resize
                , RowDD
                , Search
                , Selection
                , Sort
                , Toolbar
            ]} />
        </GridComponent>
    )

    // function handleBeginEdit(args: any){
    //     console.log(args)
    // }

    function onCreated() {
        const state: RootStateType = Utils.getReduxState()
        const searchString = state.queryHelper[instance]?.searchString
        if (searchString && gridRef.current) {
            gridRef.current.search(searchString)
        }
    }
}

type GridDragAndDropSettingsType = {
    allowRowDragAndDrop?: boolean
    onRowDragStart?: (args: any) => void
    onRowDragStartHelper?: (args: any) => void
    onRowDrop?: (args: any) => void
    selectionType?: 'Multiple' | "Single"
    targetId?: string
}

export type CompSyncFusionGridType = {
    aggregates?: SyncFusionGridAggregateType[]
    buCode?: string
    className?: string
    columns: SyncFusionGridColumnType[]
    dataSource?: any
    dbName?: string
    dbParams?: { [key: string]: string | undefined }
    editSettings?: {
        allowEditing: boolean
        mode: 'Batch' | 'Dialog' | 'Normal'
        showConfirmDialog: boolean
    }
    gridDragAndDropSettings?: GridDragAndDropSettingsType
    hasCheckBoxSelection?: boolean
    hasIndexColumn?: boolean
    height?: string
    instance: string
    isLoadOnInit?: boolean
    loadData?: () => void
    minWidth?: string
    onCellEdit?: (args: any) => void
    onDelete?: (id: string) => void
    onEdit?: (args: any) => void
    onPreview?: (args: any) => void
    onRowDataBound?: (args: RowDataBoundEventArgs) => void
    rowHeight?: number
    sqlArgs?: GraphQLQueryArgsType // SqlArgsType
    sqlId?: string
}

export type SyncFusionGridAggregateType = {
    columnName: string
    customAggregate?: (data: any) => any
    field: string
    type?: 'Average' | 'Count' | 'Sum' | 'Min' | 'Max' | 'Custom'
    footerTemplate?: FC
    format?: 'N2' | 'N0'
}

export type SyncFusionGridColumnType = {
    allowEditing?: boolean
    customAttributes?: {
        [key: string]: string
    }
    edit?: {
        [key: string]: {
            [key: string]: string
        }
    }
    editType?: 'datepickeredit' | 'textedit'
    field: string
    format?: string
    headerText?: string
    isPrimaryKey?: boolean
    template?: any
    textAlign?: 'Center' | 'Justify' | 'Left' | 'Right'
    type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime'
    visible?: boolean
    width?: number
}

export type SqlArgsType = {
    [key: string]: string | number
}


