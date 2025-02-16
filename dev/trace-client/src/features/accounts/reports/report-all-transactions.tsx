import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map";
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map";
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container";
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../utils/utils-info-hook";

export function ReportAllTransactions() {
    const instance: string = DataInstancesMap.reportAllTransactions
    const {
        branchId
        , buCode
        // , context
        , currentDateFormat
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()

    return (<CompAccountsContainer>
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            // CustomControl={() => <BankReconCustomControls instance={instance} meta={meta} />}
            minWidth="1000px"
            title='All transactions'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            isLastNoOfRows={false}
            instance={instance}
        />
        <CompSyncFusionGrid
            // aggregates={getAggregates()}
            buCode={buCode}
            className="mr-6 mt-4"
            columns={getColumns()}
            // dataSource={meta?.current?.rows || []}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            hasIndexColumn={false}
            height="calc(100vh - 240px)"
            instance={instance}
            isLoadOnInit={true}
            // loadData={loadData}
            minWidth="1400px"
            // onCellEdit={handleCellEdit}
            onEdit={handleOnEdit}
            onDelete={handleOnDelete}
            onRowDataBound={onRowDataBound}
            sqlArgs={{
                dateFormat: currentDateFormat,
                endDate: '2024-03-31',
                finYearId: finYearId,
                branchId: branchId,
                no: 100,
                startDate: '2023-04-01',
                tranTypeId: 2
            }}
            sqlId={SqlIdsMap.getAllTransactions}
        />
    </CompAccountsContainer>)

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                allowEditing: false,
                field: 'tranDate',
                headerText: 'Tr date',
                width: 90,
                textAlign: 'Left',
                type: 'date',
                format: currentDateFormat,
            },
            {
                allowEditing: false,
                field: 'autoRefNo',
                headerText: 'Ref no',
                width: 160,
                textAlign: 'Left',
                type: 'string'
            },
            {
                allowEditing: false,
                field: 'debit',
                headerText: 'Debits',
                width: 150,
                textAlign: 'Right',
                type: 'number',
                format: 'N2'
            },
            {
                allowEditing: false,
                field: 'credit',
                headerText: 'Credits',
                width: 150,
                textAlign: 'Right',
                type: 'number',
                format: 'N2'
            },
            {
                allowEditing: false,
                field: 'info',
                headerText: 'Info',
                type: 'string',
                width: 300
            },
        ])
    }

    function handleOnDelete() {

    }

    function handleOnEdit() {

    }

    function onRowDataBound() {

    }
}