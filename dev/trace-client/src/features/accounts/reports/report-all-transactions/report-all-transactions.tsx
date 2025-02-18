import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
// import { Utils } from "../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import ReportAllTransactionsFilter  from "./report-all-transactions-filter";

export function ReportAllTransactions() {
    const instance: string = DataInstancesMap.reportAllTransactions
    const {
        branchId
        , buCode
        // , context
        , currentDateFormat
        , dbName
        // , decFormatter
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()

    return (<CompAccountsContainer MiddleCustomControl={() => <ReportAllTransactionsFilter />}>
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            // CustomControl={() => <BankReconCustomControls instance={instance} meta={meta} />}
            minWidth="1000px"
            title='All transactions'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={true}
            isLastNoOfRows={true}
            instance={instance}
        />
        <CompSyncFusionGrid
            aggregates={getAggregates()}
            buCode={buCode}
            className="mr-6 mt-4"
            columns={getColumns()}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            deleteColumnWidth={40}
            editColumnWidth={40}
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
                startDate: '2023-04-01',
                tranTypeId: 2
            }}
            sqlId={SqlIdsMap.getAllTransactions}
        />
    </CompAccountsContainer>)

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'autoRefNo',
                field: 'autoRefNo',
                format: 'N0',
                type: 'Count',
                footerTemplate: (props: any) => <span>Count: {`${props?.['autoRefNo - count'] || 0}`}</span>
            },
            {
                columnName: 'debit',
                field: 'debit',
                format: 'N2',
                type: 'Sum',
            },
            {
                columnName: 'credit',
                field: 'credit',
                format: 'N2',
                type: 'Sum',
            },
        ])
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'index',
                headerText: '#',
                width: 70,
                textAlign: 'Left',
                type: 'number',
            },
            {
                field: 'id',
                headerText: 'Id',
                width: 90,
                textAlign: 'Left',
                type: 'number',
            },
            {
                field: 'tranDate',
                headerText: 'Tr date',
                width: 90,
                textAlign: 'Left',
                type: 'date',
                format: currentDateFormat,
            },
            {
                field: 'autoRefNo',
                headerText: 'Ref no',
                width: 150,
                textAlign: 'Left',
                type: 'string'
            },
            {
                field: 'accName',
                headerText: 'Acc name',
                width: 150,
                textAlign: 'Left',
                type: 'string',
            },
            {
                field: 'debit',
                headerText: 'Debits',
                width: 150,
                textAlign: 'Right',
                type: 'number',
                format: 'N2'
            },
            {
                field: 'credit',
                headerText: 'Credits',
                width: 150,
                textAlign: 'Right',
                type: 'number',
                format: 'N2'
            },
            {
                field: 'instrNo',
                headerText: 'Instr',
                type: 'string',
                width: 200
            },
            {
                field: 'userRefNo',
                headerText: 'User ref',
                type: 'string',
                width: 150
            },
            {
                field: 'remarks',
                headerText: 'Remarks',
                type: 'string',
                width: 250
            },
            {
                field: 'lineRefNo',
                headerText: 'Line ref',
                type: 'string',
                width: 250
            },
            {
                field: 'lineRemarks',
                headerText: 'Line remarks',
                type: 'string',
                width: 250
            },
            {
                field: 'tags',
                headerText: 'Tags',
                type: 'string',
                width: 90
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