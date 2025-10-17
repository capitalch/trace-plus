import { FC, useEffect } from "react";
import { GraphQLQueryArgsType } from "../../../app/maps/graphql-queries-map";
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
import { RootStateType } from "../../../app/store";

export function useCompSyncFusionGrid({
  aggregates,
  buCode,
  columns,
  dataSource,
  dbName,
  dbParams,
  copyColumnWidth,
  deleteColumnWidth,
  editColumnWidth,
  hasCheckBoxSelection,
  hasIndexColumn,
  indexColumnWidth,
  instance,
  loadData,
  onCopy,
  onDelete,
  onEdit,
  onPreview,
  onRemove,
  onZoomIn,
  previewColumnWidth,
  removeButtonWidth,
  sqlId,
  sqlArgs,
  zoomInColumnWidth
}: CompSyncFusionGridType) {
  const selectedLastNoOfRows: any = useSelector(
    (state: RootStateType) => state.queryHelper[instance]?.lastNoOfRows
  );

  // Create a local copy of sqlArgs with noOfRows to avoid mutating props
  const sqlArgsWithNoOfRows = sqlArgs ? {
    ...sqlArgs,
    noOfRows: selectedLastNoOfRows === undefined ? 100 : selectedLastNoOfRows || null
  } : undefined;

  const args: GraphQLQueryArgsType = {
    buCode: buCode,
    dbParams: dbParams,
    sqlId: sqlId,
    sqlArgs: sqlArgsWithNoOfRows
  };

  const { loadData: loadDataLocal, loading } = useQueryHelper({
    dbName: dbName,
    getQueryArgs: () => args,
    instance: instance,
  });

  useEffect(() => {
    if (!(loadData || dataSource)) {
      // For custom loadData the loading should be taken care of in the calling code
      loadDataLocal();
    }
  }, [selectedLastNoOfRows, loadData, dataSource, loadDataLocal]);

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

    if (onCopy) {
      colDirectives.unshift(
        <ColumnDirective
          headerText="C"
          width={copyColumnWidth || "40"}
          commands={[
            {
              title: 'Copy',
              type: 'None',
              buttonOption: {
                content: '❋', // fallback icon using emoji
                cssClass: 'e-flat e-grid-copy text-purple-600',
              }
            }
          ]}
        />
      );
    }

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
      );
    }

    if (onZoomIn) {
      colDirectives.unshift(
        <ColumnDirective
          headerText=""
          width={zoomInColumnWidth || "40"}
          commands={[
            {
              title: 'Zoom In',
              type: 'None',
              buttonOption: {
                iconCss: 'e-icons e-search',
                cssClass: 'e-flat e-grid-zoomin text-indigo-600',
              }
            }
          ]}
        />
      );
    }

    if (hasIndexColumn) {
      colDirectives.unshift(
        <ColumnDirective
          key="#"
          allowEditing={false}
          // field=""
          field="__rowIndex"
          headerText="#"
          template={indexColumnTemplate}
          // valueAccessor={(field: string, data: any, column: any) => {
          //   // This gets called with proper context
          //   return data.index !== undefined ? data.index + 1 : '';
          // }}
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
    const id = args.rowData.id;
    const buttonClass = args.commandColumn?.buttonOption?.cssClass;
    if (buttonClass?.includes('e-grid-edit')) {
      onEdit?.(rowData);
      return
    }
    if (buttonClass?.includes('e-grid-delete')) {
      onDelete?.(id);
      return
    }
    if (buttonClass?.includes('e-grid-preview')) {
      onPreview?.(rowData);
      return
    }
    if (buttonClass?.includes('e-grid-zoomin')) {
      onZoomIn?.(rowData);
      return
    }
    if (buttonClass?.includes('e-grid-remove')) {
      onRemove?.(rowData);
      return
    }
    if (buttonClass?.includes('e-grid-copy')) {
      onCopy?.(rowData);
      return;
    }
  }

  function indexColumnTemplate(props: any) {
    const idx: number =  +(props.index ?? -1) + 1;
    // const idx: number = props.index !== undefined && props.index !== null
    // ? +props.index + 1
    // : 0;
    // const idx: number = props.index !== undefined
    //   ? +props.index + 1
    //   : (props.__index !== undefined ? +props.__index + 1 : 1);
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