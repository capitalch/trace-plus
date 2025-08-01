import { ChangeEvent, ReactElement, useEffect, } from "react"
import { DataInstancesMap } from "../../../../app/maps/data-instances-map"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { Utils } from "../../../../utils/utils"
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map"
import { CompGenericSwitch } from "../../../../controls/components/comp-generic-switch"
import { AppDispatchType } from "../../../../app/store"
import { useDispatch } from "react-redux"
import { SlidingPaneEnum, SlidingPaneMap, } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map"
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice"
import { IconPlus } from "../../../../controls/icons/icon-plus"
import { AccountsAddGroupModal } from "./accounts-add-group-modal"
import { IconEdit1 } from "../../../../controls/icons/icon-edit1"
import { IconCross } from "../../../../controls/icons/icon-cross"
import { AllTables } from "../../../../app/maps/database-tables-map"
import { AccountsAddChildModal } from "./accounts-add-child-modal"
import { AccountsEditModal } from "./accounts-edit-modal"

export function AccountsMaster() {
    const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.accountsMaster

    const {
        buCode
        , context
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    useEffect(() => {
        const loadData = context?.CompSyncFusionTreeGrid[instance]?.loadData
        if (loadData && buCode) {
            loadData()
        }
    }, [buCode])

    return (<CompAccountsContainer>
        <CompSyncFusionTreeGridToolbar className="mt-2"
            title='Accounts master'
            isLastNoOfRows={false}
            instance={instance}
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            addUniqueKeyToJson={true}
            aggregates={getAggregates()}
            buCode={buCode}
            childMapping="children"
            className="mr-6"
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            graphQlQueryFromMap={GraphQLQueriesMap.accountsMaster}
            graphQlQueryName={GraphQLQueriesMapNames.accountsMaster}
            columns={getColumns()}
            height="calc(100vh - 227px)"
            instance={instance}
            minWidth='950px'
            treeColumnIndex={0}
        />
    </CompAccountsContainer>)

    function actionHeaderTemplate() {
        return (<div className="flex justify-start items-center h-full">
            <button onClick={handleActionHeaderOnClick}
                className="e-btn flex w-full justify-start font-semibold text-blue-500 items-center rounded-md hover:text-blue-700 hover:bg-blue-50 border-none  focus:bg-blue-50 focus:text-blue-500">
                <IconPlus className="w-4 h-4 mr-4" />
                ADD GROUP
            </button>
        </div>)
        function handleActionHeaderOnClick() {
            Utils.showHideModalDialogA({
                title: "Add group account",
                isOpen: true,
                element: <AccountsAddGroupModal />,
            })
        }
    }

    function actionTemplate(props: AccountsMasterType) {
        const isDelButtonVisible: boolean = !((props.isPrimary) || (props.hasChildRecords)) // Not visible for primary and those having children
        const isEditButtonVisible: boolean = !props.isPrimary
        const isAddChildButtonVisible: boolean = ['L', 'N'].includes(props.accLeaf)

        return (<div className="flex items-center h-full justify-start">

            {/* Add child */}
            {isAddChildButtonVisible && <button onClick={handeleOnClickAddChild} className="flex font-medium justify-center items-center text-xs text-blue-700">
                <IconPlus className="w-3 h-3 mr-1.5" />
                CHILD
            </button>}

            {/* Edit self */}
            {isEditButtonVisible && <button onClick={handeleOnClickEditSelf} className="flex font-medium justify-center items-center ml-4 text-xs text-green-700">
                <IconEdit1 className="w-3 h-3 mr-1.5" />
                EDIT
            </button>}

            {/* Delete */}
            {isDelButtonVisible && <button onClick={handeleOnClickDelete} className="flex font-medium justify-center items-center ml-4 text-xs text-red-700">
                <IconCross className="w-4 h-4 mr-1" />
                DEL
            </button>}
        </div>)

        function handeleOnClickAddChild() {
            Utils.showHideModalDialogA({
                title: `Add child for ${props.accName}`,
                isOpen: true,
                element: <AccountsAddChildModal accId={props.id} accLeaf={props.accLeaf} accType={props.accType} classId={props.classId} />,
            })
        }

        function handeleOnClickEditSelf() {
            Utils.showHideModalDialogA({
                title: `Edit ${props.accName}`,
                isOpen: true,
                element: <AccountsEditModal
                    accCode={props.accCode}
                    accId={props.id}
                    accLeaf={props.accLeaf}
                    accName={props.accName}
                    accType={props.accType}
                    hasChildRecords={props.hasChildRecords}
                    parentId={props.parentId} />,
            })
        }

        function handeleOnClickDelete() {
            Utils.showDeleteConfirmDialog(async () => {
                try {
                    await Utils.doGenericDelete({
                        buCode: buCode || '',
                        deletedIds: [props.id],
                        tableName:AllTables.AccM.name
                    })
                    Utils.showSaveMessage()
                    Utils.loadDataInTreeGridWithSavedScrollPos(context, instance)
                } catch (e: any) {
                    console.log(e)
                }
            })
        }
    }

    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'accName',
                headerText: 'Account name',
                width: 250,
                textAlign: 'Left'
            },
            {
                field: '',
                headerTemplate: actionHeaderTemplate,
                template: actionTemplate,
                width: 200,
            },
            {
                field: 'accCode',
                headerText: 'Acc code',
                width: 200,
                textAlign: 'Left'
            },
            {
                field: 'isPrimary',
                headerText: 'Primary',
                width: 80,
                textAlign: 'Left',
                type: 'boolean',
                template: (props: any) => props.isPrimary ? 'Yes' : 'No'
            },
            {
                field: 'accType',
                headerText: 'Type',
                width: 80,
                textAlign: 'Left',
                template: accTypeTemplate
            },
            {
                field: 'accClass',
                headerText: 'Class',
                width: 80,
                textAlign: 'Left'
            },
            {
                field: 'accLeaf',
                headerText: 'Level',
                width: 80,
                textAlign: 'Left',
                template: accGroupTemplate
            },
            {
                field: '',
                headerText: 'Address',
                width: 100,
                textAlign: 'Left',
                template: accAddressTemplate
            },
            {
                field: '',
                headerText: 'Auto sub',
                textAlign: 'Left',
                template: autoSubledgerTemplate
            },
        ])
    }

    function accAddressTemplate(props: AccountsMasterType) {
        let filled: string = 'Empty'
        let ret: ReactElement = <></>
        if (props?.isAddressExists) {
            filled = 'Filled'
        }
        const comp: ReactElement =
            <button onClick={() =>
                setIsPaneOpen(props.id || 0, props.isAddressExists)} className="flex h-8 w-20 items-center rounded-full bg-blue-500 pl-1 pr-2 py-2 text-gray-100 shadow-sm">
                {/* Badge section */}
                {(filled === 'Filled') && <div className="rounded-full bg-blue-800 px-2 py-1 text-xs font-bold text-white">
                    A
                </div>}
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                    {filled}
                </span>
            </button>
        if (props.addressable) {
            ret = comp
        }
        return (ret)
    }

    function accGroupTemplate(props: AccountsMasterType): string {
        const logicObject: any = {
            'L': 'Ledger',
            'N': 'Group',
            'S': 'Subledger',
            'Y': 'Leaf',
        }
        return (logicObject[props.accLeaf])
    }

    function accTypeTemplate(props: AccountsMasterType): string {
        const logicObject: any = {
            A: 'Asset',
            L: 'Liability',
            E: 'Expence',
            I: 'Income'
        }
        return (logicObject?.[props.accType] || '')
    }

    function autoSubledgerTemplate(props: AccountsMasterType) {
        const isVisible: boolean = (props.accLeaf === 'L') && props.accClass === 'debtor'
        const isDisabled: boolean = (props?.children && (props.children.length > 0)) ? true : false
        return (isVisible && <CompGenericSwitch
            customData={props}
            defaultChecked={props.isAutoSubledger}
            disabled={isDisabled}
            onChange={handleOnChangeSwitch}
        />)
    }

    function getAggregates(): SyncFusionTreeGridAggregateColumnType[] {
        return ([
            {
                columnName: 'accName',
                field: 'accName',
                type: 'Count',
                footerTemplate: (props: any) => `Count: ${props['accName - count']}`,
            }
        ])
    }

    async function handleOnChangeSwitch(event: ChangeEvent<HTMLInputElement>, props: AccountsMasterType) {
        let isSuccess: boolean = false
        const accId: number = props.id
        try {
            const res: any = await Utils.doGenericUpdateQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject,
                sqlId: SqlIdsMap.upsertAutoSubledger,
                sqlArgs: {
                    accId: accId,
                    isAutoSubledger: event.target.checked
                }
            })
            isSuccess = Boolean(res)
        } catch (e: any) {
            console.log(e)
        }
        Utils.loadDataInTreeGridWithSavedScrollPos(context, instance)
        return (isSuccess)
    }

    function setIsPaneOpen(accId: number, isAddressExists: boolean | undefined) {
        Utils.treeGridUtils.saveScrollPos(context, instance) // Save scroll pos for contact and addresses
        const props = SlidingPaneMap[SlidingPaneEnum.contactAndAddresses].props
        props.accId = accId || 0
        props.isAddressExists = isAddressExists || false
        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.contactAndAddresses,
            title: isAddressExists ? 'Edit contact and addresses' : 'New contact and addresses',
            width: '600px'
        }))
    }
}

export type AccountsMasterType = {
    accClass: string
    accCode: string
    accLeaf: 'Y' | 'N' | 'L' | 'S'
    accName: string
    accType: 'A' | 'L' | 'E' | 'I'
    addressable?: boolean
    children?: [AccountsMasterType | null] | null
    classId: number
    extBusinessContactsAccMId?: number
    hasChildRecords: boolean
    id: number
    isAddressExists?: boolean
    isAutoSubledger?: boolean
    isPrimary: boolean
    parentId: number
}