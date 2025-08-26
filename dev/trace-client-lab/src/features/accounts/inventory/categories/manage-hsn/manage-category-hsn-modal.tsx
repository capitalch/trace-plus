import { useEffect, useRef, useState } from "react"
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map"
import { useSelector } from "react-redux"
import { RootStateType } from "../../../../../app/store"
import { compAppLoaderVisibilityFn } from "../../../../../controls/redux-components/comp-slice"
import { useUtilsInfo } from "../../../../../utils/utils-info-hook"
import _ from "lodash"
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map"
import { CompAppLoader } from "../../../../../controls/redux-components/comp-app-loader"
import { Utils } from "../../../../../utils/utils"
import { Messages } from "../../../../../utils/messages"
import { AllTables } from "../../../../../app/maps/database-tables-map"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { IconSubmit } from "../../../../../controls/icons/icon-submit"


export function ManageCategoryHsn() {
    const [, setRefresh] = useState({})
    const instance = DataInstancesMap.manageCategoryHsn
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, instance))

    const selectedData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[instance]?.data
        return (ret)
    })

    const meta = useRef<MetaType>({
        rows: []
    })

    const {
        buCode
        , context
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        if (!_.isEmpty(selectedData)) {
            meta.current.rows = _.cloneDeep(selectedData)
            setRefresh({})
        }
    }, [selectedData])

    return (<div className="flex flex-col">
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            CustomControl={() => <SubmitButton handleOnSubmit={handleOnSubmit} />}
            minWidth="600px"
            title='Double click to edit'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            isLastNoOfRows={false}
            instance={instance}
        />

        <CompSyncFusionGrid
            actionComplete={onActionComplete}
            aggregates={getAggregates()}
            buCode={buCode}
            dataSource={meta.current.rows}
            className="mr-6 mt-4"
            columns={getColumns()}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            editSettings={{
                allowEditing: true,
                mode: 'Normal',
            }}
            hasIndexColumn={false}
            height="calc(100vh - 250px)"
            instance={instance}
            // isLoadOnInit={false}
            minWidth="550px"
            queryCellInfo={onQueryCellInfo}
            sqlId={SqlIdsMap.getLeafCategories}
            sqlArgs={{}}
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

    async function handleOnSubmit() {
        const gridRef: any = context.CompSyncFusionGrid[instance].gridRef
        if (gridRef) {
            gridRef.current.endEdit()
        }
        const changedValues = meta.current.rows
            .filter(item => item.isValueChanged)
            .map(({ id, hsn }) => ({ id, hsn }));
        if (_.isEmpty(changedValues)) {
            Utils.showAlertMessage('Warning', Messages.messNothingToDo)
            return
        }
        try {
            await Utils.doGenericUpdate({
                buCode: buCode || '',
                tableName: AllTables.CategoryM.name,
                xData: changedValues
            })
            const loadData = context.CompSyncFusionGrid[instance].loadData
            if (loadData) {
                await loadData()
            }
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e)
        }
    }

    function onActionComplete(args: any) {
        if (args.requestType === 'save') {
            const currentData = args.data['hsn']
            if (args.previousData['hsn'] !== currentData) {
                const item = meta.current.rows.find((x: any) => x.id === args.data.id)
                if (item) {
                    item.hsn = currentData // This line is important
                    item.isValueChanged = true
                    args.row.cells[1].style.backgroundColor = 'lightgreen';
                }
            }
        }
    }

    function onQueryCellInfo(args: any) {
        if (args.column.field === 'hsn') {
            args.cell.style.backgroundColor = 'lightyellow';
        }
    }

}

type MetaType = {
    rows: CategoryHsnType[]
}

type CategoryHsnType = {
    catName: string
    hsn: number
    descr: string
    id: number
    isValueChanged?: boolean
}

function SubmitButton({ handleOnSubmit }: { handleOnSubmit: () => void }) {
    return (<TooltipComponent content='Save changed HSN values to server' className="text-sm" cssClass="custom-tooltip">
        <button onClick={handleOnSubmit} type="button" className="px-5 py-2 font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-hidden focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200">
            <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit</button>
    </TooltipComponent>)
}