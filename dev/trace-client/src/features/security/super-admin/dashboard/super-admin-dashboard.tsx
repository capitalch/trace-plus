import { CompContentContainer } from "../../../../controls/components/comp-content-container"
import { WidgetButtonRefresh } from "../../../../controls/widgets/widget-button-refresh"
import { WidgetLoadingIndicator } from "../../../../controls/widgets/widget-loading-indicator"
import { SuperAdminDashBoardType, useSuperAdminDashBoard } from "./super-admin-dashboard-hook"

export function SuperAdminDashboard() {
    const { loadData, loading, superAdminDashBoard }: { loadData: any, loading: boolean, superAdminDashBoard: SuperAdminDashBoardType } = useSuperAdminDashBoard()

    return (
        <CompContentContainer title='Super admin dashboard' CustomControl={() => <WidgetButtonRefresh handleRefresh={async () => await loadData()} />}>
            {loading ? <WidgetLoadingIndicator /> : getContent()}
        </CompContentContainer>
    )

    function getContent() {

        return (<div className="flex flex-wrap mt-8 gap-8">

            {/* Database connections */}
            <div className="flex flex-col p-4 w-60 h-40 font-sans text-black text-sm bg-primary-100 gap-2">
                <label className="font-bold text-lg">Database connections</label>
                <span className="flex justify-between">
                    <label className="">Active</label>
                    <label>{superAdminDashBoard.dbConnections.active}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Idle</label>
                    <label>{superAdminDashBoard.dbConnections.idle}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Total</label>
                    <label>{superAdminDashBoard.dbConnections.total}</label>
                </span>
            </div>

            {/* Clients */}
            <div className="flex flex-col p-4 w-60 h-40 font-sans text-black text-sm bg-primary-100 gap-2">
                <label className="font-bold text-lg">Clients</label>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Active</label>
                    <label>{superAdminDashBoard.clients.active}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Inactive</label>
                    <label>{superAdminDashBoard.clients.inactive}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Total</label>
                    <label>{superAdminDashBoard.clients.total}</label>
                </span>
            </div>

            {/* Admin users */}
            <div className="flex flex-col p-4 w-60 h-40 font-sans text-black text-sm bg-primary-100 gap-2">
                <label className="font-bold text-lg">Admin users</label>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Active</label>
                    <label>{superAdminDashBoard.adminUsers.active}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Inactive</label>
                    <label>{superAdminDashBoard.adminUsers.inactive}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Total</label>
                    <label>{superAdminDashBoard.adminUsers.total}</label>
                </span>
            </div>

            {/*Non  Admin users */}
            <div className="flex flex-col p-4 w-60 h-40 font-sans text-black text-sm bg-primary-100 gap-2">
                <label className="font-bold text-lg">Non admin users</label>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Active</label>
                    <label>{superAdminDashBoard.nonAdminUsers.active}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Inactive</label>
                    <label>{superAdminDashBoard.nonAdminUsers.inactive}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Total</label>
                    <label>{superAdminDashBoard.nonAdminUsers.total}</label>
                </span>
            </div>

            {/* Roles */}
            <div className="flex flex-col p-4 w-60 h-40 font-sans text-black text-sm bg-primary-100 gap-2">
                <label className="font-bold text-lg">Roles</label>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Super admin</label>
                    <label>{superAdminDashBoard.roles.superAdmin}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Admin</label>
                    <label>{superAdminDashBoard.roles.admin}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Total</label>
                    <label>{superAdminDashBoard.roles.total}</label>
                </span>
            </div>

            {/* Misc */}
            <div className="flex flex-col p-4 w-60 h-40 font-sans text-black text-sm bg-primary-100 gap-2">
                <label className="font-bold text-lg">Misc</label>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Databases</label>
                    <label>{superAdminDashBoard.misc.databasesCount}</label>
                </span>
                <span className="flex justify-between">
                    <label className="font-normal text-sm">Secured controls</label>
                    <label>{superAdminDashBoard.misc.securedControlsCount}</label>
                </span>
            </div>
        </div>)
    }
}
