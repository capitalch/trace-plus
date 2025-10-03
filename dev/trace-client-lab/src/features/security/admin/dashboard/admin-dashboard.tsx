// import { useEffect } from "react";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { WidgetButtonRefresh } from "../../../../controls/widgets/widget-button-refresh";
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator";
import { AdminDashBoardType, useAdminDashBoard } from "./admin-dashboard-hook";
import { Utils } from "../../../../utils/utils";

export function AdminDashBoard() {
    const { loadData, loading, adminDashBoard }: { loadData: any, loading: boolean, adminDashBoard: AdminDashBoardType } = useAdminDashBoard()

    return (
        <CompContentContainer title='Admin dashboard' CustomControl={AdminDashBoardCustomControl}>
            {loading ? <WidgetLoadingIndicator /> : getContent()}
        </CompContentContainer>
    )

    function getContent() {
        return (<div className="flex items-start justify-between mt-8 gap-8">
            {/* Misc */}
            <div className="flex flex-col p-4 w-60 h-40 font-sans text-black text-sm bg-primary-100 gap-2">
                <label className="font-bold text-lg">Counts</label>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Business units</label>
                    <label>{adminDashBoard.counts.businessUnits}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Roles</label>
                    <label>{adminDashBoard.counts.roles}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Business users</label>
                    <label>{adminDashBoard.counts.businessUsers}</label>
                </span>
            </div>
            <WidgetButtonRefresh handleRefresh={async () => await loadData()} />
        </div>)
    }

    function AdminDashBoardCustomControl() {
        return (
            <div className="flex items-center">                
                <label className="text-primary-300">{Utils.getUserDetails()?.clientName}</label>
            </div>
        )
    }
}

