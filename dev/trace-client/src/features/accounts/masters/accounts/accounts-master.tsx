import { ChangeEvent, ReactElement } from "react"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { CompInstances } from "../../../../controls/redux-components/comp-instances"
import { CompSwitch } from "../../../../controls/redux-components/comp-switch"
import { Utils } from "../../../../utils/utils"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"

export function AccountsMaster() {
    const instance: string = DataInstancesMap.accountsMaster
    const {
        // branchId
        buCode
        // , context
        , dbName
        , decodedDbParamsObject
        // , decFormatter
        // , finYearId
        // , intFormatter
    } = useUtilsInfo()

    return (<CompAccountsContainer>

        <CompSyncFusionTreeGridToolbar className="mt-2"
            // CustomControl={() => <CompSwitch instance={CompInstances.compSwitchTrialBalance} className="" leftLabel="All branches" rightLabel="" />}
            title='Accounts master'
            // isAllBranches={isAllBranches}
            isLastNoOfRows={false}
            instance={instance}
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            // aggregates={getTrialBalanceAggregates()}
            buCode={buCode}
            childMapping="children"
            className="mr-6"
            dataPath="accountsMaster"
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            graphQlQueryFromMap={GraphQLQueriesMap.accountsMaster}
            isLoadOnInit={true}
            columns={getColumns()}
            height="calc(100vh - 215px)"
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
                width: 100,
                textAlign: 'Left'
            },
            {
                field: 'isPrimary',
                headerText: 'Primary',
                width: 100,
                textAlign: 'Left',
                type: 'boolean',
                template: (props: any) => props.isPrimary ? 'Yes' : 'No'
            },
            {
                field: 'accType',
                headerText: 'Type',
                width: 100,
                textAlign: 'Left',
                template: accTypeTemplate
            },
            {
                field: 'accClass',
                headerText: 'Class',
                // width: 100,
                textAlign: 'Left'
            },
            {
                field: 'accLeaf',
                headerText: 'Level',
                // width: 100,
                textAlign: 'Left',
                template: accGroupTemplate
            },
            {
                field: '',
                headerText: 'Address',
                // width: 100,
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
        const comp: ReactElement = <TooltipComponent content='No address provided'>
            <button className="flex h-8 w-50 items-center rounded-full bg-blue-500 pl-1 pr-2 py-2 text-gray-100 shadow">
                {/* Badge section */}
                {(filled === 'Filled') && <div className="rounded-full bg-blue-800 px-2 py-1 text-xs font-bold text-white">
                    A
                </div>}
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                    {filled}
                </span>
            </button>
        </TooltipComponent>
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
        const instance = `${CompInstances.compSwitchAccountsMasterRow}-${props.id}` // instance is unique for each row
        const isVisible: boolean = (props.accLeaf === 'L') && props.accClass === 'debtor'
        const isDisabled: boolean = (props?.children && (props.children.length > 0)) ? true : false
        return (isVisible && <TooltipComponent content='Auto subledger'>
            <CompSwitch
                customData={{ accId: props.id }}
                defaultValue={props.isAutoSubledger}
                instance={instance}
                isDisabled={isDisabled}
                onChange={handleOnChangeCompSwitch}
            />
        </TooltipComponent>)
    }

    async function handleOnChangeCompSwitch(event: ChangeEvent<HTMLInputElement>, customData?: any) {
        let isSuccess: boolean = false
        const accId: number = customData?.accId
        console.log(event.target.checked,event.target.value)
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
        return (isSuccess)
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
    id?: number
    isAddressExists?: boolean
    isAutoSubledger?: boolean
    isPrimary: boolean
}