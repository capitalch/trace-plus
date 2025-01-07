import { ChangeEvent, ReactElement, useEffect, } from "react"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridAggregateColumnType, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { Utils } from "../../../../utils/utils"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { GenericSwitch } from "./generic-switch"
import { AppDispatchType } from "../../../../app/store/store"
import { useDispatch } from "react-redux"
import { SlidingPaneEnum, SlidingPaneMap, } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map"
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice"

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
        //cleanup
        return (() => Utils.treeGridUtils.resetScrollPos(context, instance))
    }, [])

    return (<CompAccountsContainer>
        <CompSyncFusionTreeGridToolbar className="mt-2"
            title='Accounts master'
            isLastNoOfRows={false}
            instance={instance}
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            aggregates={getAggregates()}
            buCode={buCode}
            childMapping="children"
            className="mr-6"
            dataBound={onDataBound}
            dataPath="accountsMaster"
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            graphQlQueryFromMap={GraphQLQueriesMap.accountsMaster}
            isLoadOnInit={true}
            columns={getColumns()}
            height="calc(100vh - 245px)"
            instance={instance}
            minWidth='950px'
            treeColumnIndex={0}
        />
    </CompAccountsContainer>)

    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'accName',
                headerText: 'Account Name',
                width: 250,
                textAlign: 'Left'
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
                width: 80,
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
        // <TooltipComponent content={`${(filled === 'Filled') ? 'Address already provided' : 'Address required'}`}>
            <button onClick={() => setIsPaneOpen(props.id, isAddressExists)} className="flex h-8 w-50 items-center rounded-full bg-blue-500 pl-1 pr-2 py-2 text-gray-100 shadow">
                {/* Badge section */}
                {(filled === 'Filled') && <div className="rounded-full bg-blue-800 px-2 py-1 text-xs font-bold text-white">
                    A
                </div>}
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                    {filled}
                </span>
            </button>
        // </TooltipComponent>
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
        return (isVisible && <GenericSwitch
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
        const loadData = context.CompSyncFusionTreeGrid[instance].loadData
        const gridRef: any = context?.CompSyncFusionTreeGrid?.[instance]?.gridRef
        if (gridRef?.current) {
            Utils.treeGridUtils.saveScrollPos(context, instance)
        }
        if (loadData) {
            await loadData()
        }
        return (isSuccess)
    }

    function onDataBound() {
        Utils.treeGridUtils.restoreScrollPos(context, instance)
    }

    function setIsPaneOpen(id: number, isAddressExists: boolean) {
        SlidingPaneMap[SlidingPaneEnum.contactAndAddresses].props.accId = id
        SlidingPaneMap[SlidingPaneEnum.contactAndAddresses].props.isAddressExists = isAddressExists
        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.contactAndAddresses,
            title:'Contact and addresses',
            width: '600px'
        }))
    }
}

export type AccountsMasterType = {
    accClass?: string
    accCode?: string
    accLeaf: 'Y' | 'N' | 'L' | 'S'
    accName?: string
    accType: 'A' | 'L' | 'E' | 'I'
    addressable?: boolean
    children?: [AccountsMasterType | null] | null
    classId?: number
    extBusinessContactsAccMId?: number
    id: number
    isAddressExists?: boolean
    isAutoSubledger?: boolean
    isPrimary: boolean
}