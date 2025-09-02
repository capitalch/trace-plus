import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { ReportAllTransactionsFilterBar } from "./report-all-transactions-filter-bar";
import { AllTransactionsFilterType, setAllTransactionFilter } from "../../accounts-slice";
import { useEffect, useState } from "react";
import { Utils } from "../../../../utils/utils";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { format } from "date-fns";
import { transactionTypes } from "./export-constants";
import { currentFinYearSelectorFn, FinYearType } from "../../../login/login-slice";
import { CompInstances } from "../../../../controls/redux-components/comp-instances";
import { showCompAppLoader } from "../../../../controls/redux-components/comp-slice";
import useDeepCompareEffect from "use-deep-compare-effect";

export function ReportAllTransactions() {
    const dispatch: AppDispatchType = useDispatch()
    const [apiData, setApiData] = useState<any[]>([])
    const instance: string = DataInstancesMap.reportAllTransactions
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn) || Utils.getRunningFinYear()
    const {
        branchId
        , buCode
        , context
        , currentDateFormat
        , dbName
        , decodedDbParamsObject
        , finYearId
    } = useUtilsInfo()

    const selectedAllTransactionsFilter: AllTransactionsFilterType = useSelector((state: RootStateType) => state.accounts.allTransactionsFilter, shallowEqual)

    useDeepCompareEffect(() => {
        dispatch(setAllTransactionFilter({
            ...selectedAllTransactionsFilter,
            startDate: currentFinYear.startDate,
            endDate: currentFinYear.endDate
        }))
    }, [currentFinYear])

    useDeepCompareEffect(() => {
        if (selectedAllTransactionsFilter.startDate) {
            loadData()
        }
    }, [selectedAllTransactionsFilter])

    useEffect(() => {
        loadData()
    }, [buCode, branchId, finYearId])

    return (
        <CompAccountsContainer className="z-0">
            <CompSyncFusionGridToolbar className='mt-2 mr-6'
                CustomControl={() => <ReportAllTransactionsFilterBar />}
                minWidth="1000px"
                title='All transactions'
                isPdfExport={false}
                isExcelExport={false}
                isCsvExport={true}
                instance={instance}
            />
            <CompSyncFusionGrid
                aggregates={getAggregates()}
                allowPaging={true}
                buCode={buCode}
                className="mt-4 mr-6"
                columns={getColumns()}
                dataSource={apiData}
                dbName={dbName}
                dbParams={decodedDbParamsObject}
                deleteColumnWidth={40}
                editColumnWidth={40}
                hasIndexColumn={false}
                height="calc(100vh - 295px)"
                instance={instance}
                loadData={loadData}
                minWidth="1400px"
                onEdit={handleOnEdit}
                onDelete={handleOnDelete}
            />
        </CompAccountsContainer>
    )

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
                field: '',
                headerText: 'Type',
                width: 80,
                type: 'string',
                template: (args: any) => getKeyByValue(args.tranTypeId)
            },
            {
                field: 'accName',
                headerText: 'Account',
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
            {
                field: 'timestamp',
                headerText: 'Timestamp',
                type: 'string',
                width: 140,
                template: (args: any) => <span>{format(args.timestamp, `${currentDateFormat}:HH mm`)}</span>
            },
        ])
    }

    function getKeyByValue(value: number | null): string | undefined {
        return (Object.keys(transactionTypes).find((key: string) => transactionTypes[key].value === value))
    }

    async function handleOnDelete(id: string | number) {
        const loadData = context.CompSyncFusionGrid[instance].loadData
        Utils.showDeleteConfirmDialog(async () => {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: AllTables.TranH.name,
                    deletedIds: [id]
                })
                if (loadData) {
                    loadData()
                }
            } catch (e: any) {
                console.log(e)
            }
        })
    }

    function handleOnEdit() {

    }

    async function loadData() {
        const state: RootStateType = Utils.getReduxState();
        const buCode = state.login.currentBusinessUnit?.buCode;
        const finYearId = state.login.currentFinYear?.finYearId;
        const branchId = state.login.currentBranch?.branchId;
        const startDate:string = state.accounts.allTransactionsFilter.startDate //|| currentFinYear.startDate;
        const endDate:string = state.accounts.allTransactionsFilter.endDate //|| currentFinYear.endDate;
        const tranTypeId: number | null = state.accounts.allTransactionsFilter.transactionType ? transactionTypes[state.accounts.allTransactionsFilter.transactionType]?.value : null;
        const dateType: string = state.accounts.allTransactionsFilter.dateType //|| 'entryDate'; // entryDate or transactionDate
        dispatch(showCompAppLoader({
            isVisible: true,
            instance: CompInstances.compAppLoader
        }))
        try {
            const res: any = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject,
                instance: instance,
                sqlArgs: {
                    dateFormat: currentDateFormat,
                    endDate: endDate,
                    finYearId: finYearId,
                    branchId: branchId,
                    startDate: startDate , 
                    tranTypeId: tranTypeId, 
                    noOfRows: null,
                    dateType: dateType
                },
                sqlId: SqlIdsMap.getAllTransactions
            })
            setApiData(res || []) // Set the data to state
    
        } catch (e: any) {
            console.log(e)
        } finally {
            dispatch(showCompAppLoader({
                isVisible: false,
                instance: CompInstances.compAppLoader
            }))
        }
    }
}