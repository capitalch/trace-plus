import { useEffect, useState } from "react"
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../../app/maps/graphql-queries-map"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { CompSyncFusionTreeGridToolbar } from "../../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { WidgetButtonSubmitFullWidth } from "../../../../../controls/widgets/widget-button-submit-full-width"
import { Messages } from "../../../../../utils/messages"
import { Utils } from "../../../../../utils/utils"
import { useUtilsInfo } from "../../../../../utils/utils-info-hook"
import { AllTables } from "../../../../../app/maps/database-tables-map"

export function ChangeCatgoryParent({ catId }: { catId: number | undefined }) {
    const instance = DataInstancesMap.changeCategoryParent
    const [parentId, setParentId]: any = useState(undefined)
    const {
        buCode
        , context
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        const loadData = context.CompSyncFusionTreeGrid[instance]?.loadData
        if (loadData) {
            loadData()
        }
    }, [buCode])

    return (<div className="flex flex-col w-full">
        <CompSyncFusionTreeGridToolbar
            CustomControl={() => <button className="px-2 py-1 text-gray-100 text-xs rounded-md hover:bg-primary-800 hover:text-white bg-primary-400" onClick={handleNoParent}>No parent</button>}
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
            className="mr-4"
            columns={getColumns()}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            graphQlQueryFromMap={GraphQLQueriesMap.productCategories}
            graphQlQueryName={GraphQLQueriesMapNames.productCategories}
            hasCheckBoxSelection={true}
            height="calc(100vh - 290px)"
            instance={instance}
            // isLoadOnInit={false}
            minWidth='500px'
            rowDeselected={rowDeselected}
            rowSelecting={rowSelecting}
            rowSelected={rowSelected}
            treeColumnIndex={1}
        />

        {/* Submit */}
        <WidgetButtonSubmitFullWidth
            label="Submit"
            className="mt-2 ml-auto w-40"
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
                width: 150
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
                tableName: AllTables.CategoryM.name,
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