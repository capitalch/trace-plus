import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { AllTables } from "../../../../../app/maps/database-tables-map";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { Utils } from "../../../../../utils/utils";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { NewEditTagModal } from "./new-edit-tag-modal";
import { NewTagButton } from "./new-tag-button";

export function ManageTags() {
    const instance = DataInstancesMap.manageTags;
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo();

    return (
        <div className="flex flex-col">
            <CompSyncFusionGridToolbar
                className="mr-6"
                CustomControl={() => <NewTagButton instance={instance} />}
                minWidth="500px"
                title=""
                isPdfExport={false}
                isExcelExport={false}
                isCsvExport={false}
                isLastNoOfRows={false}
                instance={instance}
            />

            <CompSyncFusionGrid
                aggregates={getAggregates()}
                buCode={buCode}
                className="mr-6 mt-4"
                columns={getColumns()}
                dbName={dbName}
                dbParams={decodedDbParamsObject}
                editColumnWidth={35}
                hasIndexColumn={true}
                instance={instance}
                // isLoadOnInit={false}
                minWidth="500px"
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
                sqlId={SqlIdsMap.getTags}
            />
        </div>
    );

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'tagName',
                field: 'tagName',
                type: 'Count',
                footerTemplate: (props: any) => `Count: ${props['tagName - count']}`,
            }
        ])
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return [
            {
                field: "id",
                headerText: "ID",
                type: "number",
                width: 80,
                isPrimaryKey: true,
            },
            {
                field: "tagName",
                headerText: "Tag Name",
                type: "string",
                width: 200,
            },
        ];
    }

    async function handleOnDelete(id: string | number) {
        Utils.showDeleteConfirmDialog(doDelete);
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || "",
                    tableName: AllTables.TagsM.name,
                    deletedIds: [id],
                });
                Utils.showSaveMessage();
                const loadData = context.CompSyncFusionGrid[instance].loadData;
                if (loadData) {
                    await loadData();
                }
                const loadData1 = context.CompSyncFusionTreeGrid[DataInstancesMap.productCategories].loadData
                if (loadData1) {
                    await loadData1();
                }
            } catch (e: any) {
                console.log(e);
            }
        }
    }

    async function handleOnEdit(props: any) {
        Utils.showHideModalDialogB({
            title: "Edit Tag",
            isOpen: true,
            element: <NewEditTagModal id={props.id} tagName={props.tagName} instance={instance} />,
        });
    }
}