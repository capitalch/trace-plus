import { DataInstancesMap } from "../../../../../app/graphql/maps/data-instances-map";
import { DatabaseTablesMap } from "../../../../../app/graphql/maps/database-tables-map";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { Utils } from "../../../../../utils/utils";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { NewEditTagModal } from "./new-edit-tag-modal";
import { NewTagButton } from "./new-tag-button";

export function ManageTags() {
    const instance = DataInstancesMap.manageTags;
    // const dispatch: AppDispatchType = useDispatch();
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
                buCode={buCode}
                className="mr-6 mt-4"
                columns={getColumns()}
                dbName={dbName}
                dbParams={decodedDbParamsObject}
                editColumnWidth={35}
                hasIndexColumn={true}
                // height="calc(100vh - 250px)"
                instance={instance}
                isLoadOnInit={false}
                minWidth="500px"
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
                sqlId={SqlIdsMap.getTags}
            />
        </div>
    );

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

    async function handleOnDelete(id: string) {
        Utils.showDeleteConfirmDialog(doDelete);
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || "",
                    tableName: DatabaseTablesMap.TagsM,
                    deletedIds: [id],
                });
                Utils.showSaveMessage();
                const loadData = context.CompSyncFusionGrid[instance].loadData;
                if (loadData) {
                    await loadData();
                }
                const loadData1 = context.CompSyncFusionTreeGrid[DataInstancesMap.productCategories].loadData
                if(loadData1){
                    await loadData1();
                }
            } catch (e: any) {
                console.log(e);
            }
        }
    }

    async function handleOnEdit(props: any) {
        console.log(props)
        Utils.showHideModalDialogB({
            title: "Edit Tag",
            isOpen: true,
            element: <NewEditTagModal id={props.id} tagName={props.tagName} instance={instance} />,
        });
    }
}