import { useEffect } from "react";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { WidgetButtonRefresh } from "../../../../controls/widgets/widget-button-refresh";
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator";
import { AdminDashBoardType, useAdminDashBoard } from "./admin-dashboard-hook";
import { Utils } from "../../../../utils/utils";

export function AdminDashBoard() {
    const { loadData, loading, adminDashBoard }: { loadData: any, loading: boolean, adminDashBoard: AdminDashBoardType } = useAdminDashBoard()

    useEffect(() => {
        return (() => {
            console.log('Closing up')
        })
    }, [])
    return (
        <CompContentContainer title='Admin dashboard' CustomControl={AdminDashBoardCustomControl}>
            {loading ? <WidgetLoadingIndicator /> : getContent()}
        </CompContentContainer>
    )

    function getContent() {
        return (<div className="flex justify-between items-start gap-8 mt-8">
            {/* Misc */}
            <div className="flex h-40 w-60 flex-col gap-2 bg-primary-100 p-4 font-sans text-sm text-black">
                <label className="text-lg font-bold">Counts</label>
                <span className="flex justify-between">
                    <label className="text-sm font-normal">Business units</label>
                    <label>{adminDashBoard.counts.businessUnits}</label>
                </span>
                <span className="flex justify-between">
                    <label className="text-sm font-normal">Roles</label>
                    <label>{adminDashBoard.counts.roles}</label>
                </span>
                <span className="flex justify-between">
                    <label className="text-sm font-normal">Business users</label>
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

