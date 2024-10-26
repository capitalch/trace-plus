import { useContext, useEffect, useRef } from "react"
import _ from 'lodash'
import { GlobalContextType } from "../../../app/global-context"
import { GlobalContext } from "../../../App"
import { useCompSyncfusionTreeGrid } from "./comp-syncfusion-tree-grid-hook"
import { WidgetLoadingIndicator } from "../../widgets/widget-loading-indicator"
import { Aggregate, ColumnsDirective, ExcelExport, Filter, InfiniteScroll, Inject, Page, PdfExport, Resize, RowDD, SearchSettings, SearchSettingsModel, Sort, Toolbar, TreeGridComponent } from "@syncfusion/ej2-react-treegrid"
import { ColumnDirective } from "@syncfusion/ej2-react-grids"

export function CompSyncfusionTreeGrid({
    addUniqueKeyToJson = false,
    allowPaging = false,
    allowRowDragAndDrop = false,
    allowSorting = false,
    childMapping,
    className = '',
    columns,
    instance,
    isCollapsedAllByDefault = true,
    isLoadOnInit = true,
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
            context.CompSyncFusionTreeGrid[instance] = { loadData: undefined, gridRef: undefined }
        }
        context.CompSyncFusionTreeGrid[instance].loadData = loadData
        context.CompSyncFusionTreeGrid[instance].gridRef = gridRef
        return (() => {
            console.log('Syncfusion cleanup')
        })
    }, [])

    // useEffect(()=>{

    // },[selectedData])

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
                allowRowDragAndDrop={allowRowDragAndDrop}
                allowSelection={true}
                allowSorting={allowSorting}
                allowTextWrap={true}
                childMapping={childMapping}
                className={className}
                clipMode="EllipsisWithTooltip"
                dataSource={selectedData }
                enablePersistence={false}
                enableCollapseAll={isCollapsedAllByDefault}
                gridLines="Both"
                height='100%'
                pageSettings={{ pageSize: pageSize }}
                ref={gridRef}
                rowDrop={onRowDrop}
                rowHeight={rowHeight}
                searchSettings={searchOptions}
                treeColumnIndex={treeColumnIndex}>
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
                    Aggregate
                    , ExcelExport
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
    allowPaging?: boolean
    allowRowDragAndDrop?: boolean
    allowSorting?: boolean
    childMapping: string
    className?: string
    columns: SyncFusionTreeGridColumnType[]
    instance: string
    isCollapsedAllByDefault?: boolean
    isLoadOnInit?: boolean
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

const data1 = [
    {
        "code": "buu1",
        "name": "Business unit 1",
        "buId": 42,
        "users": [
            {
                "id": 22,
                "code": "user1",
                "name": "user1",
                "buId": 42,
                "userId": 62
            },
            {
                "id": 23,
                "code": "user2",
                "name": "user2",
                "buId": 42,
                "userId": 63
            },
            {
                "id": 24,
                "code": "user3",
                "name": "user3",
                "buId": 42,
                "userId": 64
            },
            {
                "id": 25,
                "code": "user4",
                "name": "user4",
                "buId": 42,
                "userId": 65
            },
            {
                "id": 42,
                "code": "capital",
                "name": "Sushant1",
                "buId": 42,
                "userId": 56
            },
            {
                "id": 43,
                "code": "user5",
                "name": "user5",
                "buId": 42,
                "userId": 66
            },
            {
                "id": 44,
                "code": "user6",
                "name": "user6",
                "buId": 42,
                "userId": 67
            },
            {
                "id": 45,
                "code": "bFJ1cq6i",
                "name": "user7",
                "buId": 42,
                "userId": 69
            }
        ]
    },
    {
        "code": "buu2",
        "name": "Business unit 2",
        "buId": 43,
        "users": [
            {
                "id": 29,
                "code": "user5",
                "name": "user5",
                "buId": 43,
                "userId": 66
            },
            {
                "id": 30,
                "code": "user6",
                "name": "user6",
                "buId": 43,
                "userId": 67
            },
            {
                "id": 31,
                "code": "user1",
                "name": "user1",
                "buId": 43,
                "userId": 62
            }
        ]
    },
    {
        "code": "buu3",
        "name": "Business unit 3",
        "buId": 44,
        "users": [
            {
                "id": 32,
                "code": "user1",
                "name": "user1",
                "buId": 44,
                "userId": 62
            },
            {
                "id": 33,
                "code": "user2",
                "name": "user2",
                "buId": 44,
                "userId": 63
            },
            {
                "id": 34,
                "code": "user3",
                "name": "user3",
                "buId": 44,
                "userId": 64
            },
            {
                "id": 35,
                "code": "user4",
                "name": "user4",
                "buId": 44,
                "userId": 65
            },
            {
                "id": 36,
                "code": "user6",
                "name": "user6",
                "buId": 44,
                "userId": 67
            }
        ]
    },
    {
        "code": "buu4",
        "name": "Business unit 4",
        "buId": 45,
        "users": [
            {
                "id": 37,
                "code": "user6",
                "name": "user6",
                "buId": 45,
                "userId": 67
            },
            {
                "id": 38,
                "code": "user5",
                "name": "user5",
                "buId": 45,
                "userId": 66
            },
            {
                "id": 39,
                "code": "user4",
                "name": "user4",
                "buId": 45,
                "userId": 65
            },
            {
                "id": 40,
                "code": "user3",
                "name": "user3",
                "buId": 45,
                "userId": 64
            },
            {
                "id": 41,
                "code": "user2",
                "name": "user2",
                "buId": 45,
                "userId": 63
            }
        ]
    },
    {
        "code": "buu5",
        "name": "Business unit 5",
        "buId": 46,
        "users": null
    },
    {
        "code": "buu6",
        "name": "busi 6",
        "buId": 54,
        "users": null
    }
]