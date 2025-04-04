import ReactSlidingPane from "react-sliding-pane";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { useState } from "react";
import { Utils } from "../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { AppDispatchType } from "../../../../app/store/store";
import { useDispatch } from "react-redux";
import { showCompAppLoader } from "../../../../controls/redux-components/comp-slice";
import { CompInstances } from "../../../../controls/redux-components/comp-instances";
import { format } from "date-fns";
import { resetTranHeaderIdToEdit, setTranHeaderIdToEdit } from "../../accounts-slice";

export function StockJournalView({ instance }: { instance: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const [isPaneOpen, setIsPaneOpen] = useState(false);
    const {
        buCode,
        branchId,
        context,
        currentDateFormat,
        dbName,
        decodedDbParamsObject,
        finYearId
    } = useUtilsInfo();

    return (
        <div className="flex flex-col max-w-max">
            <CompSyncFusionGridToolbar
                // className="mt-2 mr-6"
                minWidth="400px"
                title="Stock Journal View"
                isPdfExport={true}
                isExcelExport={true}
                isCsvExport={true}
                isLastNoOfRows={true}
                instance={instance}
            />

            <CompSyncFusionGrid
                aggregates={getAggregates()}
                buCode={buCode}
                className="mt-4"
                columns={getColumns()}
                dbName={dbName}
                dbParams={decodedDbParamsObject}
                deleteColumnWidth={40}
                editColumnWidth={40}
                height="calc(100vh - 260px)"
                // allowPaging={true}
                instance={instance}
                minWidth="400px"
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
                onPreview={handleOnPreview}
                previewColumnWidth={40}
                sqlId={SqlIdsMap.getAllStockJournals}
                sqlArgs={{ branchId: branchId, finYearId: finYearId }}
            />
            {/* Sliding Pane */}
            <ReactSlidingPane
                className="bg-gray-300"
                isOpen={isPaneOpen}
                title="Branch Transfer"
                from="right"
                width="80%"
                onRequestClose={() => setIsPaneOpen(false)}
            >
                {/* PDF Viewer inside the sliding pane */}
                <div></div>
                {/* <PDFViewer style={{ width: "100%", height: "100%" }}>
              <ProductsBranchTransferPdf
                branchTransfers={meta.current.branchTransfers}
                tranH={meta.current.tranH}
              />
            </PDFViewer> */}
            </ReactSlidingPane>
        </div>)

    function clearDeletedIds() {
        if (context.DataInstances?.[instance]) {
            context.DataInstances[instance].deletedIds = [];
        }
    }

    function getAggregates(): SyncFusionGridAggregateType[] {
        return [
            {
                columnName: "tranDate",
                type: "Count",
                field: "tranDate",
                format: "N0",
                footerTemplate: (props: any) => (
                    <span className="text-xs">Count: {props.Count}</span>
                )
            },
            {
                columnName: "debits",
                type: "Sum",
                field: "debits",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs mr-2">{props.Sum}</span>
                )
            },
            {
                columnName: "credits",
                type: "Sum",
                field: "credits",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs mr-2">{props.Sum}</span>
                )
            }
        ];
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return [
            {
                field: "tranDate",
                headerText: "Date",
                type: "date",
                width: 90,
                template: (props: any) =>
                    format(props.tranDate, currentDateFormat)
                // format: currentDateFormat, // For PDF export only used template. format gives error is exports
            },
            {
                field: "autoRefNo",
                headerText: "Ref No",
                type: "string",
                width: 140
            },
            {
                field: "userRefNo",
                headerText: "User ref",
                type: "string",
                width: 100
            },
            {
                field: "productDetails",
                headerText: "Product",
                type: "string",
                width: 150
            },
            {
                field: "credits",
                headerText: "Consumed",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "debits",
                headerText: "Produced",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "price",
                headerText: "Price",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "amount",
                textAlign: "Right",
                headerText: "Amount",
                type: "number",
                format: "N2",
                width: 120
            },
            {
                field: "serialNumbers",
                headerText: "Serial No",
                type: "string",
                width: 120
            },
            {
                field: "remarks",
                headerText: "Remarks",
                type: "string",
                width: 120
            },
            {
                field: "lineRefNo",
                headerText: "Line Ref",
                type: "string",
                width: 100
            },
            {
                field: "lineRemarks",
                headerText: "Line Remarks",
                type: "string",
                width: 100
            }
        ];
    }

    async function handleOnDelete(id: string) {
        Utils.showDeleteConfirmDialog(doDelete);
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || "",
                    tableName: DatabaseTablesMap.TranH,
                    deletedIds: [id]
                });
                Utils.showSaveMessage();
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
        clearDeletedIds()
        dispatch(
            resetTranHeaderIdToEdit({
                instance: instance,
            })
        )
        // Settimeout is necessary to enable render of selector component twice; one for each dispatch
        setTimeout(() => {
            dispatch(
                setTranHeaderIdToEdit({
                    instance: instance,
                    tranHeaderId: props.id
                })
            );
        }, 0);

        Utils.showHideModalDialogA({ isOpen: false })
    }

    async function handleOnPreview(props: any) {
        dispatch(
            showCompAppLoader({
                isVisible: true,
                instance: CompInstances.compAppLoader
            })
        );
        try {
            const res: any = await Utils.doGenericQuery({
                buCode: buCode || "",
                dbName: dbName || "",
                dbParams: decodedDbParamsObject || {},
                instance: instance,
                sqlArgs: {
                    id: props.id
                },
                sqlId: SqlIdsMap.getBranchTransferDetailsOnTranHeaderId
            });
            console.log(res)
            // const jsonResult: BranchTransferJsonResultType = res?.[0]?.jsonResult;
            // jsonResult.tranH.currentDateFormat = currentDateFormat;
            // meta.current = jsonResult;
            setIsPaneOpen(true);
        } catch (e: any) {
            console.log(e);
        } finally {
            dispatch(
                showCompAppLoader({
                    isVisible: false,
                    instance: CompInstances.compAppLoader
                })
            );
        }
    }
}