import { FC, } from "react"
import { GraphQLQueryArgsType, } from "../../../app/graphql/maps/graphql-queries-map";
import { CompSyncFusionGridType, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "./comp-syncfusion-grid";
import { AggregateColumnDirective, ColumnDirective } from "@syncfusion/ej2-react-grids";
import { useQueryHelper } from "../../../app/graphql/query-helper-hook";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../app/store/store";
import { IconEdit } from "../../icons/icon-edit";
import { IconDelete } from "../../icons/icon-delete";
import { IconPreview } from "../../icons/icon-preview";
import { Button } from "primereact/button";

export function useCompSyncFusionGrid({ aggregates, columns, hasCheckBoxSelection, hasIndexColumn, instance, isLoadOnInit, onDelete, onEdit, onPreview, sqlId, sqlArgs, }: CompSyncFusionGridType) {

    const selectedLastNoOfRows: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.lastNoOfRows)
    let lastNoOfRows = selectedLastNoOfRows

    if (selectedLastNoOfRows === undefined) {
        lastNoOfRows = 100
    } else if (selectedLastNoOfRows === '') {
        lastNoOfRows = null
    }
    if (sqlArgs) {
        sqlArgs.noOfRows = lastNoOfRows
    }

    const args: GraphQLQueryArgsType = {
        sqlId: sqlId,
        sqlArgs: sqlArgs
    }

    const { loadData, loading, } = useQueryHelper({
        getQueryArgs: () => args,
        instance: instance,
        isExecQueryOnLoad: isLoadOnInit
    })

    const selectedData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[instance]?.data
        return (ret)
    })

    function getAggrColDirectives() {
        const defaultFooterTemplate: FC = (props: any) => <span><b>{props.Sum}</b></span>
        let ds: any[] = []
        if (aggregates && aggregates.length > 0) {
            ds = aggregates.map((aggr: SyncFusionGridAggregateType, index: number) => {
                return (<AggregateColumnDirective
                    customAggregate={aggr?.customAggregate}
                    columnName={aggr.columnName}
                    key={index}
                    field={aggr.field}
                    type={aggr.type}
                    footerTemplate={aggr.footerTemplate || defaultFooterTemplate}
                    format={aggr.format || 'N2'}
                />)
            })
        }
        return (ds)
    }

    function getColumnDirectives() {
        const colDirectives: any[] = columns.map((col: SyncFusionGridColumnType, index: number) => {
            return (<ColumnDirective
                allowEditing={col?.allowEditing}
                clipMode="EllipsisWithTooltip"
                customAttributes={col?.customAttributes}
                edit={col?.edit}
                editType={col?.editType}
                field={col.field}
                format={col.format}
                headerText={col?.headerText}
                isPrimaryKey={col?.isPrimaryKey}
                key={index}
                template={col.template}
                textAlign={col.textAlign}
                type={col.type}
                visible={col?.visible}
                width={col.width}
            />)
        })

        if (onDelete) {
            colDirectives.unshift(<ColumnDirective
                key='D'
                field=''
                headerText='D'
                template={deleteTemplate}
                width={30}
            />)
        }

        if (onPreview) {
            colDirectives.unshift(<ColumnDirective
                key='P'
                field=''
                headerText='P'
                template={previewTemplate}
                width={12}
            />)
        }

        if (onEdit) {
            colDirectives.unshift(<ColumnDirective
                key='E'
                field=''
                headerText='E'
                template={editTemplate}
                width={12}
                textAlign="Center"
            />)
        }
        if (hasIndexColumn) {
            colDirectives.unshift(<ColumnDirective
                key='#'
                field=''
                headerText='#'
                template={indexColumnTemplate}
                width={70}
            />)
        }
        if (hasCheckBoxSelection) {
            colDirectives.unshift(<ColumnDirective key='X' type="checkbox" width='50' />)
        }
        return (colDirectives)
    }

    function deleteTemplate(props: any) {
        return (
            <Button tooltip="Delete" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 10 }} 
            className="w-4 h-4 rounded-md bg-slate-100 hover:bg-slate-300" onClick={() => {
                if (onDelete) {
                    onDelete(props.id)
                }
            }}>
                <IconDelete className="w-3 h-3 m-auto mt-1 text-red-600" />
            </Button>)
    }

    function previewTemplate(props: any) {
        return (
            <Button tooltip="Preview" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 10 }} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200" onClick={() => {
                if (onPreview) {
                    onPreview(props)
                }
            }}>
                <IconPreview className="w-5 h-5 m-auto mt-1 text-blue-600" />
            </Button>)
    }

    function editTemplate(props: any) {
        return (
            // WidgetTooltip not working here
            <Button tooltip="Edit" tooltipOptions={{ position: 'top', mouseTrack: true, mouseTrackTop: 10 }} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200" onClick={() => {
                if (onEdit) {
                    onEdit(props)
                }
            }}>
                <IconEdit className="w-5 h-5 m-auto mt-1 text-green-600" />
            </Button>
        )
    }

    function indexColumnTemplate(props: any) {
        const idx: number = +props.index + 1
        return (idx)
    }


    return ({ getAggrColDirectives, getColumnDirectives, loading, loadData, selectedData })
}
