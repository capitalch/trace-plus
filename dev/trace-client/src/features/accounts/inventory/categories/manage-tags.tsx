// import { useDispatch } from "react-redux";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
// import { AppDispatchType } from "../../../../app/store/store";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
// import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { Utils } from "../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { NewTagButton } from "./new-tag-button";

export function ManageTags(){
    const instance = DataInstancesMap.manageTags;
    // const dispatch: AppDispatchType = useDispatch();
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo();
    
    return (
        <div className="flex flex-col">
            <CompSyncFusionGridToolbar
                className="mr-6"
                CustomControl={() => <NewTagButton />}
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
                height="calc(100vh - 250px)"
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
                // dispatch(changeAccSettings());
                const loadData = context.CompSyncFusionGrid[instance].loadData;
                if (loadData) {
                    await loadData();
                }
            } catch (e: any) {
                console.log(e);
            }
        }
    }

    async function handleOnEdit(props: any) {
        console.log(props)
        // Utils.showHideModalDialogA({
        //     title: "Edit Tag",
        //     isOpen: true,
        //     element: <NewEditTag id={props.id} tagName={props.tagName} />,
        // });
    }
}