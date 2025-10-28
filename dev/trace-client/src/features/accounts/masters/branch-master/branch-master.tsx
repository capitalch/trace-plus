import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/redux-components/comp-accounts-container";
import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { AllTables} from "../../../../app/maps/database-tables-map";
import { NewEditBranchType } from "./new-edit-branch";
import { openSlidingPane, setCompAccountsContainerMainTitle } from "../../../../controls/redux-components/comp-slice";
import { SlidingPaneEnum, SlidingPaneMap } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map";
import { NewBranchButton } from "./new-branch-button";
import { changeAccSettings } from "../../accounts-slice";
import { useEffect } from "react";
import { useBranchesPermissions } from "../../../../utils/permissions/permissions-hooks";

export function BranchMaster() {
    const instance = DataInstancesMap.branchMaster; // Grid instance for Business Units
    const dispatch: AppDispatchType = useDispatch()
    const { buCode, context, dbName, decodedDbParamsObject, } = useUtilsInfo()
    const { canCreate, canEdit, canDelete } = useBranchesPermissions()

    useEffect(() => {
        const loadData = context?.CompSyncFusionGrid[instance]?.loadData
        if (loadData && buCode) {
            loadData()
        }
    }, [buCode])

    // Set main title for Branch Master
    useEffect(() => {
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: "Branch Master" }));
    }, [dispatch]);

    return (<CompAccountsContainer >
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            CustomControl={canCreate ? () => <NewBranchButton /> : undefined}
            minWidth="400px"
            title=''
            isPdfExport={true}
            isExcelExport={true}
            isCsvExport={true}
            isLastNoOfRows={false}
            instance={instance}
            isRefresh={true}
        />

        <CompSyncFusionGrid
            aggregates={getAggregates()}
            buCode={buCode}
            className="mt-4 mr-6"
            columns={getColumns()}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            hasIndexColumn={true}
            height="calc(100vh - 240px)"
            instance={instance}
            minWidth="400px"
            onDelete={canDelete ? handleOnDelete : undefined}
            onEdit={canEdit ? handleOnEdit : undefined}
            sqlId={SqlIdsMap.getAllBranches}
            searchFields={['branchName', 'branchCode', 'remarks', 'addressSearch']}
        />
    </CompAccountsContainer>)

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'branchName',
                type: 'Count',
                field: 'branchName',
                format: 'N0',
                footerTemplate: branchNameAggrTemplate
            }
        ])
    }

    function branchNameAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>)
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'branchName',
                headerText: 'Branch name',
                type: 'string',
                width: 180,
            },
            {
                field: 'branchCode',
                headerText: 'Branch code',
                type: 'string',
                width: 100,
            },
            {
                field: 'address',
                headerText: 'Address',
                type: 'string',
                width: 250,
                template: addressTemplate
            },
            {
                field: 'remarks',
                headerText: 'Remarks',
                type: 'string',
            },
            {
                field: 'addressSearch',
                headerText: 'addressSearch',
                type: 'string',
                width: 0,
                visible:false
            },
        ])
    }

    function addressTemplate(props: any) {
        const jData = props.jData
        if (!jData || !jData.address) {
            return <span className="text-xs text-gray-400">No address</span>
        }

        const { address1, address2, pin, phones, email, stateCode } = jData.address
        const gstin = jData.gstin  // GSTIN is separate from address object
        const addressLine1 = address1 || ''
        const addressLine2 = address2 ? `, ${address2}` : ''
        const pinText = pin ? `, PIN: ${pin}` : ''
        const stateCodeText = stateCode ? `, State: ${stateCode}` : ''
        const addressText = `${addressLine1}${addressLine2}${pinText}${stateCodeText}`

        return (
            <div className="text-xs">
                <div className="truncate" title={addressText}>{addressText}</div>
                {phones && <div className="text-gray-500 truncate" title={phones}>Ph: {phones}</div>}
                {email && <div className="text-gray-500 truncate" title={email}>Email: {email}</div>}
                {gstin && <div className="text-gray-500 truncate" title={gstin}>GSTIN: {gstin}</div>}
            </div>
        )
    }

    async function handleOnDelete(id: string | number) {
        Utils.showDeleteConfirmDialog(doDelete)
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: AllTables.BranchM.name,
                    deletedIds: [id],
                })
                Utils.showSaveMessage()
                dispatch(changeAccSettings())
                const loadData = context.CompSyncFusionGrid[instance].loadData
                if (loadData) {
                    await loadData()
                }
            } catch (e: any) {
                console.log(e)
            }
        }
    }

    async function handleOnEdit(args: any) {
        const props: NewEditBranchType = SlidingPaneMap[SlidingPaneEnum.branchMaster].props

        // Parse address and gstin from jData (as separate fields)
        let address1 = ''
        let address2 = ''
        let pin = ''
        let phones = ''
        let email = ''
        let stateCode = ''
        let gstin = ''

        if (args.jData) {
            // Parse address object
            if (args.jData.address) {
                const addr = args.jData.address
                address1 = addr.address1 || ''
                address2 = addr.address2 || ''
                pin = addr.pin || ''
                phones = addr.phones || ''
                email = addr.email || ''
                stateCode = addr.stateCode || ''
            }

            // Parse gstin (separate from address)
            gstin = args.jData.gstin || ''
        }

        props.id = args.id
        props.branchCode = args.branchCode
        props.branchName = args.branchName
        props.remarks = args.remarks
        props.address1 = address1
        props.address2 = address2
        props.pin = pin
        props.phones = phones
        props.email = email
        props.stateCode = stateCode
        props.gstin = gstin

        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.branchMaster,
            title: 'Edit branch',
            width: '700px'  // Increased width for address fields
        }))
    }
}