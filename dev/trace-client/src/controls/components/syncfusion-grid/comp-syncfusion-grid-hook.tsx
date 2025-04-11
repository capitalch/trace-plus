import { FC, useEffect } from "react";
import { GraphQLQueryArgsType } from "../../../app/graphql/maps/graphql-queries-map";
import {
    CompSyncFusionGridType,
    SyncFusionGridAggregateType,
    SyncFusionGridColumnType
} from "./comp-syncfusion-grid";
import {
    AggregateColumnDirective,
    ColumnDirective
} from "@syncfusion/ej2-react-grids";
import { useQueryHelper } from "../../../app/graphql/query-helper-hook";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../app/store/store";
import { IconDelete } from "../../icons/icon-delete";
import { IconPreview } from "../../icons/icon-preview";
import { Button } from "primereact/button";
import { IconEdit1 } from "../../icons/icon-edit1";
import { IconCross } from "../../icons/icon-cross";

export function useCompSyncFusionGrid({
    aggregates,
    buCode,
    columns,
    dataSource,
    dbName,
    dbParams,
    deleteColumnWidth,
    editColumnWidth,
    hasCheckBoxSelection,
    hasIndexColumn,
    indexColumnWidth,
    instance,
    isLoadOnInit,
    loadData,
    onDelete,
    onEdit,
    onPreview,
    onRemove,
    previewColumnWidth,
    removeButtonWidth,
    sqlId,
    sqlArgs
}: CompSyncFusionGridType) {
    const selectedLastNoOfRows: any = useSelector(
        (state: RootStateType) => state.queryHelper[instance]?.lastNoOfRows
    );
    if (sqlArgs) {
        //sqlArgs is meaningful when there is no loadData defined for CompSyncfusionGrid and loadDataLocal is used
        sqlArgs["noOfRows"] =
            selectedLastNoOfRows === undefined ? 100 : selectedLastNoOfRows || null;
    }
    useEffect(() => {
        if (!(loadData || dataSource)) {
            // For custom loadData the loading should be taken care of in the calling code
            loadDataLocal();
        }
    }, [selectedLastNoOfRows]);

    const args: GraphQLQueryArgsType = {
        buCode: buCode,
        dbParams: dbParams,
        sqlId: sqlId,
        sqlArgs: sqlArgs
    };

    const { loadData: loadDataLocal, loading } = useQueryHelper({
        dbName: dbName,
        getQueryArgs: () => args,
        instance: instance,
        isExecQueryOnLoad: isLoadOnInit
    });

    const selectedData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[instance]?.data;
        return ret;
    });

    function getAggrColDirectives() {
        const defaultFooterTemplate: FC = (props: any) => (
            <span>
                <b>{props.Sum}</b>
            </span>
        );
        let ds: any[] = [];
        if (aggregates && aggregates.length > 0) {
            ds = aggregates.map(
                (aggr: SyncFusionGridAggregateType, index: number) => {
                    return (
                        <AggregateColumnDirective
                            customAggregate={aggr?.customAggregate}
                            columnName={aggr.columnName}
                            key={index}
                            field={aggr.field}
                            type={aggr.type}
                            footerTemplate={aggr.footerTemplate || defaultFooterTemplate}
                            format={aggr.format || "N2"}
                        />
                    );
                }
            );
        }
        return ds;
    }

    function getColumnDirectives() {
        const colDirectives: any[] = columns.map(
            (col: SyncFusionGridColumnType, index: number) => {
                return (
                    <ColumnDirective
                        allowEditing={col?.allowEditing}
                        clipMode="EllipsisWithTooltip"
                        customAttributes={col?.customAttributes}
                        edit={col?.edit}
                        editTemplate={col?.editTemplate}
                        editType={col?.editType}
                        field={col.field}
                        format={col.format}
                        headerText={col?.headerText}
                        isPrimaryKey={col?.isPrimaryKey}
                        key={index}
                        template={col.template}
                        textAlign={col.textAlign}
                        type={col.type}
                        valueAccessor={col.valueAccessor}
                        visible={col?.visible}
                        width={col.width}
                    />
                );
            }
        );

        if (onDelete) {
            colDirectives.unshift(
                <ColumnDirective
                    key="D"
                    allowEditing={false}
                    field=""
                    headerText="D"
                    template={deleteTemplate}
                    width={deleteColumnWidth || 30}
                />
            );
        }

        if (onPreview) {
            colDirectives.unshift(
                <ColumnDirective
                    key="P"
                    allowEditing={false}
                    field=""
                    headerText="P"
                    template={previewTemplate}
                    width={previewColumnWidth || 30}
                />
            );
        }

        if (onEdit) {
            colDirectives.unshift(
                <ColumnDirective
                    key="E"
                    allowEditing={false}
                    field=""
                    headerText="E"
                    template={editTemplate}
                    width={editColumnWidth || "16px"}
                    textAlign="Center"
                />
            );
        }
        if (hasIndexColumn) {
            colDirectives.unshift(
                <ColumnDirective
                    key="#"
                    allowEditing={false}
                    field=""
                    headerText="#"
                    template={indexColumnTemplate}
                    width={indexColumnWidth}
                />
            );
        }
        if (onRemove) {
            colDirectives.unshift(
                <ColumnDirective
                    key="R"
                    allowEditing={false}
                    field=""
                    headerText="R"
                    template={removeTemplate}
                    width={removeButtonWidth || 30}
                />
            );
        }

        if (hasCheckBoxSelection) {
            colDirectives.unshift(
                <ColumnDirective key="X" type="checkbox" width="50" />
            );
        }
        return colDirectives;
    }

    function deleteTemplate(props: any) {
        return (
            <Button
                tooltip="Delete"
                tooltipOptions={{
                    position: "top",
                    mouseTrack: true,
                    mouseTrackTop: 10
                }}
                className="w-7 h-7 bg-slate-50 hover:bg-slate-300"
                onClick={() => {
                    if (onDelete) {
                        onDelete(props.id, props.isUsed);
                    }
                }}
            >
                <IconDelete className="w-5 h-5 text-red-500 ml-1" />
            </Button>
        );
    }

    function previewTemplate(props: any) {
        return (
            <Button
                tooltip="Preview"
                tooltipOptions={{
                    position: "top",
                    mouseTrack: true,
                    mouseTrackTop: 10
                }}
                className="w-7 h-7 bg-slate-50 hover:bg-slate-200"
                onClick={() => {
                    if (onPreview) {
                        onPreview(props);
                    }
                }}
            >
                <IconPreview className="w-5 h-5 text-blue-600 ml-1" />
            </Button>
        );
    }

    function editTemplate(props: any) {
        return (
            // WidgetTooltip not working here
            <Button
                tooltip="Edit"
                tooltipOptions={{
                    position: "top",
                    mouseTrack: true,
                    mouseTrackTop: 10
                }}
                // <button
                className="w-7 h-7 bg-slate-50 hover:bg-slate-200 "
                onClick={() => {
                    if (onEdit) {
                        onEdit(props);
                    }
                }}
            >
                <IconEdit1 className="w-5 h-5 text-green-600 ml-1" />
            </Button>
        );
    }

    function indexColumnTemplate(props: any) {
        const idx: number = +props.index + 1;
        return idx;
    }

    function removeTemplate(props: any) {
        return (
            <Button
                className="w-7 h-7 bg-slate-50 hover:bg-slate-200 "
                onClick={() => {
                    if (onRemove) {
                        onRemove(props)
                    }
                    // if (gridRef.current) {
                    //     const selectedRecords = gridRef.current?.getSelectedRecords();
                    //     if (selectedRecords && selectedRecords.length > 0) {
                    //         gridRef.current?.deleteRecord('id', selectedRecords[0]);
                    //     } else {
                    //         alert('Please select a row to delete');
                    //     }

                    // }
                }}
            >
                <IconCross className="w-5 h-5 text-red-500 ml-1" />
            </Button>
        );
    }

    return {
        getAggrColDirectives,
        getColumnDirectives,
        loading,
        loadDataLocal,
        selectedData
    };
}
