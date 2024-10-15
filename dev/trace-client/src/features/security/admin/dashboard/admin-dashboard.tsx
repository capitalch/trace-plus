import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { WidgetButtonRefresh } from "../../../../controls/widgets/widget-button-refresh";
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator";
import { AdminDashBoardType, useAdminDashBoard } from "./admin-dashboard-hook";

export function AdminDashBoard(){
    const { loadData, loading,  }: { loadData: any, loading: boolean, adminDashBoard: AdminDashBoardType } = useAdminDashBoard()
    return (
        <CompContentContainer title='Admin dashboard' CustomControl={() => <WidgetButtonRefresh handleRefresh={async () => await loadData()} />}>
            {loading ? <WidgetLoadingIndicator /> : getContent()}
        </CompContentContainer>
    )

    function getContent(){
        return (<div className="flex flex-wrap gap-8 mt-8">Content</div>)
    }
}