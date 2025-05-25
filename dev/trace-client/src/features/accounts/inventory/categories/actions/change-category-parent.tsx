import { useState } from "react"
import { DataInstancesMap } from "../../../../../app/graphql/maps/data-instances-map"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../../app/graphql/maps/graphql-queries-map"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { CompSyncFusionTreeGridToolbar } from "../../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { WidgetButtonSubmitFullWidth } from "../../../../../controls/widgets/widget-button-submit-full-width"
import { Messages } from "../../../../../utils/messages"
import { Utils } from "../../../../../utils/utils"
import { useUtilsInfo } from "../../../../../utils/utils-info-hook"
import { DatabaseTablesMap } from "../../../../../app/graphql/maps/database-tables-map"
// import _ from "lodash"

export function ChangeCatgoryParent({ catId }: { catId: number | undefined }) {
    const instance = DataInstancesMap.changeCategoryParent
    const [parentId, setParentId]: any = useState(undefined)
    const {
        buCode
        , context
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    return (<div className="flex flex-col">
        <CompSyncFusionTreeGridToolbar
            CustomControl={() => <button className="px-2 py-1 bg-primary-400 text-gray-100 rounded-md hover:bg-primary-800 hover:text-white text-xs" onClick={handleNoParent}>No parent</button>}
            className=""
            title=''
            isLastNoOfRows={false}
            instance={instance}
            minWidth="500px"
            isCsvExport={false}
            isPdfExport={false}
            isExcelExport={false}
        />
        <CompSyncfusionTreeGrid
            addUniqueKeyToJson={true}
            aggregates={getAggregates()}
            buCode={buCode}
            childMapping="children"
            className="mr-6"
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            graphQlQueryFromMap={GraphQLQueriesMap.productCategories}
            graphQlQueryName={GraphQLQueriesMapNames.productCategories}
            hasCheckBoxSelection={true}
            isLoadOnInit={true}
            columns={getColumns()}
            height="calc(100vh - 240px)"
            instance={instance}
            minWidth='400px'
            rowDeselected={rowDeselected}
            rowSelecting={rowSelecting}
            rowSelected={rowSelected}
            treeColumnIndex={1}
        />

        {/* Submit */}
        <WidgetButtonSubmitFullWidth
            label="Submit"
            className="mt-4 ml-auto w-40"
            onClick={handleOnSubmit}
            disabled={parentId ? false : true}
        />
    </div>)

    function getAggregates(): SyncFusionTreeGridAggregateColumnType[] {
        return ([
            {
                columnName: 'catName',
                field: 'catName',
                type: 'Count',
                footerTemplate: (props: any) => `Count: ${props['catName - count']}`,
            }
        ])
    }
    
    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'catName',
                headerText: 'Category name',
                width: 200
            },
            {
                field: 'descr',
                headerText: 'Descr',
                width: 100
            },
            {
                field: 'leaf',
                headerText: 'Leaf',
                width: 50,
                template: (args: any) => args.isLeaf ? 'Yes' : 'No'
            },
        ])
    }

    async function handleNoParent() {
        Utils.showConfirmDialog('Warning!!!', Messages.messNoParentCategoryConfirm, async () => {
            setParentId(null)
            await handleOnSubmit()
        })
    }

    async function handleOnSubmit() {
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || "",
                tableName: DatabaseTablesMap.CategoryM,
                xData: { id: catId, parentId: parentId || null },
            });
            Utils.showSaveMessage();
            Utils.showHideModalDialogA({ isOpen: false });
            const loadData = context.CompSyncFusionTreeGrid[DataInstancesMap.productCategories].loadData;
            if (loadData) {
                await loadData();
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    function rowDeselected() {
        setParentId(undefined)
    }

    function rowSelecting(args: any) {
        const gridRef = context.CompSyncFusionTreeGrid[instance].gridRef
        if (args?.data.isLeaf) {
            args.cancel = true
            Utils.showAlertMessage('Warning!!!', Messages.messNoLeafNodeAllowed)
        } else {
            if (gridRef) {
                gridRef.current.clearSelection() // to enable single row selection
            }
        }
    }

    function rowSelected(args: any) {
        setParentId(args?.data?.id)
    }

}