import { useSelector } from "react-redux"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { RootStateType } from "../../../../app/store/store"
import { compAppLoaderVisibilityFn } from "../../../../controls/redux-components/comp-slice"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { CompAppLoader } from "../../../../controls/redux-components/comp-app-loader"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { useEffect, useRef, useState } from "react"
import _ from "lodash"
// import { NumericEditTemplate } from "../../../../controls/components/numeric-edit-template"
// import { NumberFormatValues } from "react-number-format"
// import { useRef } from "react"
// import { queryCellInfo } from "@syncfusion/ej2-react-grids"

export function ManageCategoryHsn() {
    const [, setRefresh] = useState({})
    const instance = DataInstancesMap.manageCategoryHsn
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, instance))
    const selectedData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[instance]?.data
        return (ret)
    })
    // const editMeta = useRef<EditMetaType>({
    // })
    const meta = useRef<MetaType>({
        rows: []
    })

    const {
        buCode
        , context
        , dbName
        , decodedDbParamsObject
        // , finYearId
    } = useUtilsInfo()

    useEffect(() => {
        // console.log(selectedData)
        if (selectedData) {
            meta.current.rows = _.cloneDeep(selectedData)
            setRefresh({})
        }
    }, [selectedData])

    // const CustomEditTemplate = (args: any) => {
    //     console.log(args.column.field)
    //     return (
    //         <input
    //             type="text"
    //             value={args.column.value || ''}
    //             // onChange={(e) => args.setValue(e.target.value)}
    //             onChange={(e) => {
    //                 // args[args.column.field] = e.target.value
    //                 args.column.value = e.target.value
    //             }}
    //             className="e-input"
    //         />
    //     );
    // };

    return (<div className="flex flex-col">
        <button onClick={handleOnTest}>Test</button>
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
            // actionBegin={onActionBegin}
            actionComplete={onActionComplete}
            aggregates={getAggregates()}
            buCode={buCode}
            dataSource={meta.current.rows}

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
            onCellEdit={onCellEdit}
            // queryCellInfo={onQueryCellInfo}
            sqlId={SqlIdsMap.getLeafCategories}
            sqlArgs={{}}
            // onCellEdit={onCellEdit}
            // onDelete={handleOnDelete}
            onRowDataBound={onRowDataBound}
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
                customAttributes: {
                    class: 'grid-col-edit'
                },
                // editTemplate: (args: any) => (NumericEditTemplate(args, onHsnValueChanged, 0, false)),
                // editTemplate: CustomEditTemplate,
                field: 'hsn',
                headerText: 'HSN',
                type: 'number',
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

    function onCellEdit(args: any) { // clearDate set as tranDate
        console.log(args.value)
    }

    function handleOnTest() {
        const gridRef = context.CompSyncFusionGrid[instance].gridRef
        gridRef.current.closeEdit()
        gridRef.current.refresh()
        console.log(meta.current.rows)
    }

    function onRowDataBound(args: any) {
        console.log(args)
        // if ((args.data.origClearDate !== args.data.clearDate) || (args.data.clearRemarks !== args.data.clearRemarks)) {
        //     args.row.style.backgroundColor = '#d4edda'; // Light green for edited rows
        // }
    }

    // function onActionBegin(args: any) {
    //     if ((args.type === 'save') && (args.column.field === 'hsn')) {
    //         if (editMeta.current?.[args.rowData.id] !== undefined) {
    //             args.rowData[args.column.field] = editMeta.current?.[args.rowData.id]?.editedValue
    //         }
    //     }
    // }

    function onActionComplete(args: any) {
        if (args.type === 'save') {
            const currentData = args.data[args.column.field]
            if (args.previousData !== currentData) {
                // meta.current[args.data.id].isValueChanged = true
                // updateParentRecursive(args.data.id, currentData, args.previousData, args.column.field)
                const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
                if (gridRef) {
                    gridRef.current.endEdit()
                }
            }
        }
    }

    // function onHsnValueChanged(args: any, values: NumberFormatValues) {
    //     if (!editMeta.current[args.id]) {
    //         editMeta.current[args.id] = {}
    //     }
    //     editMeta.current[args.id].editedValue = values.floatValue
    // }

    // function onQueryCellInfo(args: any) {
    //     if (args.column.field === 'hsn') {
    //         if (args.column.isValueChanged) {
    //             args.cell.style.backgroundColor = 'lightgreen';
    //         } else {
    //             args.cell.style.backgroundColor = 'lightyellow';
    //         }
    //     }
    // }

}

// type EditMetaType = {
//     [key: string]: {
//         editedValue?: number
//     }
// }

type MetaType = {
    rows: any[]
}