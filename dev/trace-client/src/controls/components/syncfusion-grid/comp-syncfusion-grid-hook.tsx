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
// import { IconDelete } from "../../icons/icon-delete";
// import { IconPreview } from "../../icons/icon-preview";
// import { Button } from "primereact/button";
// import { IconEdit1 } from "../../icons/icon-edit1";
// import { IconCross } from "../../icons/icon-cross";

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
    // isExecQueryOnLoad: isLoadOnInit
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
            clipMode={col.clipMode || "Clip"} //EllipsisWithTooltip
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
          headerText="D"
          width={deleteColumnWidth || "40"}
          commands={[
            {
              title: 'Delete',
              type: 'Delete',
              buttonOption: {
                iconCss: 'e-icons e-delete',
                cssClass: 'e-flat e-grid-delete text-red-500',
              }
            }
          ]}
        />
        // <ColumnDirective
        //   key="D"
        //   allowEditing={false}
        //   field=""
        //   headerText="D"
        //   template={deleteTemplate}
        //   width={deleteColumnWidth || 30}
        // />
      );
    }

    if (onPreview) {
      colDirectives.unshift(
        <ColumnDirective
          headerText="P"
          width={previewColumnWidth || "40"}
          commands={[
            {
              title: 'Preview',
              type: 'None',
              buttonOption: {
                iconCss: 'e-icons e-eye',
                cssClass: 'e-flat e-grid-preview text-blue-600',
              }
            }
          ]}
        />
        // <ColumnDirective
        //   key="P"
        //   allowEditing={false}
        //   field=""
        //   headerText="P"
        //   template={previewTemplate}
        //   width={previewColumnWidth || 30}
        // />
      );
    }

    if (onEdit) {
      colDirectives.unshift(
        <ColumnDirective
          headerText="E"
          width={editColumnWidth || "40"}
          commands={[
            {
              title: 'Edit',
              type: 'Edit',
              buttonOption: {
                iconCss: 'e-icons e-edit',
                cssClass: 'e-flat e-grid-edit text-green-600',
              }
            }
          ]}
        />
        // <ColumnDirective
        //   key="E"
        //   allowEditing={false}
        //   field=""
        //   headerText="E"
        //   template={editTemplate}
        //   width={editColumnWidth || "16px"}
        //   textAlign="Center"
        // />
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
          headerText="R"
          width={removeButtonWidth || "40"}
          commands={[
            {
              title: 'Remove',
              type: 'None',
              buttonOption: {
                iconCss: 'e-icons e-close',
                cssClass: 'e-flat e-grid-remove text-amber-500',
              }
            }
          ]}
        />
        // <ColumnDirective
        //   key="R"
        //   allowEditing={false}
        //   field=""
        //   headerText=""
        //   template={removeTemplate}
        //   width={removeButtonWidth || 30}
        // />
      );
    }

    if (hasCheckBoxSelection) {
      colDirectives.unshift(
        <ColumnDirective key="X" type="checkbox" width="50" headerTemplate={selectHeaderTemplate} />
      );
    }
    return colDirectives;
  }

  function handleCommandClick(args: any) {
    const rowData = args.rowData;
    const buttonClass = args.commandColumn?.buttonOption?.cssClass;
    if (buttonClass?.includes('e-grid-edit')) {
      // console.log('Edit action triggered for:', rowData);
      onEdit?.(rowData);
      return
    }
    if (buttonClass?.includes('e-grid-delete')) {
      // console.log('Delete action triggered for:', rowData);
      onDelete?.(rowData);
      return
    }
    if (buttonClass?.includes('e-grid-preview')) {
      // console.log('Delete action triggered for:', rowData);
      onPreview?.(rowData);
      return
    }
    if (buttonClass?.includes('e-grid-remove')) {
      // console.log('Delete action triggered for:', rowData);
      onRemove?.(rowData);
      return
    }
  }

  function indexColumnTemplate(props: any) {
    const idx: number = +props.index + 1;
    return idx;
  }

  // Custom header template function
  function selectHeaderTemplate() {
    return <div></div>; // Empty div removes the checkbox, or add custom content if desired
  }

  return {
    getAggrColDirectives,
    getColumnDirectives,
    handleCommandClick,
    loading,
    loadDataLocal,
    selectedData
  };
}

// function editTemplate(props: any) {
//   return (
//     // WidgetTooltip not working here
//     <Button
//       tooltip="Edit"
//       type="button"
//       tooltipOptions={{
//         position: "top",
//         mouseTrack: true,
//         mouseTrackTop: 10
//       }}
//       // <button
//       className="w-7 h-7 bg-slate-50 hover:bg-slate-200 "
//       onClick={() => {
//         if (onEdit) {
//           onEdit(props);
//         }
//       }}
//     >
//       <IconEdit1 className="w-5 h-5 text-green-600 ml-1" />
//     </Button>
//   );
// }

// function deleteTemplate(props: any) {
//   return (
//     <Button
//       tooltip="Delete"
//       type="button"
//       tooltipOptions={{
//         position: "top",
//         mouseTrack: true,
//         mouseTrackTop: 10
//       }}
//       className="w-7 h-7 bg-slate-50 hover:bg-slate-300"
//       onClick={() => {
//         if (onDelete) {
//           onDelete(props.id, props.isUsed);
//         }
//       }}
//     >
//       <IconDelete className="w-5 h-5 text-red-500 ml-1" />
//     </Button>
//   );
// }

// function previewTemplate(props: any) {
//   return (
//     <Button
//       tooltip="Preview"
//       type="button"
//       tooltipOptions={{
//         position: "top",
//         mouseTrack: true,
//         mouseTrackTop: 10
//       }}
//       className="w-7 h-7 bg-slate-50 hover:bg-slate-200"
//       onClick={() => {
//         if (onPreview) {
//           onPreview(props);
//         }
//       }}
//     >
//       <IconPreview className="w-5 h-5 text-blue-600 ml-1" />
//     </Button>
//   );
// }

// function removeTemplate(props: any) {
//   return (
//     <Button
//       className="w-7 h-7 bg-slate-50 hover:bg-slate-200 "
//       onClick={() => {
//         if (onRemove) {
//           onRemove(props);
//         }
//       }}
//     >
//       <IconCross className="w-5 h-5 text-red-500 ml-1" />
//     </Button>
//   );
// }