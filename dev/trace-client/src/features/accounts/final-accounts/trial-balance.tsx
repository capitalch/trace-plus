import { Aggregate, TreeGridComponent } from "@syncfusion/ej2-react-treegrid";
import _ from 'lodash'
import { CompContentContainer } from "../../../controls/components/comp-content-container";
import { WidgetButtonRefresh } from "../../../controls/widgets/widget-button-refresh";
import { AggregateColumnDirective, AggregateColumnsDirective, AggregateDirective, AggregatesDirective, ColumnDirective, ColumnsDirective, Inject, Toolbar } from "@syncfusion/ej2-react-grids";
import { FinalAccountsType, setTrialBalance, trialBalanceSelectorFn } from "../accounts-slice";
import { useDispatch, useSelector } from "react-redux";
import { AccSettingType, BusinessUnitType, currentBusinessUnitSelectorFn, LoginType, UserDetailsType } from "../../login/login-slice";
import { Utils } from "../../../utils/utils";
import { AppDispatchType } from "../../../app/store/store";
import { GraphQLQueriesMap, GraphQLQueryArgsType } from "../../../app/graphql/maps/graphql-queries-map";
import { useEffect } from "react";
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container";
import { CompSyncFusionGridToolbar } from "../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";

export function TrialBalance() {
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn) || {}
    const { dbName, decodedDbParamsObject, isExternalDb } = userDetails
    const dispatch: AppDispatchType = useDispatch()
    const trialBalanceData: FinalAccountsType[] | undefined = useSelector(trialBalanceSelectorFn)

    useEffect(() => {
        loadData()
    }, [])

    return (
        <CompAccountsContainer>
            <div className='flex gap-8' style={{ width: 'calc(100vw - 260px)' }}>
                <div className='flex flex-col w-min'>
                    <CompSyncFusionGridToolbar className='' 
                        title='Trial Balance'
                        isLastNoOfRows={false}
                        instance=""
                    />
                </div>
            </div>
        </CompAccountsContainer>
    )

    // return (<CompContentContainer title='Trial balance'
    //     CustomControl={() => <WidgetButtonRefresh handleRefresh={async () => await loadData()} />}>
    //     {getContent()}
    // </CompContentContainer>)

    function getContent() {
        return (<div>
            <TreeGridComponent
                dataSource={trialBalanceData}
                childMapping="children"
                treeColumnIndex={0}
            // toolbar={['Search']}
            >
                <ColumnsDirective>
                    {/* <ColumnDirective field="accCode" headerText="Account Code" width="120" textAlign="Left" /> */}
                    <ColumnDirective field="accName" headerText="Account Name" width="200" textAlign="Left" />
                    <ColumnDirective field="accType" headerText="Account Type" width="100" textAlign="Left" />
                    <ColumnDirective field="opening" headerText="Opening Balance" width="150" textAlign="Right" format="N2" />
                    <ColumnDirective field="debit" headerText="Debit" width="100" textAlign="Right" format="N2" />
                    <ColumnDirective field="credit" headerText="Credit" width="100" textAlign="Right" format="N2" />
                    <ColumnDirective field="closing" headerText="Closing Balance" width="150" textAlign="Right" format="N2" />
                </ColumnsDirective>
                {/* <AggregatesDirective>
                <AggregateDirective>
                    <AggregateColumnsDirective>
                        <AggregateColumnDirective
                            field="debit"
                            type="Sum"
                            format="N2"
                            footerTemplate="Total Debit: {Sum}"
                        />
                        <AggregateColumnDirective
                            field="credit"
                            type="Sum"
                            format="N2"
                            footerTemplate="Total Credit: {Sum}"
                        />
                    </AggregateColumnsDirective>
                </AggregateDirective>
            </AggregatesDirective> */}
                <Inject services={[Aggregate]} />
            </TreeGridComponent>
        </div>)
    }



    async function loadData() {
        const args: GraphQLQueryArgsType = {
            buCode: currentBusinessUnit.buCode,
            dbParams: isExternalDb ? decodedDbParamsObject : undefined,
            sqlArgs: {
                branchId: 1,
                finYearId: 2024
            }
        }
        try {
            const res: any = await Utils.queryGraphQL(
                GraphQLQueriesMap.trialBalance(dbName || '', args), GraphQLQueriesMap.trialBalance.name
            )
            if (res?.data?.trialBalance) {
                dispatch(setTrialBalance(res.data))
            }
        } catch (e: any) {
            console.log(e?.message)
        }
    }
}