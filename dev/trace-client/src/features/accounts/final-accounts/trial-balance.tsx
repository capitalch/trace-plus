import { Aggregate, TreeGridComponent } from "@syncfusion/ej2-react-treegrid";
import { CompContentContainer } from "../../../controls/components/comp-content-container";
import { WidgetButtonRefresh } from "../../../controls/widgets/widget-button-refresh";
import { WidgetLoadingIndicator } from "../../../controls/widgets/widget-loading-indicator";
import { useTrialBalance } from "./trial-balance-hook";
import { AggregateColumnDirective, AggregateColumnsDirective, AggregateDirective, AggregatesDirective, ColumnDirective, ColumnsDirective, Inject, Toolbar } from "@syncfusion/ej2-react-grids";

export function TrialBalance() {
    const { loadData, loading, selectedData } = useTrialBalance()

    return (<CompContentContainer title='Trial balance'
        CustomControl={() => <WidgetButtonRefresh handleRefresh={async () => await loadData()} />}>
        {loading ? <WidgetLoadingIndicator /> : getContent()}
    </CompContentContainer>)

    function getContent() {
        return (<div>
            <TreeGridComponent
                dataSource={selectedData}
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

}