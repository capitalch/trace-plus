import { useSelector } from "react-redux"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { RootStateType } from "../../../../app/store/store"
import { compAppLoaderVisibilityFn } from "../../../../controls/redux-components/comp-slice"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { CompAppLoader } from "../../../../controls/redux-components/comp-app-loader"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { NumericEditTemplate } from "../../../../controls/components/numeric-edit-template"
import { NumberFormatValues } from "react-number-format"
import { useRef } from "react"
// import { queryCellInfo } from "@syncfusion/ej2-react-grids"

export function ManageCategoryHsn() {
    const instance = DataInstancesMap.manageCategoryHsn
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, instance))
    const editMeta = useRef<EditMetaType>({
    })
    const {
        buCode
        // , context
        , dbName
        , decodedDbParamsObject
        // , finYearId
    } = useUtilsInfo()

    return (<div className="flex flex-col">
        {/* <CompSyncFusionGridToolbar className='mt-2 mr-6'
            CustomControl={() => <BankReconCustomControls instance={instance} meta={meta} />}
            minWidth="1000px"
            title='Bank reconcillation'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            isLastNoOfRows={false}
            instance={instance}
        /> */}

        <CompSyncFusionGrid
            aggregates={getAggregates()}
            buCode={buCode}
            className="mr-6 mt-4"
            columns={getColumns()}
            // dataSource={meta?.current?.rows || []}
            // deleteColumnWidth={40}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            editSettings={{
                allowEditing: true,
                mode: 'Batch',
                showConfirmDialog: false,
            }}
            hasIndexColumn={false}
            height="calc(100vh - 240px)"
            instance={instance}

            isLoadOnInit={false}
            // loadData={loadData}
            minWidth="550px"
            queryCellInfo={onQueryCellInfo}
            sqlId={SqlIdsMap.getLeafCategories}
            sqlArgs={{}}
        // onCellEdit={onCellEdit}
        // onDelete={handleOnDelete}
        // onRowDataBound={onRowDataBound}
        />
        {isVisibleAppLoader && <CompAppLoader />}
    </div>)

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'catName',
                field: 'catName',
                format: 'N0',
                type: 'Count',
                footerTemplate: (props: any) => <span>Count: {`${props?.['catName - count'] || 0}`}</span>
            },
        ])
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                allowEditing: false,
                field: 'catName',
                headerText: 'Leaf category name',
                width: 200
            },
            {
                allowEditing: true,
                editTemplate: (args: any) => (NumericEditTemplate(args, onHsnValueChanged, 0, false)),
                // editType:'numericedit',
                field: 'hsn',
                headerText: 'HSN',
                width: 100
            },
            {
                allowEditing: false,
                field: 'descr',
                headerText: 'Description',
                width: 200
            },
            {
                allowEditing: false,
                field: 'id',
                headerText: 'id',
                width: 0,
                visible: false,
                isPrimaryKey: true
            },
        ])
    }

    function onHsnValueChanged(args: any, values: NumberFormatValues) {
        if (!editMeta.current[args.id]) {
            editMeta.current[args.id] = {}
        }
        editMeta.current[args.id].editedValue = values.floatValue
    }

    function onQueryCellInfo(args: any) {
        if(args.column.field === 'hsn') {
            if (args.column.isValueChanged) {
                args.cell.style.backgroundColor = 'lightgreen';
            } else {
                args.cell.style.backgroundColor = 'lightyellow';
            }
        }
    }

}

type EditMetaType = {
    [key: string]: {
        editedValue?: number
    }
}